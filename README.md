# CanGo — Learn German for Real Life

A PWA for learning German through realistic scenarios for life in Germany.

## Setup

### 1. Environment Variables

```bash
cp .env.local .env
```

Fill in your Supabase credentials in `.env`:

- `DATABASE_URL` — Postgres connection string (Supabase)
- `AUTH_SECRET` — Generate with `npx auth secret`
- `AUTH_URL` — `http://localhost:3000`

### 2. Install Dependencies

```bash
npm install
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Seed Content Data

```bash
npm run seed
```

> The seed script is idempotent — it can be run multiple times without errors.
> Existing experiences are updated in place, preserving user progress data.

### 5. Generate Audio (Optional)

```bash
bash scripts/generate-audio.sh
```

### 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth

- Sign up / Log in with email + password via `/auth`
- Credentials are stored in Supabase `users` table with bcrypt-hashed passwords
- Protected routes redirect to `/auth` if unauthenticated

## Tech Stack

- Next.js 16, TypeScript, Tailwind CSS v4
- Drizzle ORM + Supabase Postgres
- NextAuth.js v5 (Credentials provider)
- Dexie.js (offline IndexedDB cache)
- Web Speech API / edge-tts (audio)
- PWA (manifest, service worker)
