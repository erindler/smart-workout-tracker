'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import FieldError from '@/components/auth/FieldError';
import { requestPasswordResetAction, type ForgotPasswordState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full min-h-[44px] bg-primary text-background font-semibold rounded-lg px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
    >
      {pending ? 'Sending…' : 'Send Reset Link'}
    </button>
  );
}

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <AuthCard title="Reset Password">
      {state.success && state.message && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          {state.message}
        </div>
      )}

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
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby="email-error"
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
          />
          <FieldError id="email-error" />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-text/70">
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
