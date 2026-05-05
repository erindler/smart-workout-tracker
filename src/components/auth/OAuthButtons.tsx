'use client';

import { useFormStatus } from 'react-dom';
import { signInWithOAuthAction } from '@/app/(auth)/login/actions';

function OAuthButton({
  provider,
  label,
  next,
}: {
  provider: 'google' | 'github';
  label: string;
  next?: string;
}) {
  const { pending } = useFormStatus();

  async function handleAction() {
    await signInWithOAuthAction(provider);
  }

  return (
    <form action={handleAction}>
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-secondary/40 bg-background px-4 py-2 text-sm font-medium text-text hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? `Connecting to ${label}…` : `Continue with ${label}`}
      </button>
    </form>
  );
}

interface OAuthButtonsProps {
  next?: string;
}

export default function OAuthButtons({ next }: OAuthButtonsProps) {
  return (
    <div className="space-y-3">
      <OAuthButton provider="google" label="Google" next={next} />
      <OAuthButton provider="github" label="GitHub" next={next} />
    </div>
  );
}
