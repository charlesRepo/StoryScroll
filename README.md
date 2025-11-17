StoryScroll

Quick start for local development.

Prerequisites
- Node 18.18+ or 20.9+
- Neon Postgres (free tier is fine)

Setup
- Install dependencies: `npm install`
- Create a Neon database and copy the SSL URL
- In Neon SQL Editor: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Create `.env` (see `.env.example`):
  - `DATABASE_URL=postgres://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`
  - `SESSION_SECRET=<long-random-string>`
  - Optional: `OPENAI_API_KEY=sk-...`, `PORT=3000`
- Create tables: `npm run db:push`

Run
- Development: `npm run dev`
- Production: `npm run build && npm run start`
- App URL: `http://localhost:${PORT || 3000}` (set `PORT` to avoid conflicts)

Notes
- First start with an empty DB seeds ~120 curated stories automatically.
- Logs are written under `logs/` (git-ignored).

Troubleshooting
- “DATABASE_URL must be set”: check `.env` and rebuild for prod.
- `gen_random_uuid()` missing: run the `pgcrypto` extension in Neon.
- Port in use: set `PORT=3000` in `.env`.
- Session cookie in local production: set `SESSION_COOKIE_SECURE=false` in `.env` when running `npm run start` over HTTP so login persists.

More
- Architecture and details: `ARCHITECTURE.md`
- Contributor guide: `AGENTS.md`

Production (Render)
- Live URL: https://storyscroll.onrender.com/
- Service: Web Service (Node 20)
- Build command: `npm ci && npm run db:push && npm run build`
- Start command: `npm run start`
- Env vars:
  - `DATABASE_URL` (Neon; include `?sslmode=require`)
  - `SESSION_SECRET` (long random string)
  - Optional: `OPENAI_API_KEY` (for AI generation)
- Database prep (once in Neon SQL editor): `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- First boot seeds ~120 curated stories automatically if the DB is empty.
