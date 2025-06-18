import { useState } from 'react';

export default function useLoadingState(_key: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = async (fn: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, withLoading };
}
