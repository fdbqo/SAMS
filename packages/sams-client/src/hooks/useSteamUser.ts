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
