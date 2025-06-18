/**
 * Offline Sync Component
 * Manages offline data synchronization and displays sync status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Upload,
  Download,
  Trash2
} from 'lucide-react';
import { offlineStorage, type OfflineAction, type SyncResult } from '@/utils/offlineStorage';
import { usePWA } from '@/hooks/usePWA';

interface OfflineSyncProps {
  className?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

interface StorageStats {
  actions: { pending: number; completed: number; failed: number };
  cache: { entries: number; size: number };
  storage: { used: number; quota: number };
}

const OfflineSync: React.FC<OfflineSyncProps> = ({
  className = '',
  autoSync = true,
  syncInterval = 30000 // 30 seconds
}) => {
  const { isOnline } = usePWA();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    actions: { pending: 0, completed: 0, failed: 0 },
    cache: { entries: 0, size: 0 },
    storage: { used: 0, quota: 0 }
  });
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load pending actions and storage stats
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [actions, stats] = await Promise.all([
        offlineStorage.getPendingActions(),
        offlineStorage.getStorageStats()
      ]);

      setPendingActions(actions);
      setStorageStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Failed to load offline data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Perform sync with server
   */
  const performSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    try {
      setSyncing(true);
      setSyncProgress(0);
      setError(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await offlineStorage.syncWithServer();

      clearInterval(progressInterval);
      setSyncProgress(100);

      setSyncResult(result);
      setLastSync(new Date());

      // Reload data to reflect changes
      await loadData();

      // Clean up old actions
      await offlineStorage.cleanupActions();
      await offlineStorage.clearExpiredCache();

      console.log('Sync completed:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, isSyncing, loadData]);

  /**
   * Clear all offline data
   */
  const clearAllData = useCallback(async () => {
    if (isSyncing) return;

    try {
      setIsLoading(true);
      await offlineStorage.clearAllData();
      await loadData();
      setSyncResult(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isSyncing, loadData]);

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  /**
   * Format date
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Get action priority color
   */
  const getPriorityColor = (priority: OfflineAction['priority']): string => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  /**
   * Get action method color
   */
  const getMethodColor = (method: OfflineAction['method']): string => {
    switch (method) {
      case 'POST': return 'default';
      case 'PUT':
      case 'PATCH': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || !isOnline) return;

    const interval = setInterval(() => {
      if (pendingActions.length > 0) {
        performSync();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, pendingActions.length, syncInterval, performSync]);

  // Load data on mount and when online status changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      performSync();
    }
  }, [isOnline, pendingActions.length, performSync]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-lg">
                {isOnline ? 'Online' : 'Offline'}
              </CardTitle>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <CardDescription>
            {isOnline
              ? 'Connected to server. Data will sync automatically.'
              : 'Working offline. Changes will sync when connection is restored.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Status</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={performSync}
                disabled={!isOnline || isSyncing || pendingActions.length === 0}
                size="sm"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              <Button
                onClick={loadData}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          {lastSync && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last sync: {formatDate(lastSync)}</span>
            </div>
          )}

          {syncResult && (
            <div className="space-y-2">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{syncResult.processed} synced</span>
                </div>
                {syncResult.failed > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{syncResult.failed} failed</span>
                  </div>
                )}
              </div>
              {syncResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {syncResult.errors.length} actions failed to sync. Check your connection and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Actions ({pendingActions.length})</span>
            </CardTitle>
            <CardDescription>
              Actions queued for synchronization when online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.slice(0, 5).map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getMethodColor(action.method)} className="text-xs">
                      {action.method}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.type}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {action.url}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                      {action.priority}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {action.retryCount}/{action.maxRetries}
                    </div>
                  </div>
                </div>
              ))}
              {pendingActions.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {pendingActions.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Storage Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Actions</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span>{storageStats.actions.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{storageStats.actions.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed:</span>
                  <span>{storageStats.actions.failed}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Cache</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entries:</span>
                  <span>{storageStats.cache.entries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{formatFileSize(storageStats.cache.size)}</span>
                </div>
              </div>
            </div>
          </div>

          {storageStats.storage.quota > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span>
                  {formatFileSize(storageStats.storage.used)} / {formatFileSize(storageStats.storage.quota)}
                </span>
              </div>
              <Progress
                value={(storageStats.storage.used / storageStats.storage.quota) * 100}
                className="h-2"
              />
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Clear all offline data
            </div>
            <Button
              onClick={clearAllData}
              disabled={isLoading || isSyncing}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OfflineSync;
