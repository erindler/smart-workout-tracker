# Quickstart: Login Page (001-login-page)

**Feature**: Login Page / Authentication
**Branch**: `001-login-page`
**Date**: 2026-05-04
**Last Updated**: 2026-05-09

This guide walks through running the authentication feature locally from scratch.

---

## Prerequisites

- Node.js 20+ installed
- A Supabase project created at [supabase.com](https://supabase.com) (free tier is sufficient)
- A Google OAuth app configured in the Supabase Auth dashboard (see step 4)

---

## 1. Bootstrap the Next.js project

```bash
npx create-next-app@latest smart-workout-tracker \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd smart-workout-tracker
```

> **Next.js 16 breaking change**: This feature was built on **Next.js 16.2.4**, which renames
> `middleware.ts` to `proxy.ts`. The route guard lives at `src/proxy.ts` and must export a
> function named `proxy` (not `middleware`). If scaffolding produces a `src/middleware.ts`,
> rename it and update the export name.
>
> **Tailwind CSS v4** uses a CSS-first configuration � do NOT create `tailwind.config.ts`.
> All theme tokens go in `globals.css` via `@theme inline { --color-xxx: var(--xxx); }`.
>
> After scaffolding, use `docs/styles.css` as reference material to seed `src/app/globals.css`
> with the app global design tokens. `globals.css` is the canonical source of truth and applies
> across the entire application, not just auth pages.

---

## 2. Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --save-dev cross-env
```

> `cross-env` is required for the `NODE_TLS_REJECT_UNAUTHORIZED=0` dev workaround (see step 5).
> `react-hook-form`, `@hookform/resolvers`, and `zod` are listed in `package.json` from initial
> planning but are unused � the registration form was descoped.

---

## 3. Configure environment variables

Create `.env.local` at the project root (never commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```

Find these values in the Supabase dashboard under **Project Settings ? API**.

---

## 4. Configure Google OAuth

### Supabase dashboard

1. Go to **Authentication ? Providers** and enable **Google**.
2. Paste your Google OAuth **Client ID** and **Client Secret**.
3. Under **Authentication ? URL Configuration**, add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### Google Cloud Console

1. In your Google Cloud project, go to **APIs & Services ? Credentials**.
2. Edit your OAuth 2.0 Client ID.
3. Under **Authorized redirect URIs**, add:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   This is the Supabase-side URI. Supabase receives the code here and then redirects to your
   app's `/auth/callback`. Without this, Google will reject the OAuth flow.

---

## 5. Start the development server

```bash
npm run dev
```

> **Corporate network / SSL inspection note**: If your network uses SSL inspection (common in
> enterprise environments), Node.js may reject the self-signed certificate when calling the
> Supabase API, producing a `SELF_SIGNED_CERT_IN_CHAIN` error. The `dev` script includes
> `cross-env NODE_TLS_REJECT_UNAUTHORIZED=0` to bypass this. This flag is **dev-only** and is
> absent from `build` and `start`. It disables TLS validation only within the dev server
> process — no system-wide effect.
>
> A more secure alternative: obtain your corporate CA certificate from IT and set
> `NODE_EXTRA_CA_CERTS=/path/to/corp-ca.crt` instead.

Navigate to [http://localhost:3000/login](http://localhost:3000/login).

---

## 6. Verify the auth flow

### Google OAuth sign-in

1. Click "Continue with Google" on `/login`.
2. Complete the Google consent screen.
3. Confirm redirect to `/` — the dashboard shows "You are signed in."

### Already-authenticated redirect

1. While signed in, navigate to `/login`.
2. Confirm immediate redirect to `/`.

### Unauthenticated redirect-after-login

1. Sign out, then navigate directly to `/` while unauthenticated.
2. Confirm redirect to `/login?next=/`.
3. Sign in with Google and confirm you land back at `/`.

### OAuth cancellation

1. Click "Continue with Google", then cancel the Google consent screen.
2. Confirm you return to `/login` with "Sign-in was cancelled."

---

## 7. Running tests

```bash
npm run test          # unit tests (Jest)
```

Covers the `getSafeRedirect` open-redirect prevention (SC-004) — 6 passing test cases.

> Integration and E2E test suites (React Testing Library, Playwright) are out of scope for
> this feature.
>
> A more secure alternative: obtain your corporate CA certificate from IT and set
> `NODE_EXTRA_CA_CERTS=/path/to/corp-ca.crt` instead.

Navigate to [http://localhost:3000/login](http://localhost:3000/login).

---

## 6. Verify the auth flow

### Google OAuth sign-in

1. Click "Continue with Google" on `/login`.
2. Complete the Google consent screen.
3. Confirm redirect to `/` � the dashboard shows "You are signed in."

### Already-authenticated redirect

1. While signed in, navigate to `/login`.
2. Confirm immediate redirect to `/`.

### Unauthenticated redirect-after-login

1. Sign out, then navigate directly to `/` while unauthenticated.
2. Confirm redirect to `/login?next=/`.
3. Sign in with Google and confirm you land back at `/`.

### OAuth cancellation

1. Click "Continue with Google", then cancel the Google consent screen.
2. Confirm you return to `/login` with "Sign-in was cancelled."

---

## 7. Running tests

```bash
npm run test          # unit tests (Jest)
```

Covers the `getSafeRedirect` open-redirect prevention (SC-004) � 6 passing test cases.

> Integration and E2E test suites (React Testing Library, Playwright) are out of scope for
> this feature.
