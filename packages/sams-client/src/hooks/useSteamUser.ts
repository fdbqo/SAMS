import { useCallback } from 'react';
import { SteamUser } from '../types';
import { useSteamAuth } from './useSteamAuth';

export function useSteamUser() {
  const { user, loading, refresh } = useSteamAuth();

  const refreshUser = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    user,
    loading,
    refreshUser
  };
}
