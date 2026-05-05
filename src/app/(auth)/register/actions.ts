'use server';

import { createClient } from '@/lib/supabase/server';
import { RegisterSchema } from '@/lib/validations/auth';

export type RegisterState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const result = RegisterSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message;
    return { error: firstError ?? 'Invalid input.' };
  }

  const { email, password } = result.data;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes('already registered') || error.status === 422) {
      return { error: 'An account with this email already exists.' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: true, message: 'Check your email to confirm your account.' };
}
