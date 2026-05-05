'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSafeRedirect } from '@/lib/supabase/middleware';
import { SignInSchema } from '@/lib/validations/auth';
import { headers } from 'next/headers';

export type SignInState = {
  error?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = SignInSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message;
    return { error: firstError ?? 'Invalid input.' };
  }

  const { email, password } = result.data;
  const next = formData.get('next');

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Return generic message — do not reveal which credential was wrong (FR-005)
    return { error: 'Invalid email or password.' };
  }

  redirect(getSafeRedirect(next));
}

export type OAuthSignInState = {
  error?: string;
};

export async function signInWithOAuthAction(
  provider: 'google' | 'github'
): Promise<OAuthSignInState> {
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect(data.url);
}
