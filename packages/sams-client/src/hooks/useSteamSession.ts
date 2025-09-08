import { useSteamAuth } from './useSteamAuth';

export function useSteamSession() {
  const { isAuthenticated, loading } = useSteamAuth();

  return {
    isAuthenticated,
    loading
  };
}
