# credo-mcp-server

A standalone MCP (Model Context Protocol) server exposing Credo fitness data
— user profile, workout history, 1RMs, personal records, score snapshots,
training program, and exercise-library search — as MCP tools over stdio. It
has its own `package.json`, `node_modules`, and build (`tsc` → `dist/`); it
is not part of the Next.js app's build or dev server.

## Prisma schema: synced copy, not a fork

This package needs its own generated Prisma Client (its own
`node_modules/@prisma/client`), so it keeps its own
[`prisma/schema.prisma`](./prisma/schema.prisma). That file is a **synced
copy** of the root [`../prisma/schema.prisma`](../prisma/schema.prisma),
which remains the single source of truth for the data model. The root
schema is a strict superset of what this server queries (`User`, `Workout`,
`Exercise1RM`, `PersonalRecord`, `ScoreSnapshot`, `UserProgram` — see
`src/index.ts`), so copying it in full keeps this package simple to install
while eliminating schema drift.

**After changing the root schema**, resync this copy before generating a
client here:

```bash
cd mcp-server
npm run sync:schema   # copies ../prisma/schema.prisma over prisma/schema.prisma
npm run db:generate   # regenerates the Prisma Client from the synced copy
```

Do not hand-edit `mcp-server/prisma/schema.prisma` — edit the root schema
and resync instead, or the two will drift again.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run the server with `tsx` (no build step) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/index.js`) |
| `npm run db:generate` | Regenerate the Prisma Client from `prisma/schema.prisma` |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run sync:schema` | Copy `../prisma/schema.prisma` (root, source of truth) over `prisma/schema.prisma` |

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (same database as the main app) |
| `CREDO_USER_EMAIL` | Default user email for tools that don't pass `user_email` explicitly |

See `.env.example`.
