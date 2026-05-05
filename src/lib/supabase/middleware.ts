import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns `next` only if it is a safe relative path (starts with `/` but NOT `//`).
 * Otherwise returns `fallback`. Prevents open-redirect attacks (SC-005).
 */
export function getSafeRedirect(next: unknown, fallback = '/'): string {
  if (typeof next !== 'string') return fallback;
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return fallback;
}

/**
 * Refreshes the user session on every request and enforces route protection.
 * Unauthenticated requests to protected routes are redirected to /login.
 *
 * IMPORTANT: Always return `supabaseResponse` unmodified to preserve cookie state.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validate the JWT server-side — do NOT use getSession() which trusts the cookie without re-validation.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === '/login' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
