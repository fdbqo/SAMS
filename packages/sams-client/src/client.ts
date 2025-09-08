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
      // Try to get access token from cookies first
      const accessToken = this.getCookie('sams_access_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // If we have an access token, use it for authorization
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.config.samsUrl}/api/auth/me`, {
        credentials: 'include',
        headers
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
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Logout user by calling SAMS logout endpoint
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.config.samsUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
