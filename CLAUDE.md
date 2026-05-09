# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint check
```

No test suite is configured.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS 4 — PostCSS plugin, no config file |
| Database/Auth | Supabase (PostgreSQL + SSR Auth) |
| Payments | Stripe Checkout Sessions |
| Media | Cloudinary (images, audio, video) |
| Audio UI | WaveSurfer.js |
| Icons | Lucide React |

Path alias: `@/*` → `./src/*`

---

## Architecture

### Next.js App Router conventions
- All pages under `src/app/` — route segments map directly to URLs.
- Server Components are the default. Client Components (`'use client'`) are used only where browser APIs or interactivity are required.
- Mutations go through **Server Actions** (`'use server'`), not traditional API routes. The only API routes are `src/app/api/stripe/` (checkout session creation and webhook handler).

### Supabase client split
Two separate clients must be used depending on context:
- `src/lib/supabase/server.ts` — server-side (Server Components, Server Actions, API routes). Uses cookies for session management.
- `src/lib/supabase/client.ts` — browser-side (Client Components). Singleton pattern.

Never use the server client in a Client Component or vice versa.

### Auth flow
- Sessions are managed via Supabase SSR cookies — no JWT in localStorage.
- `src/hooks/useUser.ts` provides auth state on the client.
- Route protection is handled in `src/proxy.ts` (middleware-like logic): `/feed` and related routes redirect to `/login` if unauthenticated; `/login` and `/register` redirect to `/feed` if already authenticated.

### Stripe integration
- **Checkout Sessions** for both services and masterclasses — never PaymentIntents directly.
- A **10% platform fee** (`PLATFORM_FEE_PERCENT`) is applied on service purchases via `application_fee_amount`.
- Webhook (`/api/stripe/webhook`) uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) to confirm enrollments, mark orders as `'paid'`, increment counters via RPC, and create notifications.

### Data model highlights
- `profiles` extends Supabase `auth.users` with role, badge level, skills, follower counts.
- `services` and `masterclasses` are the two marketplace entities, both with category filters and Stripe-based purchase flows.
- `orders` tracks service purchases; `masterclass_enrollments` tracks course access.
- `notifications` is written server-side (webhook + server actions), read client-side.

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
NEXT_PUBLIC_CLOUDINARY_AUDIO_PRESET
NEXT_PUBLIC_CLOUDINARY_VIDEO_PRESET

NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` is only used server-side (webhook handler) to bypass RLS. Never expose it to the browser.

---

## UI Conventions

- **Dark theme** throughout — black/zinc backgrounds, violet accents for interactive elements.
- All user-facing labels are in **French**.
- `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) is the standard for conditional class composition.
- Shared UI primitives live in `src/components/ui/` (Badge, AudioPlayer).
