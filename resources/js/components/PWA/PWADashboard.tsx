/**
 * PWA Dashboard Component
 * Comprehensive dashboard for managing PWA features and settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Smartphone,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Database,
  Settings,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Monitor,
  Tablet,
  Globe,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import PWAInstallPrompt from './PWAInstallPrompt';
import OfflineSync from './OfflineSync';
import { pushNotificationService, type NotificationStats } from '@/services/pushNotificationService';

interface PWADashboardProps {
  className?: string;
}

interface PWAStats {
  installPrompts: number;
  installations: number;
  activeUsers: number;
  offlineUsage: number;
  notificationStats: NotificationStats;
}

const PWADashboard: React.FC<PWADashboardProps> = ({ className = '' }) => {
  const {
    isOnline,
    isInstallable,
    isInstalled,
    isStandalone,
    notificationPermission,
    serviceWorkerStatus,
    isLoading,
    error,
    installPWA,
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    checkForUpdates,
    clearCache
  } = usePWA();

  const [activeTab, setActiveTab] = useState('overview');
  const [pwaStats, setPwaStats] = useState<PWAStats>({
    installPrompts: 0,
    installations: 0,
    activeUsers: 0,
    offlineUsage: 0,
    notificationStats: {
      sent: 0,
      delivered: 0,
      clicked: 0,
      dismissed: 0,
      failed: 0
    }
  });
  const [settings, setSettings] = useState({
    autoSync: true,
    backgroundSync: true,
    pushNotifications: notificationPermission === 'granted',
    offlineMode: true,
    autoUpdate: true
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Load PWA statistics
   */
  const loadPWAStats = async (): Promise<void> => {
    try {
      const [installStats, notificationStats] = await Promise.all([
        fetch('/api/pwa/stats').then(res => res.ok ? res.json() : {}),
        pushNotificationService.getNotificationStats()
      ]);

      setPwaStats({
        installPrompts: installStats.installPrompts || 0,
        installations: installStats.installations || 0,
        activeUsers: installStats.activeUsers || 0,
        offlineUsage: installStats.offlineUsage || 0,
        notificationStats
      });
    } catch (error) {
      console.error('Failed to load PWA stats:', error);
    }
  };

  /**
   * Handle settings change
   */
  const handleSettingChange = async (key: keyof typeof settings, value: boolean): Promise<void> => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Handle specific setting changes
    switch (key) {
      case 'pushNotifications':
        if (value) {
          try {
            await requestNotificationPermission();
            await subscribeToNotifications();
          } catch (error) {
            console.error('Failed to enable push notifications:', error);
            setSettings(prev => ({ ...prev, [key]: false }));
          }
        } else {
          try {
            await unsubscribeFromNotifications();
          } catch (error) {
            console.error('Failed to disable push notifications:', error);
          }
        }
        break;

      default:
        // Save other settings to localStorage
        localStorage.setItem(`pwa_setting_${key}`, value.toString());
        break;
    }
  };

  /**
   * Handle PWA update
   */
  const handleUpdate = async (): Promise<void> => {
    try {
      setIsUpdating(true);
      await checkForUpdates();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Test notification
   */
  const testNotification = async (): Promise<void> => {
    try {
      await pushNotificationService.testNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  /**
   * Get device type icon
   */
  const getDeviceIcon = (): React.ReactNode => {
    if (isStandalone) {
      return <Smartphone className="h-5 w-5 text-blue-500" />;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) {
      return <Smartphone className="h-5 w-5 text-gray-500" />;
    } else if (userAgent.includes('tablet')) {
      return <Tablet className="h-5 w-5 text-gray-500" />;
    } else {
      return <Monitor className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'granted':
      case 'online':
        return 'text-green-500';
      case 'installing':
      case 'updating':
        return 'text-blue-500';
      case 'denied':
      case 'offline':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = {
      autoSync: localStorage.getItem('pwa_setting_autoSync') !== 'false',
      backgroundSync: localStorage.getItem('pwa_setting_backgroundSync') !== 'false',
      pushNotifications: notificationPermission === 'granted',
      offlineMode: localStorage.getItem('pwa_setting_offlineMode') !== 'false',
      autoUpdate: localStorage.getItem('pwa_setting_autoUpdate') !== 'false'
    };
    setSettings(loadedSettings);
  }, [notificationPermission]);

  // Load PWA stats on mount
  useEffect(() => {
    loadPWAStats();
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PWA Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Progressive Web App features and settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getDeviceIcon()}
          <Badge variant={isStandalone ? 'default' : 'secondary'}>
            {isStandalone ? 'Installed' : 'Browser'}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">{isOnline ? 'Online' : 'Offline'}</div>
                <div className="text-sm text-muted-foreground">Connection</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className={`h-5 w-5 ${getStatusColor(isInstalled ? 'active' : 'inactive')}`} />
              <div>
                <div className="font-medium">{isInstalled ? 'Installed' : 'Not Installed'}</div>
                <div className="text-sm text-muted-foreground">PWA Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className={`h-5 w-5 ${getStatusColor(notificationPermission)}`} />
              <div>
                <div className="font-medium capitalize">{notificationPermission}</div>
                <div className="text-sm text-muted-foreground">Notifications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className={`h-5 w-5 ${getStatusColor(serviceWorkerStatus)}`} />
              <div>
                <div className="font-medium capitalize">{serviceWorkerStatus}</div>
                <div className="text-sm text-muted-foreground">Service Worker</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pwaStats.installations}</div>
                    <div className="text-sm text-muted-foreground">Installations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pwaStats.activeUsers}</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pwaStats.offlineUsage}%</div>
                    <div className="text-sm text-muted-foreground">Offline Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pwaStats.notificationStats.sent}</div>
                    <div className="text-sm text-muted-foreground">Notifications</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Feature Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Offline Support</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  {notificationPermission === 'granted' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Sync</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">App Installation</span>
                  {isInstallable || isInstalled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Service Worker</span>
                  {serviceWorkerStatus === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Installation Tab */}
        <TabsContent value="installation" className="space-y-4">
          <PWAInstallPrompt className="max-w-2xl" />

          <Card>
            <CardHeader>
              <CardTitle>App Updates</CardTitle>
              <CardDescription>
                Keep your app up to date with the latest features and improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Check for Updates</div>
                  <div className="text-sm text-muted-foreground">
                    {lastUpdate ? `Last checked: ${lastUpdate.toLocaleString()}` : 'Never checked'}
                  </div>
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                  {isUpdating ? 'Checking...' : 'Check Now'}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Clear Cache</div>
                  <div className="text-sm text-muted-foreground">
                    Clear cached data to free up space
                  </div>
                </div>
                <Button
                  onClick={clearCache}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Manage push notification settings and test functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive important updates and alerts
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  disabled={notificationPermission === 'denied'}
                />
              </div>

              {notificationPermission === 'denied' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Notifications are blocked. Please enable them in your browser settings.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Test Notification</div>
                  <div className="text-sm text-muted-foreground">
                    Send a test notification to verify functionality
                  </div>
                </div>
                <Button
                  onClick={testNotification}
                  disabled={notificationPermission !== 'granted'}
                  variant="outline"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="font-medium">Notification Statistics</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent:</span>
                    <span>{pwaStats.notificationStats.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivered:</span>
                    <span>{pwaStats.notificationStats.delivered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clicked:</span>
                    <span>{pwaStats.notificationStats.clicked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dismissed:</span>
                    <span>{pwaStats.notificationStats.dismissed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Tab */}
        <TabsContent value="offline" className="space-y-4">
          <OfflineSync />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>PWA Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your Progressive Web App preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically sync data when online
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoSync}
                    onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Background Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync data in the background when app is closed
                    </div>
                  </div>
                  <Switch
                    checked={settings.backgroundSync}
                    onCheckedChange={(checked) => handleSettingChange('backgroundSync', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Offline Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Enable offline functionality and caching
                    </div>
                  </div>
                  <Switch
                    checked={settings.offlineMode}
                    onCheckedChange={(checked) => handleSettingChange('offlineMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Update</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically update the app when new versions are available
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoUpdate}
                    onCheckedChange={(checked) => handleSettingChange('autoUpdate', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWADashboard;
