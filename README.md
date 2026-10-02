# Open Library

A community library web app (browse/search, reservations-as-cart, lending, reviews, admin) with a full accessibility-focused UI.

Built phase-by-phase per [`Open_Library_Build_Guide.md`](./Open_Library_Build_Guide.md) — the single source of truth for scope, schema, and design tokens.

## Stack

- **Backend:** Node.js + Express, MongoDB (Mongoose), JWT auth (httpOnly cookie), Cloudinary (image upload)
- **Frontend:** React + Vite (SPA), Tailwind CSS, React Router, react-i18next
- **Deploy targets:** Render (server), Vercel (client), MongoDB Atlas, Cloudinary

## Project layout

```
OpenLib/
  server/   Express API
  client/   React app (Vite)
```

## Run locally

### Server

```bash
cd server
cp .env.example .env   # then fill in real values
npm install
npm run dev
```

Health check: `GET http://localhost:5000/health` → `{"status":"ok"}` (port from `.env`, default 5000).

### Client

```bash
cd client
npm install
npm run dev
```

Vite dev server prints its local URL (default http://localhost:5173).

## Environment

See [`server/.env.example`](./server/.env.example) for required variables. Never commit real secrets — `.env` is git-ignored.
