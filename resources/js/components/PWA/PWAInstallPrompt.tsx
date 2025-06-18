import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Download,
  X,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Home,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className,
  onInstall,
  onDismiss
}) => {
  const { t } = useTranslation('common');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstallation();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay if not dismissed recently
      const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
      const daysSinceDismissed = lastDismissed
        ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
        : 7;

      if (daysSinceDismissed >= 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);

      // Track installation
      fetch('/pwa/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      }).catch(console.error);

      onInstall?.();
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    onDismiss?.();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Subscribe to push notifications
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
          });

          // Send subscription to server
          await fetch('/pwa/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(subscription)
          });
        } catch (error) {
          console.error('Push subscription failed:', error);
        }
      }
    }
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent;

    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return {
        icon: <Share className="h-4 w-4" />,
        text: t('pwa.install.instructions.ios', 'Tap the Share button and select "Add to Home Screen"')
      };
    } else if (/Android/.test(userAgent)) {
      return {
        icon: <Home className="h-4 w-4" />,
        text: t('pwa.install.instructions.android', 'Tap "Add to Home Screen" from the browser menu')
      };
    } else {
      return {
        icon: <Download className="h-4 w-4" />,
        text: t('pwa.install.instructions.desktop', 'Click the install button in your browser\'s address bar')
      };
    }
  };

  if (isInstalled) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Smartphone className="h-3 w-3 mr-1" />
          {t('pwa.status.installed', 'App Installed')}
        </Badge>
        {!isOnline && (
          <Badge variant="destructive">
            <WifiOff className="h-3 w-3 mr-1" />
            {t('pwa.status.offline', 'Offline')}
          </Badge>
        )}
      </div>
    );
  }

  if (!showPrompt || !deferredPrompt) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {!isOnline && (
          <Alert className="border-orange-200 bg-orange-50">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              {t('pwa.messages.offline_warning', 'You\'re offline. Some features may be limited.')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const instructions = getInstallInstructions();

  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{t('pwa.install.title', 'Install SND Rental App')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {t('pwa.install.description', 'Get faster access and work offline by installing our app on your device.')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Wifi className="h-4 w-4" />
            <span>{t('pwa.features.offline', 'Works offline')}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-700">
            <Download className="h-4 w-4" />
            <span>{t('pwa.features.faster_loading', 'Faster loading')}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-700">
            <Bell className="h-4 w-4" />
            <span>{t('pwa.features.notifications', 'Push notifications')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('pwa.install.installing', 'Installing...')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('pwa.install.button', 'Install App')}
              </>
            )}
          </Button>

          {notificationPermission === 'default' && (
            <Button
              variant="outline"
              onClick={requestNotificationPermission}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t('pwa.notifications.enable', 'Enable Notifications')}
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-white rounded-lg border">
          {instructions.icon}
          <p className="text-sm text-gray-600">
            <strong>{t('pwa.install.manual', 'Manual installation:')}</strong> {instructions.text}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span>{t('pwa.status.online', 'Online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span>{t('pwa.status.offline', 'Offline')}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {notificationPermission === 'granted' ? (
              <>
                <Bell className="h-3 w-3 text-green-500" />
                <span>{t('pwa.notifications.enabled', 'Notifications enabled')}</span>
              </>
            ) : (
              <>
                <BellOff className="h-3 w-3 text-gray-400" />
                <span>{t('pwa.notifications.disabled', 'Notifications disabled')}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
