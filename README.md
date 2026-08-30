# Credo

Credo is a longevity-focused fitness app built around four pillars —
**strength, stability, cardio, and nutrition** — unified by a single, composite
**Credo Score**. It replaces an earlier native iOS app: this is now the whole
product, one Next.js codebase covering the marketing site, blog, and the
authenticated `/app` experience (dashboard, adaptive workout player, Credo
Ten benchmarks, scores, protein/cardio/stability tracking, onboarding). The
adaptive training engine generates and adjusts workouts in real time from a
user's logged performance, recovery state, goals, and available equipment —
see `PRD-adaptive-training-engine.md` for the full design.

## Architecture

- **Next.js 16 App Router, React 19, TypeScript (strict)** — one app serving
  the marketing site, blog, `/app` product, and `/api` routes.
- **PostgreSQL + Prisma** — persistence for users, workouts, exercise logs,
  scores, benchmarks, and the adaptive-engine tables (see
  `prisma/schema.prisma`).
- **Pure training engines** — `src/services/ai/` implements workout
  generation, weight recommendation, autoregulation, recovery tracking, and
  score calculation as dependency-injected, side-effect-free functions (no DB
  or fetch calls, deterministic given the same inputs + clock). Covered by
  `vitest` unit tests in `src/services/ai/__tests__/`.
- **Seed / reference data** — `src/services/data/` holds the exercise
  library, strength standards, benchmark definitions, food database, and
  program templates that back the engines and the database seed script.
  `src/data/` holds separate mock data still used by the marketing site and
  blog.
- **Auth** — email/password with a JWT session cookie (`credo_session`),
  checked in `src/middleware.ts` for `/app`, `/onboarding`, and `/api` routes.
- **AI coach** — powered by the Anthropic API (`ANTHROPIC_API_KEY`); coach
  conversations are persisted via the `CoachThread` / `CoachMessage` models.
- **PWA** — installable, offline-safe workout logging. In-progress workouts
  are mirrored to `localStorage` as you log sets (see
  `src/app/app/workout/page.tsx`) so a dropped connection at the gym never
  loses a set; `public/sw.js` is a hand-written service worker (network-first
  for pages with an `/offline` fallback, cache-first for static assets,
  network-only for `/api/*`) registered by
  `src/components/pwa/service-worker-registration.tsx`.
- **`mcp-server/`** — a separate, standalone package (own `package.json`,
  Prisma client, and MCP SDK dependency) exposing Credo data over the Model
  Context Protocol. Not part of the Next.js build. It keeps its own
  `prisma/schema.prisma` so it can generate its own client, but that file is
  a synced copy of the root schema (`npm run sync:schema` inside
  `mcp-server/`) — the root `prisma/schema.prisma` stays the single source
  of truth; see `mcp-server/README.md`.

## Getting Started

```bash
# 1. Install dependencies (runs `prisma generate` via postinstall)
npm install

# 2. Copy the env template and fill in real values
cp .env.example .env

# 3. Apply database migrations
npm run prisma:migrate

# 4. Seed reference data (exercise library, strength standards, etc.)
npx prisma db seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Marketing pages are
public; `/app/*` and `/onboarding` require a signed-in session.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm test` | Run the vitest suite once |
| `npm run test:watch` | Run vitest in watch mode |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations (dev) |
| `npm run prisma:seed` | Seed the database (`prisma/seed.ts`) |

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign/verify the session cookie |
| `ANTHROPIC_API_KEY` | Anthropic API key for the AI coach |

## API Surface

Full auth (`/api/auth/*`) and adaptive-training routes live under
`src/app/api/`. Grouped, non-exhaustive summary:

| Group | Examples | Notes |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/logout`, `GET/PUT /api/auth/me` | Register/login set the `credo_session` cookie |
| Onboarding | `POST /api/onboarding/complete` | Captures goals, equipment, preferences |
| Workouts | `GET /api/workouts/today`, `POST /api/workouts/generate`, `POST /api/workouts/[id]/start`, `PUT /api/workouts/[id]/customize`, `POST /api/workouts/[id]/complete`, `GET /api/workouts/history`, `GET /api/workouts/week` | Drives the adaptive workout player |
| Scores | `GET /api/scores`, `/current`, `POST /api/scores/recalculate`, `GET /api/scores/strength` | Credo Score + per-pillar subscores |
| Benchmarks | `GET /api/benchmarks`, `POST /api/benchmarks/log` | The Credo Ten |
| Exercises | `GET /api/exercises`, `GET /api/exercises/[id]` | Exercise library lookups |
| Recovery | `GET /api/recovery` | Muscle-group recovery / fatigue state |
| User | `GET/PUT /api/user/preferences`, `/api/user/gym-profiles`, `/api/user/gym-profiles/[id]` | Training preferences and gym equipment profiles |
| Sync | `POST /api/sync` | Legacy full-data-sync contract |

`/api/*` routes require a structurally valid session token (cookie or Bearer)
except the public auth and `/api/share` routes — see `src/middleware.ts`.

## Directory Layout

```
src/
  app/            marketing pages, blog, /app product, /api routes
  components/     ui / marketing / app / blog / pwa / shared components
  lib/            shared utilities — Prisma client, auth, session, validation
  services/
    ai/           pure adaptive-training engines + vitest tests
    data/         exercise library, strength standards, program templates
  data/            mock data still used by the marketing site and blog
prisma/            schema, migrations, seed script
mcp-server/         standalone MCP server package (separate deps/build)
public/            static assets, PWA manifest, icons, service worker
```

## More

- Product spec and phased implementation plan:
  [`PRD-adaptive-training-engine.md`](./PRD-adaptive-training-engine.md)
- `mcp-server/` ships its own README-equivalent context in
  `mcp-server/package.json` and `mcp-server/src` — treat it as an
  independent package with its own install/build/migrate cycle.
