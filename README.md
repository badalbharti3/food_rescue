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

### Deploy backend to Render

The backend needs a hosted MongoDB database, such as MongoDB Atlas.

1. Create a MongoDB Atlas cluster and allow network access from Render (`0.0.0.0/0`), then copy its connection string.
2. On Render, choose **New > Blueprint**, connect this repository, and apply `render.yaml`.
3. Set the secret values when Render asks:
   - `MONGO_URI`: the MongoDB Atlas connection string
   - `JWT_SECRET`: a long random secret (at least 32 characters)
   - `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`: the initial admin account
4. After deployment, test `https://your-render-service.onrender.com/api/v1/health`.
5. In GitHub repository **Settings > Secrets and variables > Actions > Variables**, set
   `VITE_API_URL` to `https://your-render-service.onrender.com/api/v1`, then rerun the Pages workflow.

Keep the Render service URL in `CLIENT_URL` without a trailing slash. Do not commit `server/.env`.

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
