from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    current_points: int = 0
    lifetime_points: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    name: str

class UserLogin(BaseModel):
    name: str

class AdminLogin(BaseModel):
    password: str

class AddPointsRequest(BaseModel):
    user_id: str
    points: int
    reason: Optional[str] = "Purchase"

class RewardItem(BaseModel):
    id: str
    name: str
    description: str
    points_required: int
    tier: int
    image_url: str

class Redemption(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    reward_id: str
    reward_name: str
    points_spent: int
    reward_code: str
    claimed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    claimed_at: Optional[str] = None

class RedeemRequest(BaseModel):
    user_id: str
    reward_id: str

class MarkClaimedRequest(BaseModel):
    redemption_id: str

class PointTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    points: int
    reason: str
    transaction_type: str  # "earned" or "spent"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== REWARDS CATALOG ====================

REWARDS_CATALOG = [
    RewardItem(
        id="reward_1",
        name="10% Off Voucher",
        description="Get 10% off on your next purchase",
        points_required=200,
        tier=1,
        image_url="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"
    ),
    RewardItem(
        id="reward_2",
        name="Free Triangle Waffle",
        description="A delicious crispy triangle waffle",
        points_required=400,
        tier=2,
        image_url="https://images.unsplash.com/photo-1600713531223-aab27a01bb69?w=400&q=80"
    ),
    RewardItem(
        id="reward_3",
        name="Popsicle Waffle",
        description="Waffle on a stick - perfect for on-the-go!",
        points_required=500,
        tier=3,
        image_url="https://images.unsplash.com/photo-1740072625684-46f4f1f594d8?w=400&q=80"
    ),
    RewardItem(
        id="reward_4",
        name="6pc Pancake Stack",
        description="Six fluffy pancakes with your choice of topping",
        points_required=600,
        tier=4,
        image_url="https://images.unsplash.com/photo-1575831967553-771b0db4f7c1?w=400&q=80"
    ),
    RewardItem(
        id="reward_5",
        name="Premium Choice",
        description="Choice of any Waffle OR 10pc Pancake",
        points_required=800,
        tier=5,
        image_url="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80"
    ),
]

ADMIN_PASSWORD = "1607"

def generate_reward_code(reward_name: str) -> str:
    prefix = ''.join(c for c in reward_name.upper() if c.isalpha())[:6]
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{suffix}"

# ==================== USER ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "The Waffle Pop Co API"}

@api_router.post("/users/register", response_model=User)
async def register_user(input: UserCreate):
    # Check if user already exists
    existing = await db.users.find_one({"name": {"$regex": f"^{input.name}$", "$options": "i"}}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="User with this name already exists")
    
    user = User(name=input.name)
    doc = user.model_dump()
    await db.users.insert_one(doc)
    return user

@api_router.post("/users/login", response_model=User)
async def login_user(input: UserLogin):
    user = await db.users.find_one({"name": {"$regex": f"^{input.name}$", "$options": "i"}}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users", response_model=List[User])
async def get_all_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/login")
async def admin_login(input: AdminLogin):
    if input.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return {"success": True, "message": "Admin login successful"}

@api_router.post("/admin/add-points")
async def add_points(input: AddPointsRequest):
    user = await db.users.find_one({"id": input.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_current = user["current_points"] + input.points
    new_lifetime = user["lifetime_points"] + input.points
    
    await db.users.update_one(
        {"id": input.user_id},
        {"$set": {"current_points": new_current, "lifetime_points": new_lifetime}}
    )
    
    # Log transaction
    transaction = PointTransaction(
        user_id=input.user_id,
        user_name=user["name"],
        points=input.points,
        reason=input.reason,
        transaction_type="earned"
    )
    await db.transactions.insert_one(transaction.model_dump())
    
    updated_user = await db.users.find_one({"id": input.user_id}, {"_id": 0})
    return {"success": True, "user": updated_user}

@api_router.get("/admin/transactions", response_model=List[PointTransaction])
async def get_transactions():
    transactions = await db.transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return transactions

# ==================== REWARDS ROUTES ====================

@api_router.get("/rewards", response_model=List[RewardItem])
async def get_rewards():
    return REWARDS_CATALOG

@api_router.post("/rewards/redeem")
async def redeem_reward(input: RedeemRequest):
    user = await db.users.find_one({"id": input.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reward = next((r for r in REWARDS_CATALOG if r.id == input.reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if user["current_points"] < reward.points_required:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Deduct points
    new_points = user["current_points"] - reward.points_required
    await db.users.update_one(
        {"id": input.user_id},
        {"$set": {"current_points": new_points}}
    )
    
    # Create redemption record
    reward_code = generate_reward_code(reward.name)
    redemption = Redemption(
        user_id=input.user_id,
        user_name=user["name"],
        reward_id=reward.id,
        reward_name=reward.name,
        points_spent=reward.points_required,
        reward_code=reward_code
    )
    await db.redemptions.insert_one(redemption.model_dump())
    
    # Log transaction
    transaction = PointTransaction(
        user_id=input.user_id,
        user_name=user["name"],
        points=reward.points_required,
        reason=f"Redeemed: {reward.name}",
        transaction_type="spent"
    )
    await db.transactions.insert_one(transaction.model_dump())
    
    return {
        "success": True,
        "reward_code": reward_code,
        "reward_name": reward.name,
        "points_spent": reward.points_required,
        "remaining_points": new_points
    }

@api_router.get("/redemptions", response_model=List[Redemption])
async def get_redemptions():
    redemptions = await db.redemptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return redemptions

@api_router.get("/redemptions/user/{user_id}", response_model=List[Redemption])
async def get_user_redemptions(user_id: str):
    redemptions = await db.redemptions.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return redemptions

@api_router.post("/redemptions/mark-claimed")
async def mark_claimed(input: MarkClaimedRequest):
    redemption = await db.redemptions.find_one({"id": input.redemption_id}, {"_id": 0})
    if not redemption:
        raise HTTPException(status_code=404, detail="Redemption not found")
    
    await db.redemptions.update_one(
        {"id": input.redemption_id},
        {"$set": {"claimed": True, "claimed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Redemption marked as claimed"}

# ==================== LEADERBOARD ROUTES ====================

@api_router.get("/leaderboard")
async def get_leaderboard():
    users = await db.users.find({}, {"_id": 0}).sort("lifetime_points", -1).to_list(50)
    leaderboard = []
    for idx, user in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "name": user["name"],
            "lifetime_points": user["lifetime_points"],
            "user_id": user["id"]
        })
    return leaderboard

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
