import { useState, useEffect } from 'react';
import { useSamsConfig } from '../context';

export function useSteamSession() {
  const config = useSamsConfig();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get session ID from localStorage
        const sessionId = localStorage.getItem('sams_session_id');
        
        if (!sessionId) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(`${config.samsUrl}/api/auth/session?sessionId=${encodeURIComponent(sessionId)}`, {
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
