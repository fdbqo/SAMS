import React from 'react';
import { useSteamAuth } from '../hooks/useSteamAuth';

export interface SteamLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  onSuccess?: (user: any) => void;
  disabled?: boolean;
}

export function SteamLoginButton({ 
  className, 
  children, 
  onSuccess, 
  disabled = false 
}: SteamLoginButtonProps) {
  const { login, loading } = useSteamAuth();

  const handleClick = () => {
    if (onSuccess) {
      // Note: onSuccess will be called after successful login via the auth flow
      // This is just for immediate feedback
    }
    login();
  };

  return (
    <button 
      onClick={handleClick} 
      className={className}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : (children || 'Login with Steam')}
    </button>
  );
}
