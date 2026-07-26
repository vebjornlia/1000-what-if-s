# 1000 What Ifs

An AI app that finds 1,000 real opportunities you'd never think to chase — and
writes the cold message for each one. You answer a short interview, the app
generates a deck of concrete people and organizations to reach out to, you
swipe through them Tinder-style, and the ones you keep get a best-guess contact
email discovered automatically so you can send from Gmail in one tap.

## How it works

1. **Onboarding interview** (`/onboarding`) — a warm AI chat learns who you are,
   then extracts a structured profile.
2. **Deck** (`/deck`) — the AI generates opportunities ("what-ifs") tailored to
   your profile. Swipe right to queue, left to skip.
3. **Email discovery** — queuing a card kicks off a background lookup that ranks
   likely contact emails and resolves the best one.
4. **Queue** (`/queue`) — review and edit each message, then open it prefilled
   in Gmail.
5. **Dashboard** (`/dashboard`) — charts of what you've generated, sent, and
   skipped.

## Tech stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** for styling, **framer-motion** for the swipe UI,
  **recharts** for the dashboard, **lucide-react** for icons
- **Supabase** for auth (email/password + magic link) and the Postgres database,
  via `@supabase/ssr`
- **OpenRouter** for the AI calls: Claude Sonnet 4 for the interview and what-if
  generation, a cheaper model for email discovery (see `lib/ai/openrouter.ts`)

## Getting started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file with the following keys (this file is git-ignored and
must never be committed):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

Apply the database schema by running the SQL files in `supabase/migrations/`
against your Supabase project (in order).

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project layout

```
app/            Routes: landing, auth, onboarding, deck, queue, dashboard, profile
  api/          Server routes: chat (interview + profile), generate, discover-email
components/     UI: deck (swipe cards), queue, onboarding, landing
lib/
  ai/           OpenRouter client, model config, and prompts
  supabase/     Browser, server, and admin Supabase clients
  hooks/        useWhatIfs (deck state), useVoiceInput
  utils/        Small pure helpers (with tests)
supabase/
  migrations/   SQL schema
```
