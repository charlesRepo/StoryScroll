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
- App URL: `http://localhost:${PORT || 5000}` (set `PORT` to avoid conflicts)

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
