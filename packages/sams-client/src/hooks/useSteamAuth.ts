import { useState, useEffect, useCallback } from 'react';
import { SteamUser, SamsError } from '../types';
import { useSamsConfig } from '../context';

export function useSteamAuth() {
  const config = useSamsConfig();
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SamsError | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      
      // Try to get access token from cookies first
      const accessToken = getCookie('sams_access_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // If we have an access token, use it for authorization
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${config.samsUrl}/api/auth/me`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (config.onLogin) {
          config.onLogin(userData);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      const error = err as SamsError;
      error.code = 'AUTH_CHECK_ERROR';
      setError(error);
      setUser(null);
      if (config.onError) {
        config.onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    try {
      const origin = encodeURIComponent(window.location.origin);
      const redirectTo = encodeURIComponent(window.location.pathname);
      window.location.href = `${config.samsUrl}/api/auth/steam?origin=${origin}&redirectTo=${redirectTo}`;
    } catch (err) {
      const error = err as SamsError;
      error.code = 'LOGIN_ERROR';
      setError(error);
      if (config.onError) {
        config.onError(error);
      }
    }
  }, [config]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await fetch(`${config.samsUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUser(null);
      if (config.onLogout) {
        config.onLogout();
      }
    } catch (err) {
      const error = err as SamsError;
      error.code = 'LOGOUT_ERROR';
      setError(error);
      if (config.onError) {
        config.onError(error);
      }
    }
  }, [config]);

  const refresh = useCallback(() => {
    setLoading(true);
    checkAuth();
  }, [checkAuth]);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    isAuthenticated: !!user
  };
}
