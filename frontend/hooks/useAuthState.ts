"use client"

import { useEffect, useState } from 'react';
import { authService, AuthUser } from '@/services/auth.service';

interface UseAuthStateResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasToken: boolean;
  loading: boolean;
}

export function useAuthState(): UseAuthStateResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncAuth = async () => {
      const tokenPresent = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));
      setHasToken(tokenPresent);

      if (!tokenPresent) {
        if (!isMounted) return;
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await authService.getUser();
      if (!isMounted) return;

      if (!currentUser && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        setHasToken(false);
      }

      setUser(currentUser);
      setLoading(false);
    };

    syncAuth();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        syncAuth();
      }
    };

    const onAuthChanged = () => {
      syncAuth();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(authService.AUTH_CHANGED_EVENT, onAuthChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(authService.AUTH_CHANGED_EVENT, onAuthChanged);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    hasToken,
    loading,
  };
}
