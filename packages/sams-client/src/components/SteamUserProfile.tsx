import React from 'react';
import { useSteamAuth } from '../hooks/useSteamAuth';

export interface SteamUserProfileProps {
  showAvatar?: boolean;
  showSteamId?: boolean;
  showProfileLink?: boolean;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  steamIdClassName?: string;
  profileLinkClassName?: string;
}

export function SteamUserProfile({
  showAvatar = true,
  showSteamId = false,
  showProfileLink = true,
  className = '',
  avatarClassName = '',
  nameClassName = '',
  steamIdClassName = '',
  profileLinkClassName = ''
}: SteamUserProfileProps) {
  const { user, loading } = useSteamAuth();

  if (loading) {
    return <div className={className}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      {showAvatar && (
        <img
          src={user.avatarUrl}
          alt={`${user.displayName}'s avatar`}
          className={avatarClassName}
        />
      )}
      <div className={nameClassName}>
        {user.displayName}
      </div>
      {showSteamId && (
        <div className={steamIdClassName}>
          Steam ID: {user.steamId}
        </div>
      )}
      {showProfileLink && (
        <a
          href={user.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={profileLinkClassName}
        >
          View Steam Profile
        </a>
      )}
    </div>
  );
}
