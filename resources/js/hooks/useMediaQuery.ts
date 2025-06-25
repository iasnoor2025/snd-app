import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const getMatches = (query: string): boolean => {
        // Check if window is available (client-side)
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean>(getMatches(query));

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        // Handle change event
        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add event listener
        if (mediaQuery.addListener) {
            // Deprecated but needed for older browsers
            mediaQuery.addListener(handleChange);
        } else {
            mediaQuery.addEventListener('change', handleChange);
        }

        // Set initial value
        setMatches(mediaQuery.matches);

        // Cleanup
        return () => {
            if (mediaQuery.removeListener) {
                // Deprecated but needed for older browsers
                mediaQuery.removeListener(handleChange);
            } else {
                mediaQuery.removeEventListener('change', handleChange);
            }
        };
    }, [query]);

    return matches;
} 