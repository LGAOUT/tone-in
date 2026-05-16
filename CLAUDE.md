# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Branching Strategy

| Branch | Purpose | Deploy target |
|---|---|---|
| `main` | Production-ready code only | Vercel production |
| `develop` | Integration branch — what goes to staging | Vercel staging (preview) |
| `feature/*` | New features, branch off `develop` | — |
| `fix/*` | Bug fixes, branch off `develop` | — |
| `hotfix/*` | Critical prod fixes, branch off `main`, merge back to both `main` and `develop` | — |

**Rules:**
- Never commit directly to `main` or `develop` — always go through a PR.
- PRs to `develop` or `main` must pass CI (lint + type check) before merge.
- Protect `main` and `develop` in GitHub → Settings → Branches: require PR + 1 review + passing CI status check.
- Vercel is connected to the repo: push to `main` = production deploy; `develop` is configured as a staging environment in Vercel project settings.

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
- Mutations go through **Server Actions** (`'use server'`), not traditional API routes. API routes: `src/app/api/stripe/` (checkout session creation and webhook handler) and `src/app/auth/callback/` (Google OAuth code exchange).

### Supabase client split
Two separate clients must be used depending on context:
- `src/lib/supabase/server.ts` — server-side (Server Components, Server Actions, API routes). Uses cookies for session management.
- `src/lib/supabase/client.ts` — browser-side (Client Components). Singleton pattern.

Never use the server client in a Client Component or vice versa.

### Auth flow
- Sessions are managed via Supabase SSR cookies — no JWT in localStorage.
- `src/hooks/useUser.ts` provides auth state on the client.
- All auth Server Actions live in `src/app/auth/actions.ts`: `login`, `loginWithGoogle`, `register`, `logout`, `forgotPassword`, `resetPassword`, `changePassword`, `updateProfile`.
- **Google OAuth**: `loginWithGoogle()` triggers Supabase OAuth redirect; the code-exchange callback is the API route `src/app/auth/callback/route.ts` which redirects to `/feed` on success.
- **Password reset flow**: `/forgot-password` sends a reset email (redirects to `/reset-password`); `/reset-password` handles the Supabase magic-link token and calls `resetPassword()`.
- **Change password**: authenticated users can change their password from `src/app/profile/edit` via `ChangePasswordForm` — verifies the current password before updating.
- Route protection is handled in `src/proxy.ts`: paths starting with `/feed` redirect to `/login` if unauthenticated; `/login` and `/register` redirect to `/feed` if already authenticated.

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

- All user-facing labels are in **French**.
- `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) is the standard for conditional class composition.
- Shared UI primitives live in `src/components/ui/` (Badge, AudioPlayer).

### Design system tokens

| Token | Value |
|---|---|
| Page background | `#0a0a0a` |
| Card background | `#141414` |
| Card hover background | `#181818` |
| Navbar / chat header | `#0d0d0d` |
| Player inner | `#0f0f0f` |
| Dropdown background | `#1a1a1a` |
| Accent primary | `#7c6dfa` |
| Accent light / active | `#9d91fb` |
| Text primary | `#e8e4dc` |
| Text secondary | `#888` |
| Text muted | `#555` |
| Text subtle | `#444` |
| Text ghost | `#2e2e2e` |
| Border default | `0.5px solid #ffffff10` |
| Border hover | `#ffffff1e` |
| Border focus | `#7c6dfa40` |
| Card radius | `16px` |
| Marketplace card radius | `14px` |
| Button radius | `9–10px` |
| Small button radius | `7px` |
| Transition | `all .15s ease` |
| Card hover lift | `translateY(-1px)` |

### Fonts
- **DM Sans** — all UI text (loaded via `next/font/google`, CSS var `--font-dm-sans`)
- **DM Mono** — handles (`@username`), timestamps, BPM, stats, price subtitles (CSS var `--font-dm-mono`)

### Hover effects in Server Components
Never use `onMouseEnter`/`onMouseLeave` in Server Components. Use the CSS utility classes defined in `globals.css` instead:

| Class | Effect |
|---|---|
| `.hover-card` | bg `#181818`, border `#ffffff1e`, `translateY(-1px)` — for clickable cards |
| `.hover-violet` | color transitions to `#e8e4dc` — for violet links |
| `.hover-border` | border brightens to `#ffffff1e` + slight opacity — for ghost buttons |

### Custom dropdowns
**Never use a native `<select>` element anywhere in the app.** Use the `FieldSelect` pattern (see `src/app/profile/edit/page.tsx`) — a button trigger + absolute dropdown menu + hidden `<input>` for form submission. Close on outside click via `useEffect` + `mousedown` listener.

### Avatar style
Music-role users (`musician`, `producer`, `beatmaker`, `songwriter`): `bg #2a1f5a`, `border #7c6dfa40`, `color #9d91fb`.  
Other roles: `bg #1e1e1e`, `border #ffffff10`, `color #888`.

### Category badge colors (Marketplace & Masterclasses)

| Category | bg | text | border |
|---|---|---|---|
| Mixage / mixing | `#1d9e7514` | `#3dcca0` | `#1d9e7528` |
| Mastering | `#378add14` | `#7ab8ed` | `#378add28` |
| Production | `#7c6dfa14` | `#9d91fb` | `#7c6dfa28` |
| Beatmaking | `#d4537e14` | `#e87aaa` | `#d4537e28` |
| Songwriting | `#ef9f2714` | `#f5c06a` | `#ef9f2728` |

### Badge level colors

| Level | bg | text | border |
|---|---|---|---|
| Débutant | `rgba(124,109,250,0.09)` | `#9d91fb` | `rgba(124,109,250,0.19)` |
| Intermédiaire | `rgba(29,158,117,0.09)` | `#3dcca0` | `rgba(29,158,117,0.25)` |
| Pro / Expert | `rgba(212,83,126,0.09)` | `#e87aaa` | `rgba(212,83,126,0.25)` |
