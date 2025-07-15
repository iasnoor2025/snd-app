import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface PWAState {
    isInstalled: boolean;
    isInstallable: boolean;
    isOnline: boolean;
    isStandalone: boolean;
    notificationPermission: NotificationPermission;
    hasServiceWorker: boolean;
    isLoading: boolean;
    error: string | null;
}

interface PWAActions {
    install: () => Promise<boolean>;
    requestNotificationPermission: () => Promise<NotificationPermission>;
    subscribeToNotifications: () => Promise<boolean>;
    unsubscribeFromNotifications: () => Promise<boolean>;
    checkForUpdates: () => Promise<boolean>;
    clearCache: () => Promise<void>;
    getInstallationStats: () => Promise<any>;
}

interface UsePWAReturn extends PWAState, PWAActions {}

// Enhanced online detection function
const checkOnlineStatus = async (): Promise<boolean> => {
    if (!navigator.onLine) {
        return false;
    }

    try {
        // Try to fetch a small resource from the same origin
        const response = await fetch('/up', {
            method: 'HEAD',
            cache: 'no-cache',
            timeout: 5000,
        } as any);
        return response.ok;
    } catch {
        // If fetch fails, still consider online if navigator.onLine is true
        // This prevents false offline detection in development
        return navigator.onLine;
    }
};

const usePWA = (): UsePWAReturn => {
    const [state, setState] = useState<PWAState>({
        isInstalled: false,
        isInstallable: false,
        isOnline: true, // Default to true to prevent false offline detection
        isStandalone: false,
        notificationPermission: 'Notification' in window ? Notification.permission : 'denied',
        hasServiceWorker: 'serviceWorker' in navigator,
        isLoading: false,
        error: null,
    });

    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    // Check if app is installed/standalone
    const checkInstallationStatus = useCallback(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        const isInstalled = isStandalone || isInWebAppiOS;

        setState((prev) => ({
            ...prev,
            isInstalled,
            isStandalone: isStandalone || isInWebAppiOS,
        }));
    }, []);

    // Enhanced online status check
    const updateOnlineStatus = useCallback(async () => {
        const isOnline = await checkOnlineStatus();
        setState((prev) => ({ ...prev, isOnline }));
    }, []);

    // Register service worker
    const registerServiceWorker = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            setState((prev) => ({ ...prev, hasServiceWorker: false }));
            return null;
        }

        // Skip service worker registration in development
        const isProduction =
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== 'new_snd_app.test' &&
            !window.location.hostname.includes('127.0.0.1');

        if (!isProduction) {
            console.log('Service Worker registration skipped in development mode');

            // Unregister any existing service workers in development
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('Unregistered existing service worker in development mode');
                }
            } catch (error) {
                console.log('Failed to unregister service workers:', error);
            }

            setState((prev) => ({ ...prev, hasServiceWorker: false }));
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            console.log('Service Worker registered:', registration);

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available
                            console.log('New content available, please refresh.');
                        }
                    });
                }
            });

            setState((prev) => ({ ...prev, hasServiceWorker: true }));
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            setState((prev) => ({
                ...prev,
                hasServiceWorker: false,
                error: 'Failed to register service worker',
            }));
            return null;
        }
    }, []);

    // Install PWA
    const install = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) {
            setState((prev) => ({ ...prev, error: 'Installation not available' }));
            return false;
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA installation accepted');

                // Track installation
                await fetch('/pwa/install', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                setState((prev) => ({
                    ...prev,
                    isInstalled: true,
                    isInstallable: false,
                    isLoading: false,
                }));

                setDeferredPrompt(null);
                return true;
            } else {
                console.log('PWA installation dismissed');
                setState((prev) => ({ ...prev, isLoading: false }));
                return false;
            }
        } catch (error) {
            console.error('PWA installation failed:', error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: 'Installation failed',
            }));
            return false;
        }
    }, [deferredPrompt]);

    // Request notification permission
    const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
        if (!('Notification' in window)) {
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        try {
            const permission = await Notification.requestPermission();
            setState((prev) => ({ ...prev, notificationPermission: permission }));
            return permission;
        } catch (error) {
            console.error('Notification permission request failed:', error);
            return 'denied';
        }
    }, []);

    // Subscribe to push notifications
    const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setState((prev) => ({ ...prev, error: 'Push notifications not supported' }));
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                return true;
            }

            // Request notification permission first
            const permission = await requestNotificationPermission();
            if (permission !== 'granted') {
                return false;
            }

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
            });

            // Send subscription to server
            const response = await fetch('/pwa/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(subscription),
            });

            if (response.ok) {
                console.log('Push notification subscription successful');
                return true;
            } else {
                throw new Error('Failed to save subscription on server');
            }
        } catch (error) {
            console.error('Push notification subscription failed:', error);
            setState((prev) => ({ ...prev, error: 'Failed to subscribe to notifications' }));
            return false;
        }
    }, [requestNotificationPermission]);

    // Unsubscribe from push notifications
    const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
        if (!('serviceWorker' in navigator)) {
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push manager
                await subscription.unsubscribe();

                // Remove subscription from server
                await fetch('/pwa/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                console.log('Push notification unsubscription successful');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Push notification unsubscription failed:', error);
            setState((prev) => ({ ...prev, error: 'Failed to unsubscribe from notifications' }));
            return false;
        }
    }, []);

    // Check for service worker updates
    const checkForUpdates = useCallback(async (): Promise<boolean> => {
        if (!('serviceWorker' in navigator)) {
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();

            return registration.waiting !== null;
        } catch (error) {
            console.error('Failed to check for updates:', error);
            return false;
        }
    }, []);

    // Clear application cache
    const clearCache = useCallback(async (): Promise<void> => {
        if (!('caches' in window)) {
            return;
        }

        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
            console.log('Application cache cleared');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            setState((prev) => ({ ...prev, error: 'Failed to clear cache' }));
        }
    }, []);

    // Get PWA installation statistics
    const getInstallationStats = useCallback(async () => {
        try {
            const response = await fetch('/pwa/stats');
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch stats');
        } catch (error) {
            console.error('Failed to get installation stats:', error);
            return null;
        }
    }, []);

    // Setup event listeners
    useEffect(() => {
        // Initial checks
        checkInstallationStatus();
        updateOnlineStatus();
        registerServiceWorker();

        // Handle beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setState((prev) => ({ ...prev, isInstallable: true }));
        };

        // Handle app installed event
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setState((prev) => ({ ...prev, isInstallable: false, isInstalled: true }));
            console.log('PWA was installed');
        };

        // Listen for online/offline events
        const handleOnline = async () => {
            const isOnline = await checkOnlineStatus();
            setState((prev) => ({ ...prev, isOnline }));
        };

        const handleOffline = () => {
            setState((prev) => ({ ...prev, isOnline: false }));
        };

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = () => {
            checkInstallationStatus();
        };

        // Add event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        mediaQuery.addEventListener('change', handleDisplayModeChange);

        // Periodic online status check (every 30 seconds)
        const onlineCheckInterval = setInterval(updateOnlineStatus, 30000);

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            mediaQuery.removeEventListener('change', handleDisplayModeChange);
            clearInterval(onlineCheckInterval);
        };
    }, [checkInstallationStatus, registerServiceWorker, updateOnlineStatus]);

    // Monitor notification permission changes
    useEffect(() => {
        if ('Notification' in window) {
            const checkPermission = () => {
                setState((prev) => ({
                    ...prev,
                    notificationPermission: Notification.permission,
                }));
            };

            // Check permission periodically (some browsers don't fire events)
            const interval = setInterval(checkPermission, 5000);

            return () => clearInterval(interval);
        }
    }, []);

    return {
        ...state,
        install,
        requestNotificationPermission,
        subscribeToNotifications,
        unsubscribeFromNotifications,
        checkForUpdates,
        clearCache,
        getInstallationStats,
    };
};

export default usePWA;
export { usePWA };
export type { PWAActions, PWAState, UsePWAReturn };
