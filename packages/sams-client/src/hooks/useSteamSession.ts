import { useState, useEffect } from 'react';
import { useSamsConfig } from '../context';

export function useSteamSession() {
  const config = useSamsConfig();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
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

        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
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

  return {
    isAuthenticated,
    loading
  };
}
