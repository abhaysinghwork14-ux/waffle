# The Waffle Pop Co - Pop Points Loyalty App

## Original Problem Statement
Build a Credit-Based Web App (QSR Loyalty App) for "The Waffle Pop Co" - a waffle and pancake outlet.

## Latest Updates (Jan 2025)
- **Database**: Migrated from MongoDB to **Supabase PostgreSQL**
- **Admin**: Added "Add User" tab with name and initial points input
- **Redeem Store**: Disabled purchase buttons (display only for now)
- **Game**: Changed from Perfect 10 to **Perfect 5** (5 second target)
- **Game UI**: Fixed text visibility with light background

## User Personas
1. **Customers**: Regular patrons who earn Pop Points through purchases
2. **Admin/Staff**: Manages user creation, point allocation, and redemption verification

## Core Requirements
- Customer login with name only
- Admin login with password (1607)
- Admin adds users and points
- Game is for fun only (no points earned)
- Brand: The Waffle Pop Co, Points: Pop Points

## What's Been Implemented

### Database (Supabase PostgreSQL)
- `users` table: id, name, current_points, lifetime_points, created_at
- `redemptions` table: reward codes, claim status
- `point_transactions` table: audit trail

### Backend (FastAPI)
- User registration/login endpoints
- Admin authentication
- **Admin create user with initial points** (NEW)
- Points management
- Rewards catalog (5 tiers - display only)
- Leaderboard ranked by lifetime points

### Frontend (React)
- Customer Login page
- Customer Dashboard
- **Redeem Store (view only, no purchase buttons)**
- **Perfect 5 Game (5 second target, visible text)**
- Hall of Fame Leaderboard
- Admin Dashboard with:
  - **Add User tab (name + points)**
  - Add Points tab
  - Redemption Tracker
  - All Members view

### Reward Tiers (Display Only)
1. Tier 1: 200pts → 10% Off Voucher
2. Tier 2: 400pts → Free Triangle Waffle
3. Tier 3: 500pts → Popsicle Waffle
4. Tier 4: 600pts → 6pc Pancake Stack
5. Tier 5: 800pts → Premium Choice

## Supabase Configuration
- Project URL: https://pgxnhpikhgaxvczastny.supabase.co
- Connection: Transaction Pooler (port 6543)
- Region: ap-south-1

## Next Tasks
1. Enable redemption feature when ready
2. Add points transaction history for customers
3. Add QR code for high-value rewards
4. Push notifications for points updates
