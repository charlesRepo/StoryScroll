# Repository Guidelines

## Project Structure & Module Organization
- `client/`: React + TypeScript (Vite) UI.
- `server/`: Express API and services (`index.ts`, `routes.ts`, `storage.ts`).
- `shared/`: Cross‑shared types and Drizzle schema (`schema.ts`).
- `dist/`: Production build output (client assets in `dist/public`, server bundle in `dist/index.js`).
- `scripts/`: One‑off data generation/migration helpers.
- Root config: `drizzle.config.ts`, `tailwind.config.ts`, `vite.config.ts`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run db:push`: Apply Drizzle schema to the database.
- `npm run dev`: Start Express + Vite in development.
- `npm run build`: Build client and server bundles to `dist/`.
- `npm run start`: Run production server from `dist/index.js`.

Environment
- Create `.env` (see `.env.example`). Required: `DATABASE_URL`, `SESSION_SECRET`. Optional: `OPENAI_API_KEY`, `PORT`.
- PostgreSQL (Neon): ensure `CREATE EXTENSION IF NOT EXISTS pgcrypto;` has been run.

## Coding Style & Naming Conventions
- Language: TypeScript (Node 18+/20+). Keep types explicit for API boundaries.
- Style: Follow existing code style (2‑space indent, single quotes, concise functions). Keep modules small and purpose‑focused.
- Naming: `kebab-case` files, `camelCase` variables/functions, `PascalCase` React components.

## Testing Guidelines
- No formal test suite yet. When adding tests:
  - Use Vitest or Jest; place tests near sources or under `__tests__/`.
  - Name files `*.test.ts(x)` and prefer fast, isolated unit tests.
  - Avoid coupling tests to external services; mock OpenAI/DB when possible.

## Commit & Pull Request Guidelines
- Commits: Imperative, concise subject; explain “what/why”.
  - Examples: `feat(server): add session-backed auth`, `fix(ui): correct language filter state`.
- PRs: Include a clear summary, rationale, screenshots (UI), and steps to verify.
  - Link related issues. Note any schema changes and required env/config updates.

## Security & Configuration Tips
- Secrets live in `.env`; never commit them. `.env` is git‑ignored.
- Database is cloud‑hosted (Neon). Ensure `?sslmode=require` in `DATABASE_URL`.
- Sessions persist via Postgres (`connect-pg-simple`); set a strong `SESSION_SECRET`.

## Architecture Overview
- API uses Drizzle ORM with Neon serverless driver; schema in `shared/schema.ts`.
- On first run with an empty DB, `initialize-stories` seeds ~120 curated stories.
- UI consumes `/api/*` endpoints and caches via React Query.
