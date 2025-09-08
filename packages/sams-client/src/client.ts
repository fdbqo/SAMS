import { SteamUser, SamsConfig, SamsError } from './types';

export class SamsClient {
  private config: SamsConfig;

  constructor(config: SamsConfig) {
    this.config = config;
  }

  /**
   * Initiate Steam login by redirecting to SAMS instance
   */
  async login(): Promise<void> {
    try {
      const origin = encodeURIComponent(window.location.origin);
      const redirectTo = encodeURIComponent(window.location.pathname);
      window.location.href = `${this.config.samsUrl}/api/auth/steam?origin=${origin}&redirectTo=${redirectTo}`;
    } catch (error) {
      this.handleError(error as Error, 'LOGIN_ERROR');
    }
  }

  /**
   * Get current user from SAMS instance
   */
  async getUser(): Promise<SteamUser | null> {
    try {
      // Try to get session ID from localStorage
      const sessionId = localStorage.getItem('sams_session_id');
      
      if (!sessionId) {
        return null;
      }

      const response = await fetch(`${this.config.samsUrl}/api/auth/user?sessionId=${encodeURIComponent(sessionId)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      }

      return null;
    } catch (error) {
      this.handleError(error as Error, 'GET_USER_ERROR');
      return null;
    }
  }


  /**
   * Logout user by calling SAMS logout endpoint
   */
  async logout(): Promise<void> {
    try {
      // Get session ID before clearing it
      const sessionId = localStorage.getItem('sams_session_id');
      
      // Clear local session
      localStorage.removeItem('sams_session_id');
      
      // Call SAMS logout endpoint for server-side cleanup
      if (sessionId) {
        await fetch(`${this.config.samsUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      this.handleError(error as Error, 'LOGOUT_ERROR');
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  /**
   * Verify a token with SAMS instance
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: { steamId: string } }> {
    try {
      const response = await fetch(`${this.config.samsUrl}/api/auth/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        return await response.json();
      }

      return { valid: false };
    } catch (error) {
      this.handleError(error as Error, 'VERIFY_TOKEN_ERROR');
      return { valid: false };
    }
  }

  /**
   * Get user profile by Steam ID
   */
  async getUserProfile(steamId: string): Promise<SteamUser | null> {
    try {
      const response = await fetch(`${this.config.samsUrl}/api/auth/profile?steamId=${steamId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      this.handleError(error as Error, 'GET_PROFILE_ERROR');
      return null;
    }
  }

  /**
   * Handle errors with optional callback
   */
  private handleError(error: Error, code: string): void {
    const samsError: SamsError = {
      ...error,
      code
    };

    if (this.config.onError) {
      this.config.onError(samsError);
    } else {
      console.error('SAMS Error:', samsError);
    }
  }
}
