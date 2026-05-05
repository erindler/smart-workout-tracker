---
description: "Task list for Login Page (Authentication)"
---

# Tasks: Login Page (Authentication)

**Input**: Design documents from `/specs/001-login-page/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅

**Tests**: Only explicitly required tests are included (SC-005 mandates an automated test for open-redirect prevention; all other verification is manual per spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

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

## Phase 3: User Story 1 — Email/Password Sign In (Priority: P1) 🎯 MVP

**Goal**: A returning user can sign in with email and password and reach the dashboard.

**Independent Test**: Navigate to `/login`, submit valid credentials → redirected to `/`; submit invalid credentials → inline error "Invalid email or password." appears without redirect; navigate to `/login` while already authenticated → immediate redirect to `/`.

### Implementation for User Story 1

- [X] T015 [P] [US1] Create `src/components/auth/AuthCard.tsx` — wraps children in a card with the app name "Smart Workout Tracker" as heading above it; accepts optional `title` prop for the form heading; uses design token classes; responsive: full-width mobile, max-w-sm centered on desktop
- [X] T016 [P] [US1] Create `src/components/auth/FieldError.tsx` — renders an inline `<p>` with `role="alert"` and `aria-live="polite"` for field-level error messages; accepts `message?: string`; renders nothing when message is undefined
- [X] T017 [US1] Create `src/app/(auth)/login/page.tsx` — renders email/password sign-in form inside `AuthCard`; reads `?error=` search param and maps to user messages per contracts/ui-contracts.md error table; form uses `useActionState` + `useFormStatus` for pending state; submit button shows loading indicator and is disabled during submission; all interactive targets `min-h-[44px]`; links to `/register` and `/forgot-password`; `<label>` for every input; errors via `FieldError`; `aria-describedby` wired to error IDs
- [X] T018 [US1] Create `src/app/(auth)/login/actions.ts` — `signInAction(prevState, formData)` Server Action: parses and validates with `SignInSchema`; calls `supabase.auth.signInWithPassword({ email, password })`; on success calls `redirect(getSafeRedirect(next))` (next from hidden input); on Supabase error returns `{ error: 'Invalid email or password.' }`; on network error returns `{ error: 'Something went wrong. Please try again.' }`

**Checkpoint**: US1 fully functional — email/password sign-in, error display, already-authenticated redirect, and `?next=` redirect all work independently

---

## Phase 4: User Story 2 — OAuth Sign In (Priority: P2)

**Goal**: A user can sign in with Google or GitHub and reach the dashboard.

**Independent Test**: Click "Continue with Google" → complete OAuth consent → redirected to `/`; cancel consent → back on `/login` with "Sign-in was cancelled." message.

### Implementation for User Story 2

- [X] T019 [P] [US2] Create `src/components/auth/OAuthButtons.tsx` — renders "Continue with Google" and "Continue with GitHub" buttons; each calls `signInWithOAuthAction(provider)` via form action; accessible names include provider name; `min-h-[44px]`; no hover-only states; shows per-button loading indicator during submission
- [X] T020 [US2] Add `signInWithOAuthAction(provider: 'google' | 'github')` to `src/app/(auth)/login/actions.ts` — calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '<origin>/auth/callback' } })`; redirects browser to the returned OAuth URL; derives `origin` from headers (uses `x-forwarded-host` in production)
- [X] T021 [US2] Create `src/app/auth/callback/route.ts` — GET handler: if `?error=` param present redirect to `/login?error=oauth-cancelled`; if `?code=` present call `supabase.auth.exchangeCodeForSession(code)`; on success redirect to `getSafeRedirect(next)`; on exchange failure redirect to `/login?error=auth-code-error`; construct base URL using `x-forwarded-host` header when present
- [X] T022 [US2] Create `src/app/auth/confirm/route.ts` — GET handler: reads `token_hash`, `type`, `next`; calls `supabase.auth.verifyOtp({ token_hash, type })`; on success redirect to `getSafeRedirect(next)`; on failure redirect to `/login?error=link-expired`
- [X] T023 [US2] Update `src/app/(auth)/login/page.tsx` to import and render `OAuthButtons` above the email/password form with a visual divider ("or"); OAuthButtons receives the `next` value so it can be forwarded through the OAuth state param

**Checkpoint**: US2 fully functional — Google and GitHub OAuth flows complete end-to-end; cancellation and error states show correct messages on `/login`

---

## Phase 5: User Story 3 — Register New Account (Priority: P3)

**Goal**: A new user can create an account with email and password and receive a confirmation email.

**Independent Test**: Navigate to `/register`, submit valid email + matching passwords (≥ 8 chars) → success banner "Check your email to confirm your account."; submit mismatched passwords → inline error; submit existing email → inline error.

### Implementation for User Story 3

- [X] T024 [US3] Create `src/app/(auth)/register/page.tsx` — registration form (email, password, confirmPassword) inside `AuthCard`; uses React Hook Form with `zodResolver(RegisterSchema)` for real-time cross-field confirm-password feedback; `useActionState` bridges to `registerAction` for server-side errors; success state renders banner instead of form; link to `/login`; all targets `min-h-[44px]`; `<label>` + `FieldError` + `aria-describedby` for every field
- [X] T025 [US3] Create `src/app/(auth)/register/actions.ts` — `registerAction(prevState, formData)` Server Action: validates with `RegisterSchema` (server-side re-validation); calls `supabase.auth.signUp({ email, password })`; on success returns `{ success: true, message: 'Check your email to confirm your account.' }`; on "already registered" error returns `{ error: 'An account with this email already exists.' }`; on other errors returns `{ error: 'Something went wrong. Please try again.' }`

**Checkpoint**: US3 fully functional — registration, all validation error states, and success confirmation banner work independently

---

## Phase 6: User Story 4 — Reset Forgotten Password (Priority: P4)

**Goal**: A registered user can request a password-reset link via email.

**Independent Test**: Navigate to `/forgot-password`, submit any email → always shows "If that email is registered, a reset link was sent." (no enumeration); Supabase sends reset email to registered address.

### Implementation for User Story 4

- [X] T026 [US4] Create `src/app/(auth)/forgot-password/page.tsx` — email-only form inside `AuthCard`; `useActionState` for server state; success state shows banner "If that email is registered, a reset link was sent." without unmounting form; link "Back to sign in" → `/login`; `min-h-[44px]` on submit; `<label>` + `FieldError` + `aria-describedby`
- [X] T027 [US4] Create `src/app/(auth)/forgot-password/actions.ts` — `requestPasswordResetAction(prevState, formData)` Server Action: validates with `ForgotPasswordSchema`; calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<origin>/auth/callback?next=/update-password' })`; ALWAYS returns `{ success: true, message: 'If that email is registered, a reset link was sent.' }` regardless of whether email exists (prevents email enumeration); on network error returns generic error

**Checkpoint**: US4 fully functional — forgot-password form, always-generic success message, and Supabase reset email triggered

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T028 [P] Create `src/lib/supabase/__tests__/middleware.test.ts` — unit tests for `getSafeRedirect()`: (1) valid relative `/dashboard` → returns `/dashboard`; (2) external URL `https://evil.com` → returns `/`; (3) protocol-relative `//evil.com` → returns `/`; (4) empty string → returns `/`; (5) null → returns `/`; (6) custom fallback used when provided (required by SC-005)
- [X] T029 [P] Add PWA icons to `public/icons/` — `icon-192.png` (192×192), `icon-512.png` (512×512), `apple-touch-icon.png` (180×180); icons should use the app's primary green (`#68a848`) as background with a simple dumbbell/workout glyph or text "SW" (required by SC-008)
- [X] T030 Verify responsive layout at 390px and 1280px viewports using browser DevTools: confirm no horizontal scrollbar on any auth page at either size; confirm form card is full-width on mobile and centered card on desktop (SC-007)
- [X] T031 Run Lighthouse audit on `/login`, `/register`, `/forgot-password` in Chrome DevTools; confirm Accessibility score ≥ 90 on each page; fix any reported label, contrast, or ARIA issues (SC-004)

---

## Dependencies

```
Phase 1 (T001–T005)
  └─▶ Phase 2 (T006–T014)
        └─▶ Phase 3 / US1 (T015–T018)           ← MVP; must complete first
              ├─▶ Phase 4 / US2 (T019–T023)      ← depends on T017 (login page exists)
              ├─▶ Phase 5 / US3 (T024–T025)      ← independent of US2; can start after Phase 2
              └─▶ Phase 6 / US4 (T026–T027)      ← independent of US2/US3; can start after Phase 2
                    └─▶ Final Phase (T028–T031)   ← after all stories complete
```

**Parallel opportunities within phases**:
- Phase 1: T003, T005 can run in parallel after T001+T002
- Phase 2: T006, T007, T008, T009 can run in parallel (different files); T012, T013, T014 can run in parallel after T011
- Phase 3: T015, T016 can run in parallel; T017 and T018 can run in parallel after T015+T016
- Phase 4: T019, T020, T021, T022 can run in parallel; T023 depends on T019+T017
- Phase 5: T024 and T025 can run in parallel after Phase 2
- Phase 6: T026 and T027 can run in parallel after Phase 2
- Final: T028, T029, T030, T031 can run in parallel after all stories

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
