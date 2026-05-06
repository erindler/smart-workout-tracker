import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSafeRedirect } from '@/lib/supabase/middleware';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const errorParam = searchParams.get('error');
  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}/login?error=oauth-cancelled`);
  }

  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    // Build the redirect response up-front so cookies can be written directly onto it.
    const redirectUrl = `${baseUrl}${getSafeRedirect(next)}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error.status, error.message);
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`);
}
