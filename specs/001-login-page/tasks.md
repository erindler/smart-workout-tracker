---
description: "Task list for Login Page (Authentication)"
---

# Tasks: Login Page (Authentication)

**Input**: Design documents from `/specs/001-login-page/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅

**Tests**: Only explicitly required tests are included (SC-005 mandates an automated test for open-redirect prevention; all other verification is manual per spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

> **Implementation Scope Change**: During implementation, email/password sign-in (US1), account
> registration (US3), and password reset (US4) were removed. Supabase free-tier email limits
> (3/hour) made email-based flows impractical. GitHub OAuth was also removed. The app uses
> **Google OAuth only**. Tasks for removed flows are marked `[~]` (descoped). Additional
> unplanned tasks are marked `[+]`.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to ([US1]–[US4])
- All file paths are relative to the repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js project, install dependencies, configure design tokens and environment.

- [X] T001 Bootstrap Next.js 15 project: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` at repository root
- [X] T002 Install auth and form dependencies: `npm install @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers zod`
- [X] T003 [P] Create `.env.local.example` documenting required env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with placeholder values and comments
- [X] T004 Seed `src/app/globals.css` with CSS custom properties from `docs/styles.css` as app-wide design tokens: dark mode variables in `@media (prefers-color-scheme: dark)` and light mode as default; `globals.css` is the canonical source of truth going forward
- [X] T005 [P] Extend `tailwind.config.ts` to expose design token CSS variables as Tailwind color utilities (e.g., `text`, `background`, `primary`, `secondary`, `accent`) so components can use `bg-primary`, `text-background`, etc.

**Checkpoint**: Next.js project is runnable at `http://localhost:3000` with correct design tokens applied

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create `src/lib/supabase/client.ts` — exports `createClient()` using `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)` from `@supabase/ssr`; for use in Client Components only
- [X] T007 Create `src/lib/supabase/server.ts` — exports async `createClient()` using `createServerClient` wired to Next.js `cookies()` store from `next/headers`; `setAll` wraps in try/catch (Server Components cannot set cookies — middleware handles refresh)
- [X] T008 Create `src/lib/supabase/middleware.ts` — exports `updateSession(request: NextRequest)`: creates `createServerClient` wired to `request.cookies` and `supabaseResponse.cookies`; calls `supabase.auth.getClaims()` (NOT `getSession()`) to validate JWT; redirects unauthenticated requests (excluding `/login` and `/auth/*`) to `/login`; exports `getSafeRedirect(next, fallback='/')` helper: returns `next` only if it starts with `/` but NOT `//`, else returns fallback
- [X] T009 Create `src/lib/validations/auth.ts` — exports Zod schemas: `SignInSchema` (email, password non-empty), `RegisterSchema` (email, password min-8, confirmPassword with `.refine` cross-field match check, error path `['confirmPassword']`), `ForgotPasswordSchema` (email)
- [X] T010 Create `src/proxy.ts` at project root (middleware renamed to proxy in Next.js 16) — imports `updateSession` from `@/lib/supabase/middleware`; exports `middleware` function calling `updateSession(request)`; exports `config.matcher` excluding `_next/static`, `_next/image`, `favicon.ico`, and static asset extensions
- [X] T011 Create `src/app/layout.tsx` — root layout with `<html lang="en">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, import of `globals.css`, and Next.js `<Viewport>` export; include `<link rel="apple-touch-icon">` pointing to `/icons/apple-touch-icon.png`
- [X] T012 [P] Create `src/app/manifest.ts` — Next.js 15 Metadata API PWA manifest: `name: "Smart Workout Tracker"`, `short_name: "Workout"`, `display: "standalone"`, `theme_color` matching `--primary` token value (`#68a848`), `background_color` matching `--background` token value (`#020401`), icons array with 192×192 and 512×512 entries pointing to `public/icons/`
- [X] T013 [P] Create `src/app/(auth)/layout.tsx` — unauthenticated shell layout: full-screen flex column, centers content vertically and horizontally; on desktop (≥ `sm:` breakpoint) wraps children in a max-w-sm card with border/shadow; on mobile renders full-width with `px-4`; no navigation header or sidebar; applies `bg-background text-text` from design tokens
- [X] T014 [P] Create `src/app/(protected)/layout.tsx` (reads session via `createClient()` from server.ts, redirects to `/login` if no claims) and `src/app/(protected)/page.tsx` (dashboard placeholder — heading "Dashboard", paragraph "You are signed in.", sign-out button calling `supabase.auth.signOut()`)

**Checkpoint**: `npm run dev` starts without errors; navigating to `/` while unauthenticated redirects to `/login`; `/login` renders the auth layout shell

---

## Phase 3: User Story 1 — Email/Password Sign In ~~(Priority: P1)~~ [DESCOPED]

**Goal**: ~~A returning user can sign in with email and password and reach the dashboard.~~ **DESCOPED — Google OAuth only.**

### Implementation for User Story 1 [DESCOPED]

- [X] T015 [P] [US1] Create `src/components/auth/AuthCard.tsx` — wraps children in a card with the app name "Smart Workout Tracker" as heading above it; accepts optional `title` prop for the form heading; uses design token classes; responsive: full-width mobile, max-w-sm centered on desktop
- [~] T016 [US1] `src/components/auth/FieldError.tsx` — created then deleted; not needed without email/password form fields
- [~] T017 [US1] Email/password `login/page.tsx` — replaced by Google-only Server Component (see T023)
- [~] T018 [US1] `signInAction` in `login/actions.ts` — never shipped; `signInWithOAuthAction` (T020) is the only action

**Checkpoint**: N/A — phase descoped

---

## Phase 4: User Story 2 — Google OAuth Sign In (Priority: P1) 🎯 MVP

**Goal**: A user can sign in with Google and reach the dashboard. (GitHub OAuth descoped.)

**Independent Test**: Click "Continue with Google" → complete OAuth consent → redirected to `/`; cancel consent → back on `/login` with "Sign-in was cancelled." message.

### Implementation for User Story 2

- [X] T019 [P] [US2] Create `src/components/auth/OAuthButtons.tsx` — renders "Continue with Google" button with official 4-color Google G SVG logo; calls `signInWithOAuthAction('google')` via form action; accessible name includes provider name; `min-h-[44px]`; no hover-only states; shows loading indicator during submission; styled for light/dark mode per Google branding guidelines
- [X] T020 [US2] `signInWithOAuthAction(provider: 'google')` in `src/app/(auth)/login/actions.ts` — calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '<origin>/auth/callback' } })`; redirects browser to the returned OAuth URL; derives `origin` from headers (`x-forwarded-host` in production)
- [X] T021 [US2] Create `src/app/auth/callback/route.ts` — GET handler: if `?error=` param present redirect to `/login?error=oauth-cancelled`; if `?code=` present, creates Supabase client with cookies written directly onto the redirect `NextResponse` (critical — using `next/headers` cookies would not attach to the response); on success redirect to `getSafeRedirect(next)`; on exchange failure redirect to `/login?error=auth-code-error`
- [~] T022 [US2] `src/app/auth/confirm/route.ts` — created then deleted; not needed without email OTP flows
- [X] T023 [US2] `src/app/(auth)/login/page.tsx` — implemented as a Server Component (no client hooks); reads `searchParams` as async prop; renders `AuthCard` + `OAuthButtons` only; maps `?error=` param via `ERROR_MAP`; no email/password form, no divider, no register/forgot-password links

**Checkpoint**: Google OAuth flow complete end-to-end; cancellation and error states show correct messages on `/login`

---

## Phase 5: User Story 3 — Register New Account [DESCOPED]

**Goal**: ~~A new user can create an account with email and password.~~ **DESCOPED — Google OAuth auto-creates the user on first sign-in.**

- [~] T024 [US3] `src/app/(auth)/register/page.tsx` — created then deleted
- [~] T025 [US3] `src/app/(auth)/register/actions.ts` — created then deleted

**Checkpoint**: N/A — phase descoped

---

## Phase 6: User Story 4 — Reset Forgotten Password [DESCOPED]

**Goal**: ~~A registered user can request a password-reset link via email.~~ **DESCOPED — no passwords in use.**

- [~] T026 [US4] `src/app/(auth)/forgot-password/page.tsx` — created then deleted
- [~] T027 [US4] `src/app/(auth)/forgot-password/actions.ts` — created then deleted

**Checkpoint**: N/A — phase descoped

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T028 [P] Create `src/lib/supabase/__tests__/middleware.test.ts` — unit tests for `getSafeRedirect()`: (1) valid relative `/dashboard` → returns `/dashboard`; (2) external URL `https://evil.com` → returns `/`; (3) protocol-relative `//evil.com` → returns `/`; (4) empty string → returns `/`; (5) null → returns `/`; (6) custom fallback used when provided (required by SC-005)
- [X] T029 [P] Add PWA icons to `public/icons/` — `icon-192.png` (192×192), `icon-512.png` (512×512), `apple-touch-icon.png` (180×180); icons should use the app's primary green (`#68a848`) as background with a simple dumbbell/workout glyph or text "SW" (required by SC-008)
- [X] T030 Verify responsive layout at 390px and 1280px viewports using browser DevTools: confirm no horizontal scrollbar on any auth page at either size; confirm form card is full-width on mobile and centered card on desktop (SC-007)
- [X] T031 Run Lighthouse audit on `/login` in Chrome DevTools; confirm Accessibility score ≥ 90; fix any reported label, contrast, or ARIA issues (SC-004)

## Unplanned Tasks

- [+] T032 Fix `auth/callback/route.ts` to write session cookies directly onto the `NextResponse.redirect()` object instead of via `next/headers` — `next/headers` cookies are not attached to an explicit redirect response, causing the session to be silently discarded after `exchangeCodeForSession`
- [+] T033 Add `cross-env NODE_TLS_REJECT_UNAUTHORIZED=0` to the `dev` npm script via `npm install --save-dev cross-env` — required to bypass corporate SSL inspection (self-signed cert in chain) on outbound Supabase API calls in local dev; flag is dev-only and absent from `build`/`start` scripts

---

## Dependencies (Actual)

```
Phase 1 (T001–T005)
  └─▶ Phase 2 (T006–T014)
        └─▶ Phase 4 / US2 (T019–T023)    ← only active user story
              └─▶ Final Phase (T028–T031)
                    └─▶ Unplanned (T032–T033)
```

Phases 3, 5, and 6 (US1, US3, US4) were descoped and their tasks deleted.

## Implementation Strategy

**MVP scope** (Phase 1 + Phase 2 + Phase 3 = T001–T018):
- Bootstrap project with design tokens and middleware
- Email/password sign-in is fully functional
- Delivers SC-001, SC-002, SC-006 and satisfies US1 acceptance criteria

**Increment 2** (Phase 4 = T019–T023):
- Adds Google + GitHub OAuth
- Delivers SC-003

**Increment 3** (Phase 5 = T024–T025):
- Adds user registration + email confirmation

**Increment 4** (Phase 6 = T026–T027):
- Adds forgot-password flow

**Polish** (Final Phase = T028–T031):
- Automated open-redirect test, PWA icons, responsive + a11y verification
- Required before public sharing
