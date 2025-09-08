export interface SteamUser {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
  sessionId?: string;
  sessionData?: {
    clientApp?: string;
    createdAt: number;
    expiresAt: number;
    lastAccessed: number;
  };
}

export interface SamsConfig {
  samsUrl: string;
  autoRefresh?: boolean;
  storage?: 'cookies' | 'localStorage';
  onLogin?: (user: SteamUser) => void;
  onLogout?: () => void;
  onError?: (error: SamsError) => void;
}

export interface SamsError extends Error {
  code: string;
}

export interface AuthState {
  user: SteamUser | null;
  loading: boolean;
  error: SamsError | null;
}
