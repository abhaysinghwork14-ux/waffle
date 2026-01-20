from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import os
import logging
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

from database import get_db, engine, Base
from models import User, Redemption, PointTransaction

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== PYDANTIC MODELS ====================

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    current_points: int
    lifetime_points: int
    created_at: datetime

class UserCreate(BaseModel):
    name: str

class UserCreateWithPoints(BaseModel):
    name: str
    points: int = 0

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

class RedemptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    user_name: str
    reward_id: str
    reward_name: str
    points_spent: int
    reward_code: str
    claimed: bool
    created_at: datetime
    claimed_at: Optional[datetime]

class RedeemRequest(BaseModel):
    user_id: str
    reward_id: str

class MarkClaimedRequest(BaseModel):
    redemption_id: str

class PointTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    user_name: str
    points: int
    reason: str
    transaction_type: str
    created_at: datetime

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

@api_router.post("/users/register", response_model=UserResponse)
async def register_user(input: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists (case insensitive)
    result = await db.execute(
        select(User).where(func.lower(User.name) == input.name.lower())
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User with this name already exists")
    
    user = User(name=input.name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@api_router.post("/users/login", response_model=UserResponse)
async def login_user(input: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(func.lower(User.name) == input.name.lower())
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    return user

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.name))
    users = result.scalars().all()
    return users

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/login")
async def admin_login(input: AdminLogin):
    if input.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return {"success": True, "message": "Admin login successful"}

@api_router.post("/admin/create-user", response_model=UserResponse)
async def create_user_with_points(input: UserCreateWithPoints, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(
        select(User).where(func.lower(User.name) == input.name.lower())
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User with this name already exists")
    
    user = User(
        name=input.name,
        current_points=input.points,
        lifetime_points=input.points
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Log transaction if points > 0
    if input.points > 0:
        transaction = PointTransaction(
            user_id=user.id,
            user_name=user.name,
            points=input.points,
            reason="Initial Points",
            transaction_type="earned"
        )
        db.add(transaction)
        await db.commit()
    
    return user

@api_router.post("/admin/add-points")
async def add_points(input: AddPointsRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == input.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.current_points += input.points
    user.lifetime_points += input.points
    
    # Log transaction
    transaction = PointTransaction(
        user_id=user.id,
        user_name=user.name,
        points=input.points,
        reason=input.reason,
        transaction_type="earned"
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(user)
    
    return {"success": True, "user": UserResponse.model_validate(user)}

@api_router.get("/admin/transactions", response_model=List[PointTransactionResponse])
async def get_transactions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PointTransaction).order_by(PointTransaction.created_at.desc()).limit(500)
    )
    transactions = result.scalars().all()
    return transactions

# ==================== REWARDS ROUTES ====================

@api_router.get("/rewards", response_model=List[RewardItem])
async def get_rewards():
    return REWARDS_CATALOG

@api_router.post("/rewards/redeem")
async def redeem_reward(input: RedeemRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == input.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reward = next((r for r in REWARDS_CATALOG if r.id == input.reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if user.current_points < reward.points_required:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Deduct points
    user.current_points -= reward.points_required
    
    # Create redemption record
    reward_code = generate_reward_code(reward.name)
    redemption = Redemption(
        user_id=user.id,
        user_name=user.name,
        reward_id=reward.id,
        reward_name=reward.name,
        points_spent=reward.points_required,
        reward_code=reward_code
    )
    db.add(redemption)
    
    # Log transaction
    transaction = PointTransaction(
        user_id=user.id,
        user_name=user.name,
        points=reward.points_required,
        reason=f"Redeemed: {reward.name}",
        transaction_type="spent"
    )
    db.add(transaction)
    
    await db.commit()
    
    return {
        "success": True,
        "reward_code": reward_code,
        "reward_name": reward.name,
        "points_spent": reward.points_required,
        "remaining_points": user.current_points
    }

@api_router.get("/redemptions", response_model=List[RedemptionResponse])
async def get_redemptions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Redemption).order_by(Redemption.created_at.desc()).limit(500)
    )
    redemptions = result.scalars().all()
    return redemptions

@api_router.get("/redemptions/user/{user_id}", response_model=List[RedemptionResponse])
async def get_user_redemptions(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Redemption)
        .where(Redemption.user_id == user_id)
        .order_by(Redemption.created_at.desc())
        .limit(100)
    )
    redemptions = result.scalars().all()
    return redemptions

@api_router.post("/redemptions/mark-claimed")
async def mark_claimed(input: MarkClaimedRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Redemption).where(Redemption.id == input.redemption_id))
    redemption = result.scalar_one_or_none()
    if not redemption:
        raise HTTPException(status_code=404, detail="Redemption not found")
    
    redemption.claimed = True
    redemption.claimed_at = datetime.now(timezone.utc)
    await db.commit()
    
    return {"success": True, "message": "Redemption marked as claimed"}

# ==================== LEADERBOARD ROUTES ====================

@api_router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(User.lifetime_points.desc()).limit(50)
    )
    users = result.scalars().all()
    leaderboard = []
    for idx, user in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "name": user.name,
            "lifetime_points": user.lifetime_points,
            "user_id": user.id
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
