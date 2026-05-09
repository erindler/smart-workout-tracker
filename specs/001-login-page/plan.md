# Implementation Plan: Login Page (Authentication)

**Branch**: `001-login-page` | **Date**: 2026-05-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-login-page/spec.md`

## Summary

Build the authentication entry point for the Smart Workout Tracker. Users sign in via
Google OAuth using Supabase Auth with the Next.js App Router. Email/password sign-in,
registration, and forgot-password were descoped during implementation (Supabase free-tier
email limit of 3/hour). All credential handling is delegated to Supabase. Protected routes
are enforced via `proxy.ts` (Next.js 16 renames `middleware.ts` → `proxy.ts` and the export
must be named `proxy`, not `middleware`).

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.2.4 (App Router), React 19  
**Primary Dependencies**: `@supabase/supabase-js ^2.x`, `@supabase/ssr ^0.10.x`, `zod ^4.x`, `cross-env ^7.x` (dev), Tailwind CSS v4  
> `react-hook-form` and `@hookform/resolvers` are installed but unused — registration was descoped.  
**Storage**: Supabase Auth (`auth.users` table managed by Supabase — no custom tables for this feature)  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Web (modern browsers: Chrome, Firefox, Safari, Edge — current -1 versions); primary mobile target is Mobile Safari on iPhone (PWA via "Add to Home Screen")  
**Project Type**: web-app / PWA (Next.js full-stack, Vercel deployment target)  
**Performance Goals**: <2s initial page load (LCP), <500ms auth redirect after session creation  
**Constraints**: WCAG 2.1 Level AA accessibility; no passwords stored in application code; `HttpOnly` cookie session storage; open-redirect protection on all `next` params; adaptive layout at 390px (iPhone portrait) and 1280px (desktop); touch targets ≥ 44×44pt  
**Scale/Scope**: Personal app — small user base; Supabase free tier sufficient

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | ✅ PASS | `spec.md` created and approved before planning began |
| II. Clarify Before Planning | ✅ PASS | Tech stack (Next.js, Supabase Auth) clarified via user Q&A before any design work |
| III. Stable Requirements Before Architecture | ✅ PASS | 1 active user story (Google OAuth); email/password stories descoped during implementation |
| IV. Traceability | ✅ PASS | All tasks (in `tasks.md`) will trace to FR-xxx and a user story |
| V. Behavior-Driven Testing | ✅ PASS | Tests derived from spec acceptance scenarios (see Test Strategy below) |
| VI. Simplicity Over Cleverness | ✅ PASS | No custom auth logic; Supabase handles all credential storage/verification |
| VII. Holistic Quality During Planning | ✅ PASS | Security, accessibility, error handling all documented below |
| VIII. Spec-Gated Review | ✅ PASS | Reminder included in acceptance criteria section |
| IX. Global Design Tokens | ✅ PASS | `docs/styles.css` seeds `src/app/globals.css`; `globals.css` is the canonical source of truth (FR-006) |
| X. Responsive Design & PWA Targets | ✅ PASS | 390px + 1280px breakpoints, `display: standalone`, 44pt touch targets documented (FR-008, FR-009) |

**Post-Phase 1 re-check**: All principles still pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-login-page/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Entity and session model
├── quickstart.md        # Local setup guide
├── contracts/
│   └── ui-contracts.md  # Page contracts, inputs/outputs, error messages
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
  app/
    (auth)/
      layout.tsx                    ← unauthenticated centered-card layout
      login/
        page.tsx                    ← Google sign-in page (Server Component)
        actions.ts                  ← signInWithOAuthAction('google') Server Action
    auth/
      callback/
        route.ts                    ← OAuth PKCE code exchange; cookies written onto redirect response
    (protected)/
      layout.tsx                    ← authenticated shell (redirects if no session)
      page.tsx                      ← dashboard placeholder (redirect destination)
  lib/
    supabase/
      client.ts                     ← createBrowserClient() for Client Components
      server.ts                     ← createServerClient() for Server Components/Actions
      middleware.ts                  ← updateSession() + getSafeRedirect() helpers
      __tests__/
        middleware.test.ts          ← getSafeRedirect unit tests (open-redirect, SC-004)
    validations/
      auth.ts                       ← Zod schemas (installed but unused; registration descoped)
  components/
    auth/
      AuthCard.tsx                  ← shared card wrapper with app name heading
      OAuthButtons.tsx              ← Google sign-in button (4-color Google G logo)
  proxy.ts                          ← Next.js 16 route guard (replaces middleware.ts)
```

**Structure Decision**: Next.js App Router with a `(auth)` route group for a shared
unauthenticated layout. Route handlers (`app/auth/`) are outside the group so their
URLs match the Supabase dashboard redirect URL configuration exactly.

## Architecture Decisions

### Tradeoffs

| Decision | Chosen Approach | Alternative | Tradeoff |
|----------|----------------|-------------|----------|
| Auth service | Supabase Auth | Custom JWT + bcrypt | Supabase: faster, zero password storage, managed; Custom: full control, more complexity |
| Session storage | `HttpOnly` cookies via `@supabase/ssr` | `localStorage` | Cookies: SSR-safe, XSS-resistant; localStorage: simpler but not SSR-safe and XSS-exposed |
| Form library | N/A (OAuth-only) | React Hook Form + Zod | Registration was descoped; no form fields exist on the login page — only an OAuth button |
| Route protection | Middleware | Layout-level checks | Middleware: runs on every request including RSC navigation; layouts: insufficient for partial hydration |
| JWT validation | `getClaims()` | `getSession()` | `getClaims()`: validates JWT signature server-side; `getSession()`: trusts cookie without re-validation |

### Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Supabase redirect URL misconfiguration (OAuth fails) | Medium | Document in quickstart; fail fast in `auth/callback` with clear error redirect |
| `next` param open-redirect vulnerability | Low (mitigated) | `getSafeRedirect()` helper; covered by automated test (SC-005) |
| Session cookie not propagated in middleware | Medium | Follow `updateSession` pattern exactly as documented in research.md §2; MUST return `supabaseResponse` unmodified |
| Session cookie not attached to callback redirect | High (occurred) | In `auth/callback/route.ts`, create the Supabase client with `response.cookies.set` bound to the redirect `NextResponse` directly — `next/headers` cookies are not written to an explicit redirect response |
| Corporate SSL inspection breaking Supabase HTTPS | Medium (occurred) | Use `NODE_TLS_REJECT_UNAUTHORIZED=0` via `cross-env` in `dev` script only; `build` and `start` are unaffected |
| Deprecated env var `SUPABASE_ANON_KEY` confusion | Low | Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from day 1 |

### Dependencies

- Supabase project must exist before implementation begins (foundational setup task)
- Google OAuth app must be configured in Supabase before OAuth testing (GitHub OAuth was descoped)
- `.env.local` must be present with correct Supabase credentials

## Quality Plan

### Security

- All credential verification delegated to Supabase — zero plaintext passwords in application code (FR-006, SC-006)
- JWT validated via `getClaims()` in middleware (not `getSession()` which trusts unverified cookie)
- `HttpOnly` cookies for session tokens — inaccessible to client-side JavaScript (XSS protection)
- `next` redirect parameter sanitized with `getSafeRedirect()` — prevents open-redirect attacks (FR-005)
- Single Server Action (`signInWithOAuthAction`) delegates entirely to Supabase; no form field parsing or schema validation needed

### Accessibility (WCAG 2.1 Level AA)

- All form inputs have associated `<label>` elements (FR-013)
- Error messages are associated with their field via `aria-describedby`
- Focus is moved to the first error field after a failed submission
- Color contrast ratios meet AA standards using the defined color palette
- Submit button disabled state does not remove focus; loading state communicated via `aria-busy`
- OAuth buttons have descriptive accessible names ("Sign in with Google", not "Google")

### Performance

- Auth pages are Server Components (static shell) with thin Client Component form islands
- No heavy dependencies loaded on the initial auth page render
- `docs/styles.css` seeds `src/app/globals.css`; `globals.css` is the canonical source of truth for all app-wide design tokens (not auth-scoped) — no runtime CSS-in-JS

### Responsive Design & PWA

- All layouts MUST be adaptive using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`); no fixed-width containers that cause horizontal scroll on mobile
- Primary mobile breakpoint: 390px portrait (iPhone 14/15); desktop baseline: 1280px
- Auth form card stacks full-width on mobile with adequate padding; floats as a centered card on desktop
- Touch targets for buttons and links MUST be ≥ 44×44pt (CSS: `min-h-[44px]`, `min-w-[44px]`)
- No interactions that rely solely on hover state — all interactive affordances must work on touch
- `<meta name="viewport" content="width=device-width, initial-scale=1">` set in root layout
- `app/manifest.ts` (Next.js 15 Metadata API) defines PWA web app manifest: `name`, `short_name`, `display: standalone`, `theme_color`, `background_color`, icons
- `display: standalone` removes Safari browser chrome when launched from Home Screen, achieving a native-app feel
- `theme_color` uses the app's `--primary` color token for iOS status bar tinting
- App icons (192×192, 512×512, Apple touch icon 180×180) must be provided for installability

### Error Handling

- Supabase API errors caught in every Server Action; generic message shown to user (no internal details)
- OAuth error codes from `/auth/callback?error=` surfaced to user via friendly message on `/login`
- Expired/invalid confirmation links redirect to `/login?error=link-expired` with informative message
- All error paths return the user to a usable state (never a blank page or unhandled exception)

## Test Strategy

Tests are derived from the spec's acceptance scenarios:

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `getSafeRedirect` helper, Zod schemas | Jest |
| Integration | Form components (submit, validation, error display) | React Testing Library |
| E2E | Full auth flows (sign-in, OAuth mock, register, forgot-password, redirect guard) | Playwright |

Tests are organized by user story to enable independent verification of each story (US1–US4).
All E2E tests that require an email flow use Supabase's [Inbucket](https://inbucket.org/) local
email server (available in the Supabase local development stack).

## Complexity Tracking

No constitution violations to justify. All implementation choices are the simplest available
solution that satisfies the spec.

