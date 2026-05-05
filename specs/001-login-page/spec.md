# Feature Specification: Login Page (Authentication)

**Feature Branch**: `001-login-page`
**Created**: 2026-05-04
**Status**: Draft
**Input**: "I would like to begin creating the application by starting with the login page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign In with Email & Password (Priority: P1)

A returning user visits the app and signs in using their registered email address and password.
On success they are redirected to the main dashboard. On failure they see an inline error message
without revealing whether the email or password was wrong.

**Why this priority**: Email/password is the baseline credential flow. All other auth methods
build on top of an authenticated session, so this must work first.

**Independent Test**: Navigate to `/login`, enter valid credentials, confirm redirect to `/`
(dashboard). Enter invalid credentials and confirm the error message appears without a page
reload.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they submit the sign-in form,
   **Then** a Supabase session is created and the user is redirected to the post-login destination
   (default `/`).
2. **Given** a user submits an unrecognized email or wrong password, **When** the form is
   submitted, **Then** an error message "Invalid email or password." is displayed inline and no
   redirect occurs.
3. **Given** a user submits an empty email or empty password, **When** the form is submitted,
   **Then** HTML5 / client-side validation prevents submission and indicates the missing field.
4. **Given** a user is already signed in, **When** they navigate to `/login`, **Then** they are
   immediately redirected to `/`.

---

### User Story 2 — Sign In with OAuth Provider (Priority: P2)

A user signs in (or creates an account) using a third-party OAuth provider (Google and GitHub)
via Supabase Auth. On success they are redirected to the main dashboard. On cancellation or
failure they return to `/login` with a human-readable error.

**Why this priority**: OAuth lowers friction for new users and is a first-class Supabase
feature. Most users will prefer it over managing a password.

**Independent Test**: Click "Continue with Google" on the login page, complete the OAuth flow
in the provider popup, confirm redirect to `/` and that a user row exists in the Supabase
`auth.users` table.

**Acceptance Scenarios**:

1. **Given** a user clicks "Continue with Google" or "Continue with GitHub", **When** they
   complete the OAuth consent flow, **Then** a Supabase session is created and the user is
   redirected to `/`.
2. **Given** a user cancels the OAuth consent dialog, **When** they return to the app, **Then**
   they are back on `/login` with a message "Sign-in was cancelled." and no session is created.
3. **Given** an OAuth provider returns an error (e.g., `access_denied`), **When** the callback
   URL is processed, **Then** the user sees an error message and no session is created.

---

### User Story 3 — Register a New Account (Priority: P3)

A new user creates an account with email and password. A confirmation email is sent by Supabase.
After clicking the link in the email, the user is signed in and redirected to the dashboard.

**Why this priority**: Required for users who prefer email/password and have no existing account,
but the app can be demoed without it if OAuth is working.

**Independent Test**: Navigate to `/register`, fill in email + password + confirm password,
submit the form, and confirm a Supabase confirmation email is triggered. Simulate the confirmation
link click and confirm redirect to `/`.

**Acceptance Scenarios**:

1. **Given** a new user submits a valid email and password (min 8 chars), **When** the form is
   submitted, **Then** Supabase sends a confirmation email and the UI shows "Check your email to
   confirm your account."
2. **Given** a user submits a password shorter than 8 characters, **When** the form is submitted,
   **Then** an inline validation error "Password must be at least 8 characters." is shown.
3. **Given** a user submits passwords that do not match, **When** the form is submitted, **Then**
   an inline validation error "Passwords do not match." is shown.
4. **Given** a user submits an already-registered email, **When** the form is submitted, **Then**
   an error "An account with this email already exists." is displayed.
5. **Given** a new user clicks the confirmation link from their email, **When** the callback is
   processed, **Then** a session is created and the user is redirected to `/`.

---

### User Story 4 — Reset Forgotten Password (Priority: P4)

A registered user who has forgotten their password requests a password-reset link. They receive
an email with a link that opens a page to enter a new password.

**Why this priority**: Password reset is a safety net for email/password users. Can be
deferred until sign-in is stable, but MUST exist before the app is shared publicly.

**Independent Test**: Navigate to `/forgot-password`, enter a registered email, confirm a
password-reset email is sent by Supabase. Open the link and confirm the reset-password form
works and allows the user to sign in with the new password.

**Acceptance Scenarios**:

1. **Given** a registered user submits their email on `/forgot-password`, **When** the form is
   submitted, **Then** Supabase sends a reset email and the UI shows "If that email is
   registered, a reset link was sent." (regardless of whether the email exists).
2. **Given** a user opens the reset link and submits a new password, **When** the form is
   submitted, **Then** the password is updated and the user is redirected to `/login` with a
   "Password updated. Please sign in." message.
3. **Given** a user opens an expired or invalid reset link, **When** they submit the form,
   **Then** an error "This reset link has expired or is invalid." is displayed.

---

### Edge Cases

- What happens when the Supabase API is unreachable? → Show a generic "Something went wrong.
  Please try again." error; do not expose internal details.
- What happens when a user navigates to a protected route while unauthenticated? → Middleware
  redirects to `/login?next=<original-path>`; after successful sign-in they are redirected to
  that original path.
- What happens when a malicious `next` parameter is set to an external URL? → Strip or ignore
  the `next` parameter if it is not a relative path within the app.
- What happens if JavaScript is disabled? → The form must submit via standard HTML form action
  (Next.js Server Action fallback) or display a graceful message; do not silently fail.
- What happens on slow connections or network timeouts? → Show a loading/spinner state on the
  submit button and disable it during in-flight requests to prevent double-submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow registered users to sign in with email and password via Supabase Auth.
- **FR-002**: System MUST allow users to sign in with Google OAuth via Supabase Auth.
- **FR-003**: System MUST allow users to sign in with GitHub OAuth via Supabase Auth.
- **FR-004**: System MUST redirect authenticated users away from `/login` to the post-login destination.
- **FR-005**: System MUST display an inline error on invalid credentials without revealing which field was wrong.
- **FR-006**: System MUST allow new users to register with email and password.
- **FR-007**: System MUST enforce a minimum password length of 8 characters at registration.
- **FR-008**: System MUST send a Supabase confirmation email on registration before granting access.
- **FR-009**: System MUST allow registered users to request a password-reset email.
- **FR-010**: System MUST protect sensitive routes via Next.js middleware; unauthenticated access redirects to `/login`.
- **FR-011**: System MUST sanitize the `next` redirect parameter to prevent open-redirect attacks.
- **FR-012**: The CSS custom properties from `docs/styles.css` MUST be used to seed `src/app/globals.css` as the application-wide design token foundation. Once established, `src/app/globals.css` is the canonical source of truth for all tokens, applied across all pages (not auth-specific).
- **FR-013**: System MUST be accessible to WCAG 2.1 Level AA standards (labels, focus management, contrast).
- **FR-014**: All pages MUST be adaptive across desktop and mobile portrait screen sizes. Layouts MUST reflow gracefully without horizontal scrolling at any supported viewport width.
- **FR-015**: The web app MUST be installable as a Progressive Web App (PWA) on iOS Safari (iPhone) and MUST feel native at mobile portrait viewport sizes — touch targets ≥ 44×44pt, no hover-dependent interactions, viewport meta tag configured correctly.

### Key Entities

- **User**: Managed entirely by Supabase Auth (`auth.users`). Attributes: `id` (UUID), `email`,
  `created_at`, `last_sign_in_at`, `app_metadata` (OAuth provider info).
- **Session**: Managed by Supabase Auth. Short-lived JWT + refresh token pair, stored in cookies
  (SSR-safe via `@supabase/ssr`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register, confirm their email, and reach the dashboard in under 3 minutes end-to-end.
- **SC-002**: A returning user can sign in with email/password in under 10 seconds on a standard connection.
- **SC-003**: OAuth sign-in (Google or GitHub) completes within the OAuth provider's standard round-trip time.
- **SC-004**: All auth pages score ≥ 90 on Lighthouse Accessibility audit.
- **SC-005**: The `next` redirect parameter open-redirect edge case is verified via automated test.
- **SC-006**: Zero plaintext passwords stored anywhere in the application (all credential handling delegated to Supabase).
- **SC-007**: All pages render without horizontal scroll at 390px viewport width (iPhone 14/15 portrait) and at 1280px (standard desktop).
- **SC-008**: The app is installable via Safari "Add to Home Screen" on iOS with a valid web app manifest and appropriate icons.

## Assumptions

- Supabase project is already created (or will be created as part of the foundational setup task).
- Google and GitHub OAuth apps are configured in the Supabase dashboard before implementation begins.
- The application is a web app targeting modern browsers (Chrome, Firefox, Safari, Edge — current -1 versions), with particular attention to Mobile Safari on iOS (iPhone).
- No native mobile app wrapper is in scope. The app will be used as a PWA installed via Safari "Add to Home Screen" on iPhone.
- `docs/styles.css` is reference material containing the intended color palette. It MUST be used to seed `src/app/globals.css`, which becomes the canonical, application-wide source of truth for design tokens used by all pages and components — not scoped to authentication pages.
- Email deliverability (SMTP / Supabase email templates) will use Supabase's default settings for now.

## Non-Goals

- Native mobile app (iOS/Android) binary — web PWA only.
- Landscape orientation on mobile — only portrait is required for now.
- Multi-factor authentication (MFA) — out of scope for this feature; can be added later.
- Username-based login (users log in with email only).
- Account deletion or email change flows.
- Team/organization-level authentication or role management.
