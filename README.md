# Credo

Single Next.js web app for the Credo fitness product — marketing site, blog, `/app` dashboard, and API routes backed by PostgreSQL + Prisma.

## Getting Started

1. Install dependencies (runs `prisma generate` via postinstall):
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```

3. Apply database migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Layout

- `src/app/` — marketing pages, blog, `/app` dashboard, and `/api` routes
- `src/components/` — UI, marketing, app, blog, shared components
- `src/lib/` — shared utilities, Prisma client, auth, validation
- `src/data/` — mock data for the dashboard
- `prisma/` — database schema and migrations
- `mcp-server/` — standalone MCP server (separate package)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/auth/me | Yes | Get profile |
| PUT | /api/auth/me | Yes | Update profile |
| GET | /api/workouts | Yes | List workouts |
| POST | /api/workouts | Yes | Save workout |
| GET | /api/scores | Yes | Get score history |
| POST | /api/scores | Yes | Save score snapshot |
| POST | /api/sync | Yes | Full data sync |
