import { useState, useEffect } from 'react';
import { useSamsConfig } from '../context';

export function useSteamSession() {
  const config = useSamsConfig();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${config.samsUrl}/api/auth/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
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

  return {
    isAuthenticated,
    loading
  };
}
