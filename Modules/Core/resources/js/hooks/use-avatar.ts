import { useState, useEffect, useCallback } from 'react';
import { avatarService, type UserAvatarData, type AvatarOptions } from '../services/avatar-service';

interface UseAvatarReturn {
  avatarUrl: string;
  fallback: string;
  color: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAvatar(user: UserAvatarData, options: AvatarOptions = {}): UseAvatarReturn {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fallback, setFallback] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvatar = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await avatarService.getAvatarWithFallback(user, options);
      setAvatarUrl(result.url);
      setFallback(result.fallback);
      setColor(result.color);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load avatar');
      setFallback(avatarService.getInitials(user.name));
      setColor(avatarService.generateAvatarColor(user.name || user.id.toString()));
    } finally {
      setIsLoading(false);
    }
  }, [user, options]);

  const refresh = useCallback(() => {
    avatarService.clearCache();
    loadAvatar();
  }, [loadAvatar]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  return {
    avatarUrl,
    fallback,
    color,
    isLoading,
    error,
    refresh
  };
}

// Hook for getting initials only
export function useInitials() {
  return useCallback((fullName: string): string => {
    return avatarService.getInitials(fullName);
  }, []);
}

// Hook for generating avatar colors
export function useAvatarColor() {
  return useCallback((seed: string): string => {
    return avatarService.generateAvatarColor(seed);
  }, []);
}

// Hook for multiple avatars (useful for avatar groups)
export function useAvatars(users: UserAvatarData[], options: AvatarOptions = {}) {
  const [avatars, setAvatars] = useState<Array<{
    user: UserAvatarData;
    avatarUrl: string;
    fallback: string;
    color: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvatars = useCallback(async () => {
    if (!users || users.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        users.map(async (user) => {
          const result = await avatarService.getAvatarWithFallback(user, options);
          return {
            user,
            avatarUrl: result.url,
            fallback: result.fallback,
            color: result.color
          };
        })
      );
      setAvatars(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load avatars');
    } finally {
      setIsLoading(false);
    }
  }, [users, options]);

  const refresh = useCallback(() => {
    avatarService.clearCache();
    loadAvatars();
  }, [loadAvatars]);

  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  return {
    avatars,
    isLoading,
    error,
    refresh
  };
}



