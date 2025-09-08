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
      console.log("[client] Checking authentication...");
      console.log("[client] SAMS URL:", config.samsUrl);
      
      // Check for session ID in URL hash
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const sessionId = hashParams.get('sessionId');
      
      if (sessionId) {
        console.log("[client] Session callback detected, storing session ID");
        // Store session ID in localStorage
        localStorage.setItem('sams_session_id', sessionId);
        
        // Clear hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Try to get session ID from localStorage
      const storedSessionId = localStorage.getItem('sams_session_id');
      console.log("[client] Session ID found:", storedSessionId ? "Yes" : "No");
      
      if (!storedSessionId) {
        console.log("[client] No session ID available");
        setUser(null);
        return;
      }

      console.log("[client] Making request to /api/auth/user");
      const response = await fetch(`${config.samsUrl}/api/auth/user?sessionId=${encodeURIComponent(storedSessionId)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("[client] Response status:", response.status);

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
      
      // Get session ID before clearing it (with null check)
      const sessionId = localStorage.getItem('sams_session_id');
      
      // Clear local session first to prevent race conditions
      localStorage.removeItem('sams_session_id');
      setUser(null);
      
      // Call SAMS logout endpoint (optional - for server-side cleanup)
      if (sessionId) {
        try {
          await fetch(`${config.samsUrl}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
          });
        } catch (fetchError) {
          // Don't fail logout if server call fails - local cleanup is more important
          console.warn('Server logout call failed:', fetchError);
        }
      }
      
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
