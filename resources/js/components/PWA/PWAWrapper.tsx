import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import PWAInstallPrompt from './PWAInstallPrompt';
import OfflineSync from './OfflineSync';
import { pushNotificationService } from '@/services/pushNotificationService';
import { offlineStorage } from '@/utils/offlineStorage';

interface PWAWrapperProps {
    children: React.ReactNode;
}

const PWAWrapper: React.FC<PWAWrapperProps> = ({ children }) => {
    const {
        isOnline,
        isInstallable,
        isStandalone,
        notificationPermission,
        serviceWorkerStatus
    } = usePWA();

    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showOfflineSync, setShowOfflineSync] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Wait for document to be fully loaded before initializing PWA
        if (document.readyState === 'complete') {
            initializePWA();
        } else {
            window.addEventListener('load', initializePWA);
            return () => window.removeEventListener('load', initializePWA);
        }
    }, []);

    useEffect(() => {
        // Show install prompt if installable and not standalone
        if (isInstallable && !isStandalone && !localStorage.getItem('pwa_install_dismissed')) {
            const timer = setTimeout(() => {
                setShowInstallPrompt(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isInstallable, isStandalone]);

    useEffect(() => {
        // Show offline sync when going offline or when there are pending actions
        if (!isOnline) {
            setShowOfflineSync(true);
        } else {
            // Check for pending actions when coming back online
            checkPendingActions();
        }
    }, [isOnline]);

    const initializePWA = async () => {
        try {
            // Initialize offline storage
            await offlineStorage.init();

            // Register service worker if not already registered
            let registration: ServiceWorkerRegistration | undefined;

            // Skip service worker registration in development
            const isProduction = window.location.hostname !== 'localhost' &&
                                window.location.hostname !== 'new_snd_app.test' &&
                                !window.location.hostname.includes('127.0.0.1');

            if ('serviceWorker' in navigator && isProduction) {
                try {
                    // Check if service worker is already registered
                    registration = await navigator.serviceWorker.getRegistration();

                    if (!registration || serviceWorkerStatus !== 'activated') {
                        // Register service worker with proper error handling
                        registration = await navigator.serviceWorker.register('/sw.js', {
                            scope: '/'
                        });
                        console.log('Service Worker registered successfully:', registration);
                    } else {
                        // Use existing registration
                        registration = await navigator.serviceWorker.ready;
                        console.log('Using existing Service Worker registration');
                    }

                    // Initialize push notification service with service worker registration
                    if (registration) {
                        await pushNotificationService.initialize(registration);
                    }
                } catch (swError) {
                    console.error('Service Worker registration failed:', swError);
                    // Continue initialization even if SW fails
                }
            } else if (!isProduction) {
                console.log('Service Worker registration skipped in development mode');

                // Unregister any existing service workers in development
                if ('serviceWorker' in navigator) {
                    try {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                            console.log('Unregistered existing service worker in development mode');
                        }
                    } catch (error) {
                        console.log('Failed to unregister service workers:', error);
                    }
                }
            }

            setInitialized(true);
        } catch (error) {
            console.error('Failed to initialize PWA:', error);
            // Set initialized to true anyway to show the UI
            setInitialized(true);
        }
    };

    const checkPendingActions = async () => {
        try {
            const pendingActions = await offlineStorage.getPendingActions();
            if (pendingActions.length > 0) {
                setShowOfflineSync(true);
                // Auto-sync pending actions
                await offlineStorage.syncWithServer();
            }
        } catch (error) {
            console.error('Failed to check pending actions:', error);
        }
    };

    const handleInstallDismiss = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    const handleOfflineSyncClose = () => {
        setShowOfflineSync(false);
    };

    if (!initialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            {children}

            {/* PWA Install Prompt */}
            {showInstallPrompt && (
                <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
                    <PWAInstallPrompt onDismiss={handleInstallDismiss} />
                </div>
            )}

            {/* Offline Sync Status */}
            {showOfflineSync && (
                <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
                    <OfflineSync onClose={handleOfflineSyncClose} />
                </div>
            )}

            {/* Connection Status Indicator */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-40">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
                    </div>
                </div>
            )}

            {/* Service Worker Update Notification */}
            {serviceWorkerStatus === 'waiting' && (
                <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
                    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Update Available</h4>
                                <p className="text-sm opacity-90">A new version is ready to install.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if ('serviceWorker' in navigator) {
                                        navigator.serviceWorker.getRegistration().then(registration => {
                                            if (registration?.waiting) {
                                                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                                                window.location.reload();
                                            }
                                        });
                                    }
                                }}
                                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAWrapper;
