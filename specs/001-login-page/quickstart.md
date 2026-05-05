# Quickstart: Login Page (001-login-page)

**Feature**: Login Page / Authentication
**Branch**: `001-login-page`
**Date**: 2026-05-04

This guide walks through running the authentication feature locally from scratch.

---

## Prerequisites

- Node.js 20+ installed
- A Supabase project created at [supabase.com](https://supabase.com) (free tier is sufficient)
- Google and/or GitHub OAuth apps configured in the Supabase Auth dashboard

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

> **Note**: The workspace already has a `docs/` folder and color palette CSS. After scaffolding,
> use `docs/styles.css` as reference material to seed `src/app/globals.css` with the app's
> **global design tokens**. `globals.css` becomes the canonical source of truth — these tokens apply
> across the entire application, not just auth pages.

---

## 2. Install auth dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
```

---

## 3. Configure environment variables

Create `.env.local` at the project root (never commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```

Find these values in the Supabase dashboard under **Project Settings → API**.

---

## 4. Configure OAuth providers (Supabase dashboard)

1. In your Supabase project, go to **Authentication → Providers**.
2. Enable **Google** and paste your Google OAuth Client ID + Secret.
3. Enable **GitHub** and paste your GitHub OAuth App Client ID + Secret.
4. Under **Authentication → URL Configuration**, add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

---

## 5. Start the development server

```bash
npm run dev
```

Navigate to [http://localhost:3000/login](http://localhost:3000/login).

---

## 6. Verify each auth flow

### Email/Password sign-in
1. Navigate to `/register` and create a test account.
2. Check your email inbox and click the confirmation link.
3. Navigate to `/login` and sign in with those credentials.
4. Confirm you are redirected to `/` (dashboard placeholder).

### OAuth sign-in
1. Click "Continue with Google" on `/login`.
2. Complete the Google consent screen.
3. Confirm redirect to `/` with a session active.

### Forgot password
1. Navigate to `/forgot-password` and submit a registered email.
2. Click the link in the received email.
3. You should arrive at a "reset password" page (to be built in a future iteration).

### Redirect-after-login
1. Navigate directly to `/dashboard` while unauthenticated.
2. Confirm redirect to `/login?next=/dashboard`.
3. Sign in and confirm you land on `/dashboard`.

---

## 7. Running tests (once implemented)

```bash
npm run test          # unit + integration tests (Jest)
npm run test:e2e      # end-to-end tests (Playwright)
```
