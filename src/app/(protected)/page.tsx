'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-8 text-text/70">You are signed in.</p>
      <button
        onClick={handleSignOut}
        className="min-h-[44px] px-6 py-2 bg-primary text-background rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Sign Out
      </button>
    </main>
  );
}
