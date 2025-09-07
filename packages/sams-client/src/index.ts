// Core client
export { SamsClient } from './client';

// React context and provider
export { SamsProvider, useSamsConfig } from './context';

// React hooks
export { useSteamAuth } from './hooks/useSteamAuth';
export { useSteamUser } from './hooks/useSteamUser';
export { useSteamSession } from './hooks/useSteamSession';

// React components
export { SteamLoginButton } from './components/SteamLoginButton';
export { SteamUserProfile } from './components/SteamUserProfile';

// Types
export type { 
  SteamUser, 
  SamsConfig, 
  SamsError, 
  AuthState 
} from './types';

export type { 
  SamsProviderProps 
} from './context';

export type { 
  SteamLoginButtonProps 
} from './components/SteamLoginButton';

export type { 
  SteamUserProfileProps 
} from './components/SteamUserProfile';
