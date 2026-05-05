'use client';

import { useActionState, useEffect, useRef, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import FieldError from '@/components/auth/FieldError';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { signInAction, type SignInState } from './actions';

const ERROR_MAP: Record<string, string> = {
  'oauth-cancelled': 'Sign-in was cancelled.',
  'auth-code-error': 'Authentication failed. Please try again.',
  'link-expired': 'This link has expired. Please request a new one.',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full min-h-[44px] bg-primary text-background font-semibold rounded-lg px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
    >
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  );
}

const initialState: SignInState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const errorParam = searchParams.get('error');
  const paramError = errorParam ? (ERROR_MAP[errorParam] ?? 'Something went wrong. Please try again.') : undefined;

  const [state, formAction] = useActionState(signInAction, initialState);
  const firstErrorRef = useRef<HTMLInputElement>(null);

  const displayError = state.error ?? paramError;

  useEffect(() => {
    if (state.error) {
      firstErrorRef.current?.focus();
    }
  }, [state.error]);

  return (
    <AuthCard title="Sign In">
      {displayError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {displayError}
        </div>
      )}

      <OAuthButtons next={next} />

      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 border-t border-secondary/30" />
        <span className="text-xs text-text/50 uppercase tracking-wider">or</span>
        <div className="flex-1 border-t border-secondary/30" />
      </div>

      <form action={formAction} noValidate className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            Email
          </label>
          <input
            ref={firstErrorRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full min-h-[44px] rounded-lg border border-secondary/40 bg-background px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-text/70">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCard title="Sign In"><div className="h-40" /></AuthCard>}>
      <LoginForm />
    </Suspense>
  );
}
