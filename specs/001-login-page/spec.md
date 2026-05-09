# Feature Specification: Login Page (Authentication)

**Feature Branch**: `001-login-page`
**Created**: 2026-05-04
**Last Updated**: 2026-05-09
**Status**: Implemented
**Input**: "I would like to begin creating the application by starting with the login page."

> **Implementation Note**: Email/password sign-in, account registration, and password reset were
> scoped out during implementation. Supabase's free tier caps outbound email at 3/hour, making
> email-based flows impractical for a solo development project. The app uses **Google OAuth only**.
> GitHub OAuth was also removed to keep the surface area minimal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign In with Google (Priority: P1) ? IMPLEMENTED

A user signs in (or implicitly creates an account) using their Google account via Supabase Auth.
On success they are redirected to the main dashboard. On cancellation or failure they return to
`/login` with a human-readable error message.

**Why this priority**: Google OAuth is the sole authentication method. It eliminates password
management, confirmation emails, and password-reset flows entirely.

**Independent Test**: Click "Continue with Google" on `/login`, complete the Google consent
screen, confirm redirect to `/` and that the user row exists in Supabase `auth.users`.

**Acceptance Scenarios**:

1. **Given** a user clicks "Continue with Google", **When** they complete the OAuth consent flow,
   **Then** a Supabase session is created and the user is redirected to `/` (or the original
   `?next=` destination if present).
2. **Given** a user cancels the Google consent dialog, **When** they return to the app, **Then**
   they are back on `/login` with a message "Sign-in was cancelled." and no session is created.
3. **Given** Google returns an error (e.g., `access_denied`), **When** the callback URL is
   processed, **Then** the user sees "Authentication failed. Please try again." and no session
   is created.
4. **Given** a user is already signed in, **When** they navigate to `/login`, **Then** they are
   immediately redirected to `/`.

---

### Edge Cases

- What happens when the Supabase API is unreachable? ? The OAuth redirect fails and the user
  returns to `/login` with a generic error; internal details are never exposed.
- What happens when a user navigates to a protected route while unauthenticated? ? Middleware
  redirects to `/login?next=<original-path>`; after successful sign-in they are redirected to
  that original path.
- What happens when a malicious `next` parameter is set to an external URL? ? `getSafeRedirect()`
  rejects any value that does not start with `/` or starts with `//`, returning `/` instead.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign in with Google OAuth via Supabase Auth.
- **FR-002**: System MUST redirect authenticated users away from `/login` to the post-login destination (default `/`).
- **FR-003**: System MUST display a human-readable error on OAuth cancellation or failure without exposing internal details.
- **FR-004**: System MUST protect all routes except `/login` and `/auth/*` via Next.js proxy (middleware); unauthenticated access redirects to `/login`.
- **FR-005**: System MUST sanitize the `next` redirect parameter to prevent open-redirect attacks.
- **FR-006**: The CSS custom properties from `docs/styles.css` MUST be used to seed `src/app/globals.css` as the application-wide design token foundation. `src/app/globals.css` is the canonical source of truth for all tokens.
- **FR-007**: System MUST be accessible to WCAG 2.1 Level AA standards (labels, focus management, contrast).
- **FR-008**: All pages MUST be adaptive across desktop and mobile portrait screen sizes without horizontal scrolling.
- **FR-009**: The web app MUST be installable as a Progressive Web App (PWA) on iOS Safari with touch targets = 44×44pt and a valid web app manifest.

### Key Entities

- **User**: Managed entirely by Supabase Auth (`auth.users`). Attributes: `id` (UUID), `email`,
  `created_at`, `last_sign_in_at`, `app_metadata` (OAuth provider info). First sign-in via
  Google auto-creates the user row.
- **Session**: Managed by Supabase Auth. Short-lived JWT + refresh token pair, stored in cookies
  (SSR-safe via `@supabase/ssr`). Session validity is checked server-side via `getClaims()`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can sign in with Google and reach the dashboard in a single OAuth round-trip.
- **SC-002**: OAuth sign-in completes within Google's standard consent screen round-trip time (no additional app-side latency beyond the PKCE code exchange).
- **SC-003**: All auth pages score = 90 on Lighthouse Accessibility audit.
- **SC-004**: The `next` redirect parameter open-redirect edge case is verified via automated unit test (`getSafeRedirect` — 6 passing test cases).
- **SC-005**: Zero plaintext credentials stored anywhere in the application (all credential handling delegated to Supabase + Google).
- **SC-006**: All pages render without horizontal scroll at 390px viewport width (iPhone 14/15 portrait) and at 1280px (standard desktop).
- **SC-007**: The app is installable via Safari "Add to Home Screen" on iOS with a valid web app manifest and appropriate icons.

## Assumptions

- Supabase project is already created with Google OAuth configured in the Supabase dashboard.
- The Google Cloud Console OAuth app has the correct authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
- The application targets modern browsers (Chrome, Firefox, Safari, Edge — current -1 versions), with particular attention to Mobile Safari on iOS.
- No native mobile app wrapper is in scope. The app is used as a PWA installed via Safari "Add to Home Screen".
- Local development uses `NODE_TLS_REJECT_UNAUTHORIZED=0` (via `cross-env` in the `dev` npm script) to work around corporate SSL inspection on outbound Supabase API calls. This flag is **dev-only** and is not present in `build` or `start` scripts.

## Non-Goals

- Email/password sign-in — not implemented; Supabase free-tier email limits make this impractical.
- Account registration page — Google OAuth auto-creates the user on first sign-in.
- Forgot password / password reset flow — no passwords in use.
- GitHub OAuth or any additional OAuth providers — out of scope for this feature.
- Native mobile app (iOS/Android) binary — web PWA only.
- Landscape orientation on mobile — only portrait is required for now.
- Multi-factor authentication (MFA) — out of scope; can be added later.
- Account deletion or email change flows.
- Team/organization-level authentication or role management.
