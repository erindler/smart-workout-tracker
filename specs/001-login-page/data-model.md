# Data Model: Login Page (001-login-page)

**Feature**: Login Page / Authentication
**Branch**: `001-login-page`
**Date**: 2026-05-04

---

## Overview

Authentication state is managed entirely by **Supabase Auth**. This feature introduces no
custom database tables. The `auth.users` table is owned and managed by Supabase and is
referenced (but not modified) by application code in later features.

---

## Entities

### User (`auth.users` — managed by Supabase)

This entity is created and maintained by Supabase Auth. Application code reads it via the
Supabase client; it is never written to directly.

| Field              | Type                       | Description                                         |
|--------------------|----------------------------|-----------------------------------------------------|
| `id`               | `uuid` (PK)                | Globally unique user identifier                     |
| `email`            | `text`                     | User's email address (unique within the project)    |
| `created_at`       | `timestamptz`              | Account creation timestamp                          |
| `last_sign_in_at`  | `timestamptz`              | Timestamp of most recent successful sign-in         |
| `app_metadata`     | `jsonb`                    | Provider info (e.g., `{"provider": "google"}`)      |
| `user_metadata`    | `jsonb`                    | User-supplied profile data (set on registration)    |
| `confirmed_at`     | `timestamptz` (nullable)   | Set when email confirmation is completed            |
| `email_confirmed_at` | `timestamptz` (nullable) | Set when email is verified via Supabase flow        |

**Notes**:
- Passwords are hashed by Supabase Auth (Argon2id) and never exposed to application code.
- OAuth users never have a password; `app_metadata.provider` identifies the auth method (`{"provider": "google"}`).
- `confirmed_at` is set automatically by Supabase on first Google OAuth sign-in; no email confirmation step is required.

---

### Session (in-memory + cookie — managed by Supabase Auth + `@supabase/ssr`)

Sessions are not stored in a custom table. Supabase issues a short-lived JWT access token and
a long-lived refresh token. `@supabase/ssr` writes them to `HttpOnly` cookies.

| Property         | Details                                                                            |
|------------------|------------------------------------------------------------------------------------|
| Storage          | `HttpOnly` cookies set by `@supabase/ssr` middleware on every response             |
| Access token     | Short-lived JWT (default 1 hour), contains `sub` (user ID), `email`, `role`        |
| Refresh token    | Long-lived (default 60 days), single-use, rotated on each use                      |
| Refresh strategy | `middleware.ts` calls `updateSession()` on every request to silently refresh tokens |
| Session read     | Server: `supabase.auth.getClaims()` (JWT validation). Client: `supabase.auth.getSession()` |

---

## State Transitions

```
[Unauthenticated]
    │
    └─▶ Click Google OAuth button ──▶ [Google consent screen] ──▶ /auth/callback ──▶ [Authenticated]
              └─ cancel/error ──▶ /login (error message)

[Authenticated]
    └─▶ Sign out ──▶ [Session cleared] ──▶ [Unauthenticated] ──▶ /login
```

> **Descoped flows** (planned but not implemented): email/password sign-in, account
> registration with email confirmation, and password reset via email.

---

## Validation Rules

The only application-level validation is on the `next` redirect parameter, enforced in
`getSafeRedirect()` before every redirect:

| Field        | Rule                                               | Behaviour                  |
|--------------|----------------------------------------------------|----------------------------|
| `next` param | Must start with `/`, must NOT start with `//`      | Silently falls back to `/` |

> **Descoped**: `email`, `password`, and `confirmPassword` field validation rules were
> planned for email/password and registration flows. Those flows were never implemented.

---

## Future Extensions (out of scope for this feature)

- `profiles` table: a public Postgres table keyed by `user_id` (FK → `auth.users.id`) for
  storing display name, avatar, preferences. Will be added in a future feature.
- Row-level security (RLS) policies on `profiles` and workout tables will reference
  `auth.uid()` — the `id` from `auth.users`.
