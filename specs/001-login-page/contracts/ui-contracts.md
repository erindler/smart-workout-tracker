# UI Contracts: Login Page (001-login-page)

**Feature**: Login Page / Authentication
**Branch**: `001-login-page`
**Date**: 2026-05-04
**Last Updated**: 2026-05-09

> **Scope note**: Email/password, registration, and forgot-password contracts have been removed.
> Only Google OAuth is implemented. The `/register`, `/forgot-password`, and `/auth/confirm`
> routes were planned but never shipped; their contracts are removed from this document.

This document defines the observable UI contracts for each auth page and route handler:
the URLs, inputs, outputs, redirects, and user-visible messages.

---

## Pages

### `/login` --- Sign In Page

**Route file**: `app/(auth)/login/page.tsx`

**Method**: GET (Server Component --- no email/password form POST)

**Query params**:

| Param   | Description                                                                                    |
|---------|------------------------------------------------------------------------------------------------|
| `next`  | Relative path to redirect to after successful sign-in. Sanitized; falls back to `/`.          |
| `error` | Error code appended by `/auth/callback` on failure. Displayed as a banner at the top.         |

**Outputs**:

| Condition                          | UI Outcome                                              |
|------------------------------------|---------------------------------------------------------|
| `?error=oauth-cancelled`           | Banner: 'Sign-in was cancelled.'                        |
| `?error=auth-code-error`          | Banner: 'Authentication failed. Please try again.'      |
| Any unrecognized `?error=` value   | Banner: 'Something went wrong. Please try again.'       |
| No error param                     | Google sign-in button only                              |
| Already authenticated              | Immediate redirect to `/` (handled by proxy middleware) |

**Elements on page**:
- App name heading ('Smart Workout Tracker') via `AuthCard`
- 'Continue with Google' button (4-color Google G logo) --- triggers `signInWithOAuthAction('google')`


---

## Route Handlers

### `GET /auth/callback` --- OAuth PKCE Code Exchange

**Route file**: `app/auth/callback/route.ts`

**Query params**:

| Param   | Description                                                      |
|---------|------------------------------------------------------------------|
| `code`  | PKCE authorization code from Supabase OAuth flow                 |
| `next`  | Relative path to redirect after success. Sanitized.              |
| `error` | Present on OAuth cancellation or failure (from OAuth provider)   |

**Behavior**:

| Condition                              | Outcome                                                                     |
|----------------------------------------|-----------------------------------------------------------------------------|
| `code` present + exchange succeeds     | Redirect to `next` (default `/`); session cookies written onto response   |
| `code` present + exchange fails        | Redirect to `/login?error=auth-code-error`                                  |
| `error` param present (OAuth denied)   | Redirect to `/login?error=oauth-cancelled`                                  |
| Neither `code` nor `error`           | Redirect to `/login?error=auth-code-error`                                  |

> **Implementation note**: The Supabase client in this route is created with `response.cookies.set`
> bound directly to the `NextResponse.redirect()` object. Using `next/headers` cookies here
> silently discards the session tokens --- `HttpOnly` cookies set via `next/headers` are not
> attached to an explicit redirect response.

---

## Error Query Params on `/login`

When `/auth/callback` redirects back to `/login` with an error, it appends `?error=<code>`:

| `error` value      | Displayed message                                |
|---------------------|--------------------------------------------------|
| `auth-code-error` | 'Authentication failed. Please try again.'       |
| `oauth-cancelled` | 'Sign-in was cancelled.'                         |
| *(any other)*       | 'Something went wrong. Please try again.'        |

---

## Shared Layout Contract

**Route file**: `app/(auth)/layout.tsx`

All auth pages are wrapped in this layout. It MUST:
- **Desktop** (>= 640px): Center the form card horizontally and vertically as a constrained-width card (`sm:max-w-sm`)
- **Mobile portrait** (< 640px): Render full-width with horizontal padding (`px-4`); no horizontal scrollbar
- Apply the app color palette via CSS custom properties in `src/app/globals.css` (seeded from `docs/styles.css`)
- Support dark mode and light mode via the system `prefers-color-scheme` media query
- Display the app name above the content (via `AuthCard` heading)
- NOT include the main navigation header or sidebar
- All buttons and interactive targets MUST be >= 44x44pt (`min-h-[44px]`)
- No hover-only interactions; all interactive states accessible via tap/focus

