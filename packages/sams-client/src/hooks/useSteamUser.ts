import { useState, useEffect, useCallback } from 'react';
import { SteamUser } from '../types';
import { useSamsConfig } from '../context';

export function useSteamUser() {
  const config = useSamsConfig();
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to get session ID from localStorage
      const sessionId = localStorage.getItem('sams_session_id');
      
      if (!sessionId) {
        setUser(null);
        return;
      }

      const response = await fetch(`${config.samsUrl}/api/auth/user?sessionId=${encodeURIComponent(sessionId)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [config.samsUrl]);


  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    refreshUser
  };
}
