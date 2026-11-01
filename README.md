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

### Deploy frontend to GitHub Pages

GitHub Pages can host the Vite frontend only. Deploy the Express/MongoDB backend separately
(for example, on Render or Railway), then configure the repository variable
`VITE_API_URL` as the deployed API URL ending in `/api/v1`.

1. Open the repository on GitHub and go to **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.
3. Go to **Settings > Secrets and variables > Actions > Variables**, choose **New repository variable**, and add:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.example.com/api/v1`
4. Push to `main` or run **Deploy client to GitHub Pages** from the **Actions** tab.

The site will be available at `https://badalbharti3.github.io/food_rescue/`.

## Key features
- Role-based auth (donor, receiver, admin)
- Donor food listings with quantity ledger
- NGO matching & requests
- Atomic allocation & quantity reservation
- Pickup OTP verification (partial collection supported)
- Additional quantity requests
- Expiry cron & safety incidents
- Notifications, audit logs, analytics
