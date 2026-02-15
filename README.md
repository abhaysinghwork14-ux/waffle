# The Waffle Pop Co - Pop Points Loyalty App

## Deployment Guide

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Local Development

```bash
# Clone the repo
git clone <your-repo-url>
cd <repo-name>

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=your_supabase_connection_string
CORS_ORIGINS=*
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

### Deployment

**Backend → Render.com (Free)**
1. Connect GitHub repo
2. Select `backend` folder as root
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Frontend → Vercel (Free)**
1. Connect GitHub repo
2. Select `frontend` folder as root
3. Add env variable: `REACT_APP_BACKEND_URL`

## Features
- Customer loyalty points system
- 5-tier reward catalog
- Admin dashboard
- Perfect 5 Game
- Leaderboard
