# The Waffle Pop Co - Pop Points Loyalty App

## Original Problem Statement
Build a Credit-Based Web App (QSR Loyalty App) for "The Waffle Pop Co" - a waffle and pancake outlet. Features include:
- 5-tier Redeem Store with specific rewards
- Leaderboard/Hall of Fame
- Perfect 10 Game (baking theme)
- Admin dashboard for points management

## User Personas
1. **Customers**: Regular patrons who earn Pop Points through purchases and redeem for rewards
2. **Admin/Staff**: Manages point allocation and redemption verification

## Core Requirements
- Customer login with name only
- Admin login with password (1607)
- Admin adds points when customers purchase
- Game is for fun only (no points earned)
- Brand: The Waffle Pop Co, Points: Pop Points

## What's Been Implemented (Jan 2025)

### Backend (FastAPI)
- User registration/login endpoints
- Admin authentication
- Points management (add points to users)
- Rewards catalog with 5 tiers:
  - Tier 1: 200pts → 10% Off Voucher
  - Tier 2: 400pts → Free Triangle Waffle
  - Tier 3: 500pts → Popsicle Waffle
  - Tier 4: 600pts → 6pc Pancake Stack
  - Tier 5: 800pts → Premium Choice (Waffle OR 10pc Pancake)
- Redemption workflow with unique code generation
- Redemption tracking and claim status
- Leaderboard ranked by lifetime points

### Frontend (React)
- Customer Login page (name-based)
- Customer Dashboard with points display
- Redeem Store with food cards & conditional button states
- Perfect 10 Game (baking theme - stop at 10s)
- Hall of Fame Leaderboard
- Admin Login page (password protected)
- Admin Dashboard with:
  - Add Points to users
  - Redemption Tracker with "Mark as Claimed"
  - All Members view
- Bottom navigation for mobile UX

### Design
- Warm amber/orange color palette
- Fredoka (headings) + Quicksand (body) fonts
- Mobile-first responsive design
- Food imagery from Unsplash

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- ✅ Customer registration/login
- ✅ Admin points management
- ✅ 5-tier rewards with redemption
- ✅ Leaderboard

### P1 (Important)
- QR code scanning for 800pt rewards
- Push notifications for points updates
- Transaction history for customers

### P2 (Nice to have)
- Points expiry system
- Referral bonus program
- Birthday rewards
- Multiple admin accounts

## Next Tasks
1. Add QR code display for high-value redemptions (800pts)
2. Add points transaction history view for customers
3. Implement push notifications
4. Add admin ability to create custom promotions
