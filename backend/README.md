# Credo Backend API

Next.js 14 backend with PostgreSQL, Prisma ORM, and JWT authentication for the Credo fitness app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure your database URL and JWT secret:
   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. API available at `http://localhost:3000/api`

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
