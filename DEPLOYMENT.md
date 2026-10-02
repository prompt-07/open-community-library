# Deployment Guide

Stack: **Vercel** (frontend) · **Render** (backend) · **MongoDB Atlas** (database) · **Cloudinary** (images).

There's a chicken-and-egg between the two URLs, so follow this order.

## 1. MongoDB Atlas
1. Create a free **M0** cluster.
2. **Network Access** → allow `0.0.0.0/0` (any IP) so Render can connect.
3. **Database Access** → create a DB user; copy the **connection string** (`mongodb+srv://…/openlibrary`).

## 2. Backend on Render
1. New → **Blueprint**, connect the GitHub repo. Render reads [`render.yaml`](./render.yaml) and creates the `open-library-api` service (free plan, `rootDir: server`).
2. Set these environment variables (dashboard → Environment), the ones marked `sync: false`:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_ORIGIN` = leave blank for now (set in step 4)
   - (`NODE_ENV=production`, `MAX_RESERVATIONS_PER_SESSION`, `OVERDUE_GRACE_DAYS` come from the blueprint)
3. Deploy. Confirm `https://<your-app>.onrender.com/health` returns `{"status":"ok"}`.
4. Note the Render URL — you need it for Vercel.

## 3. Frontend on Vercel
1. New Project → import the GitHub repo.
2. **Root Directory** = `client`. Framework preset: **Vite** (auto-detected).
3. Environment variable:
   - `VITE_API_BASE` = `https://<your-render-app>.onrender.com/api`
4. Deploy. Note the Vercel URL (e.g. `https://open-community-library.vercel.app`).

## 4. Close the loop (CORS)
1. Back in Render → set `CLIENT_ORIGIN` = your exact Vercel URL (no trailing slash).
2. Trigger a redeploy. CORS now allows only that origin, and cross-site login cookies work.

## 5. Seed the production database (one-time)
From a machine with the Atlas URI in `server/.env`:
```bash
cd server && node src/seed.js
```
This creates the sample books + the admin account (`admin@openlibrary.local` / `admin123` — **change this password** for a real deployment).

## Verify live
- Register → login → browse → add to cart → confirm reservation
- Admin login → upload a book cover (Cloudinary) → image renders
- `/health` responds on the Render URL

## Notes
- Render free tier spins down after ~15 min idle (first request is slow). Upgrade to Starter (~$7/mo) to keep it always-on.
- Secrets live only in the Render/Vercel dashboards and local `.env` files — never committed.
