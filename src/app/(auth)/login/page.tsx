import AuthCard from '@/components/auth/AuthCard';
import OAuthButtons from '@/components/auth/OAuthButtons';

const ERROR_MAP: Record<string, string> = {
  'oauth-cancelled': 'Sign-in was cancelled.',
  'auth-code-error': 'Authentication failed. Please try again.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error: errorParam, next = '' } = await searchParams;
  const paramError = errorParam
    ? (ERROR_MAP[errorParam] ?? 'Something went wrong. Please try again.')
    : undefined;

  return (
    <AuthCard title="Sign In">
      {paramError && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {paramError}
        </div>
      )}
      <OAuthButtons next={next} />
    </AuthCard>
  );
}
