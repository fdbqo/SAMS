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
      const response = await fetch(`${config.samsUrl}/api/auth/me`, {
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
