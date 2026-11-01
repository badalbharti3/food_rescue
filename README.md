# FreshRoute

Smart food donation, redistribution & waste reduction platform (MERN).

## Setup

### Backend
```
cd server
cp .env.example .env
npm install
npm run dev
```
MongoDB must be running locally (default mongodb://127.0.0.1:27017/freshroute). Admin seeded on first start: admin@freshroute.local / Admin@12345.

### Frontend
```
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173 and proxies /api to backend http://localhost:5000.

## Key features
- Role-based auth (donor, receiver, admin)
- Donor food listings with quantity ledger
- NGO matching & requests
- Atomic allocation & quantity reservation
- Pickup OTP verification (partial collection supported)
- Additional quantity requests
- Expiry cron & safety incidents
- Notifications, audit logs, analytics
