'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import FieldError from '@/components/auth/FieldError';
import { registerAction, type RegisterState } from './actions';
import { RegisterSchema } from '@/lib/validations/auth';

type RegisterFormValues = z.infer<typeof RegisterSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full min-h-[44px] bg-primary text-background font-semibold rounded-lg px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
    >
      {pending ? 'Creating account…' : 'Create Account'}
    </button>
  );
}

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);

  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    // Trigger confirmPassword re-validation when password changes
  }, []);

  if (state.success && state.message) {
    return (
      <AuthCard title="Check your email">
        <div
          role="alert"
          className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          {state.message}
        </div>
        <p className="mt-4 text-center text-sm text-text/70">
          <Link
            href="/login"
            className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            Back to Sign In
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create Account">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              onChange: () => trigger('confirmPassword'),
            })}
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            {...register('confirmPassword')}
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <FieldError id="confirm-password-error" message={errors.confirmPassword?.message} />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-text/70">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
