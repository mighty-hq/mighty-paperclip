'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Home from './Home';

type AuthSessionResponse = {
  user?: {
    id?: string;
  } | null;
} | null;

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          if (mounted) {
            setIsAuthenticated(false);
          }
          return;
        }

        const session = (await response.json()) as AuthSessionResponse;
        if (mounted) {
          setIsAuthenticated(Boolean(session?.user));
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Home
      onOpenCommand={() => router.push('/auth')}
      onHeaderAction={() => router.push(isAuthenticated ? '/dashboard' : '/auth')}
      headerActionLabel={isAuthenticated ? 'Go to Dashboard' : 'Login'}
    />
  );
}
