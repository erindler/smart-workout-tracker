'use server';

import { createClient } from '@/lib/supabase/server';
import { ForgotPasswordSchema } from '@/lib/validations/auth';
import { headers } from 'next/headers';

export type ForgotPasswordState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const raw = { email: formData.get('email') };

  const result = ForgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message;
    return { error: firstError ?? 'Invalid input.' };
  }

  const { email } = result.data;

  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    });
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }

  // ALWAYS return generic success — prevents email enumeration (SC-005 principle)
  return {
    success: true,
    message: 'If that email is registered, a reset link was sent.',
  };
}
