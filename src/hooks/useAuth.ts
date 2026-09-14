// ==============================================================================
// Hook useAuth — State Otentikasi Pengguna Real-Time
// ==============================================================================

import { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { googleAuthService } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => googleAuthService.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = googleAuthService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await googleAuthService.loginWithGoogle();
      setUser(loggedUser);
      return loggedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login Google gagal.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    googleAuthService.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
  };
};
