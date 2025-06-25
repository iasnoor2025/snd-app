import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';

export interface LayoutConfig {
    device: 'mobile' | 'tablet' | 'desktop';
    orientation: 'portrait' | 'landscape';
    breakpoints: Record<string, string>;
    navigation: {
        type: 'bottom-nav' | 'side-nav';
        collapsible: boolean;
        showLabels: boolean;
        maxItems: number;
        swipeable: boolean;
    };
    gestures: Record<string, boolean>;
    imageOptimization: {
        quality: number;
        maxWidth: number;
        formats: string[];
        lazyLoad: boolean;
        placeholder: string;
    };
    touchTargets: {
        minSize: string;
        spacing: string;
        feedback: boolean;
        highlightColor: string;
    };
    fontSizes: {
        base: string;
        scale: number;
        lineHeight: number;
        minSize: string;
        maxSize: string;
    };
    spacing: {
        base: string;
        scale: number;
        levels: number;
        minSpace: string;
        maxSpace: string;
    };
}

export interface UseResponsiveLayoutOptions {
    updateInterval?: number;
    enableGestures?: boolean;
    enableCache?: boolean;
}

export function useResponsiveLayout(options: UseResponsiveLayoutOptions = {}) {
    const {
        updateInterval = 1000,
        enableGestures = true,
        enableCache = true,
    } = options;

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Media queries for device detection
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // Media query for orientation
    const isPortrait = useMediaQuery('(orientation: portrait)');

    // Debounce window resize events
    const debouncedWidth = useDebounce(window.innerWidth, updateInterval);
    const debouncedHeight = useDebounce(window.innerHeight, updateInterval);

    // Fetch layout configuration from server
    const fetchLayoutConfig = useCallback(async () => {
        try {
            const headers = {
                'X-Device-Width': window.innerWidth.toString(),
                'X-Device-Height': window.innerHeight.toString(),
                'X-Device-Pixel-Ratio': window.devicePixelRatio.toString(),
                'X-Device-Orientation': isPortrait ? 'portrait' : 'landscape',
            };

            const response = await axios.get('/api/mobile-bridge/layout-config', { headers });
            setLayoutConfig(response.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch layout config'));
        } finally {
            setIsLoading(false);
        }
    }, [isPortrait]);

    // Update layout when screen size changes
    useEffect(() => {
        fetchLayoutConfig();
    }, [debouncedWidth, debouncedHeight, isPortrait, fetchLayoutConfig]);

    // Initialize gesture handling
    useEffect(() => {
        if (!enableGestures || !layoutConfig?.gestures) return;

        const gestureHandler = (event: TouchEvent) => {
            // Implement gesture handling logic here
            // This is a placeholder for actual gesture handling
            console.log('Gesture detected:', event.type);
        };

        if (isMobile || isTablet) {
            document.addEventListener('touchstart', gestureHandler);
            document.addEventListener('touchmove', gestureHandler);
            document.addEventListener('touchend', gestureHandler);

            return () => {
                document.removeEventListener('touchstart', gestureHandler);
                document.removeEventListener('touchmove', gestureHandler);
                document.removeEventListener('touchend', gestureHandler);
            };
        }
    }, [enableGestures, layoutConfig, isMobile, isTablet]);

    // Helper functions
    const getBreakpoint = useCallback((breakpoint: string): string => {
        return layoutConfig?.breakpoints[breakpoint] || '0px';
    }, [layoutConfig]);

    const getFontSize = useCallback((level: number): string => {
        if (!layoutConfig?.fontSizes) return '16px';

        const { base, scale, minSize, maxSize } = layoutConfig.fontSizes;
        const baseSize = parseFloat(base);
        const size = baseSize * Math.pow(scale, level);

        const min = parseFloat(minSize);
        const max = parseFloat(maxSize);

        return `${Math.min(Math.max(size, min), max)}px`;
    }, [layoutConfig]);

    const getSpacing = useCallback((level: number): string => {
        if (!layoutConfig?.spacing) return '16px';

        const { base, scale, minSpace, maxSpace } = layoutConfig.spacing;
        const baseSize = parseFloat(base);
        const size = baseSize * Math.pow(scale, level);

        const min = parseFloat(minSpace);
        const max = parseFloat(maxSpace);

        return `${Math.min(Math.max(size, min), max)}px`;
    }, [layoutConfig]);

    const optimizeImage = useCallback((src: string, options: Partial<LayoutConfig['imageOptimization']> = {}): string => {
        if (!layoutConfig?.imageOptimization) return src;

        const config = { ...layoutConfig.imageOptimization, ...options };
        const params = new URLSearchParams({
            width: config.maxWidth.toString(),
            quality: config.quality.toString(),
            format: config.formats[0],
        });

        return `/api/mobile-bridge/optimize-image?src=${encodeURIComponent(src)}&${params.toString()}`;
    }, [layoutConfig]);

    const getNavigationType = useCallback((): LayoutConfig['navigation']['type'] => {
        if (!layoutConfig?.navigation) return 'side-nav';

        if (isMobile) return 'bottom-nav';
        if (isTablet && layoutConfig.navigation.collapsible) return 'side-nav';
        return 'side-nav';
    }, [layoutConfig, isMobile, isTablet]);

    return {
        layoutConfig,
        isLoading,
        error,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        getBreakpoint,
        getFontSize,
        getSpacing,
        optimizeImage,
        getNavigationType,
    };
} 