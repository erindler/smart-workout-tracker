# UI Contracts: Login Page (001-login-page)

**Feature**: Login Page / Authentication
**Branch**: `001-login-page`
**Date**: 2026-05-04

This document defines the observable UI contracts for each auth page and route handler:
the URLs, inputs, outputs, redirects, and user-visible messages. These contracts are the
basis for acceptance tests.

---

## Pages

### `/login` — Sign In Page

**Route file**: `app/(auth)/login/page.tsx`

**Method**: GET (render) + POST via Server Action `signInAction`

**Inputs** (form fields):

| Field      | Type     | Required | Validation         |
|------------|----------|----------|--------------------|
| `email`    | `string` | Yes      | Valid email format |
| `password` | `string` | Yes      | Non-empty          |

**Query params**:

| Param  | Description                                          |
|--------|------------------------------------------------------|
| `next` | Relative path to redirect to after successful sign-in. Sanitized; falls back to `/`. |

**Outputs**:

| Condition                             | UI Outcome                                              |
|---------------------------------------|---------------------------------------------------------|
| Valid credentials                     | Redirect to `next` (default `/`)                        |
| Invalid credentials                   | Inline error: "Invalid email or password."              |
| Empty email or password               | HTML5 required validation; form not submitted           |
| Already authenticated                 | Immediate redirect to `/` (handled by middleware)       |
| Supabase API unreachable              | Inline error: "Something went wrong. Please try again." |
| In-flight submission                  | Submit button disabled + loading indicator              |

**Links on page**:
- "Don't have an account? Sign up" → `/register`
- "Forgot password?" → `/forgot-password`
- "Continue with Google" → triggers `signInWithOAuthAction('google')`
- "Continue with GitHub" → triggers `signInWithOAuthAction('github')`

---

### `/register` — Registration Page

**Route file**: `app/(auth)/register/page.tsx`

**Method**: GET (render) + POST via Server Action `registerAction`

**Inputs** (form fields):

| Field             | Type     | Required | Validation                              |
|-------------------|----------|----------|-----------------------------------------|
| `email`           | `string` | Yes      | Valid email format                      |
| `password`        | `string` | Yes      | Min 8 characters                        |
| `confirmPassword` | `string` | Yes      | Must match `password`                   |

**Outputs**:

| Condition                             | UI Outcome                                                                   |
|---------------------------------------|------------------------------------------------------------------------------|
| Valid submission                      | Success banner: "Check your email to confirm your account."                  |
| Password < 8 chars                    | Inline field error: "Password must be at least 8 characters."                |
| Passwords do not match                | Inline field error: "Passwords do not match."                                |
| Email already registered              | Inline error: "An account with this email already exists."                   |
| Supabase API unreachable              | Inline error: "Something went wrong. Please try again."                      |
| In-flight submission                  | Submit button disabled + loading indicator                                   |

**Links on page**:
- "Already have an account? Sign in" → `/login`

---

### `/forgot-password` — Password Reset Request Page

**Route file**: `app/(auth)/forgot-password/page.tsx`

**Method**: GET (render) + POST via Server Action `requestPasswordResetAction`

**Inputs** (form fields):

| Field   | Type     | Required | Validation         |
|---------|----------|----------|--------------------|
| `email` | `string` | Yes      | Valid email format |

**Outputs**:

| Condition                             | UI Outcome                                                                   |
|---------------------------------------|------------------------------------------------------------------------------|
| Any submitted email (registered or not) | Success banner: "If that email is registered, a reset link was sent." (always shown) |
| Supabase API unreachable              | Inline error: "Something went wrong. Please try again."                      |
| In-flight submission                  | Submit button disabled + loading indicator                                   |

**Links on page**:
- "Back to sign in" → `/login`

---

## Route Handlers

### `GET /auth/callback` — OAuth + Email Confirmation Code Exchange

**Route file**: `app/auth/callback/route.ts`

**Query params**:

| Param    | Description                                                      |
|----------|------------------------------------------------------------------|
| `code`   | PKCE authorization code from Supabase / OAuth provider           |
| `next`   | Relative path to redirect after success. Sanitized.              |
| `error`  | Present on OAuth cancellation or failure (from OAuth provider)   |

**Behavior**:

| Condition                             | Outcome                                                                      |
|---------------------------------------|------------------------------------------------------------------------------|
| `code` present + exchange succeeds    | Redirect to `next` (default `/`); session cookies set                        |
| `code` present + exchange fails       | Redirect to `/login?error=auth-code-error`                                   |
| `error` param present (OAuth denied)  | Redirect to `/login?error=oauth-cancelled`                                   |
| Neither `code` nor `error`            | Redirect to `/login`                                                         |

---

### `GET /auth/confirm` — Email OTP / Magic Link Verification

**Route file**: `app/auth/confirm/route.ts`

**Query params**:

| Param          | Description                                                      |
|----------------|------------------------------------------------------------------|
| `token_hash`   | Hashed OTP token from Supabase confirmation email                |
| `type`         | Supabase token type: `signup`, `recovery`, `invite`, `magiclink` |
| `next`         | Relative redirect path after verification. Sanitized.            |

**Behavior**:

| Condition                             | Outcome                                                                      |
|---------------------------------------|------------------------------------------------------------------------------|
| Valid `token_hash` + type `signup`    | Email confirmed; redirect to `next` (default `/`); session cookies set       |
| Valid `token_hash` + type `recovery`  | Session set (for password update); redirect to `/update-password` or `next`  |
| Invalid or expired `token_hash`       | Redirect to `/login?error=link-expired`                                      |

---

## Error Query Params on `/login`

When a route handler redirects back to `/login` with an error, it appends `?error=<code>`.
The login page reads and displays these messages:

| `error` value     | Displayed message                                                  |
|-------------------|--------------------------------------------------------------------|
| `auth-code-error` | "Something went wrong during sign-in. Please try again."           |
| `oauth-cancelled` | "Sign-in was cancelled."                                           |
| `link-expired`    | "This link has expired or is invalid. Please try again."           |

---

## Shared Layout Contract

**Route file**: `app/(auth)/layout.tsx`

All auth pages are wrapped in this layout. It MUST:
- **Desktop** (≥ 640px): Center the form card horizontally and vertically on the page as a constrained-width card (max ~400px)
- **Mobile portrait** (< 640px): Render the form full-width with horizontal padding; no horizontal scrollbar
- Apply the app's color palette via the global CSS custom properties defined in `src/app/globals.css` (seeded from `docs/styles.css`; `globals.css` is the canonical source of truth)
- Support dark mode and light mode via the system `prefers-color-scheme` media query
- Display the app name/logo above the form card
- NOT include the main navigation header or sidebar
- All buttons and interactive targets MUST be ≥ 44×44pt (touch-friendly)
- No hover-only interactions; all interactive states must be accessible via tap/focus
