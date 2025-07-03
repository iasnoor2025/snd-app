/**
 * Offline Storage Utility
 * Manages data persistence and synchronization for offline functionality
 */

interface OfflineAction {
  id: string;
  type: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
  version: string;
}

interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ action: OfflineAction; error: string }>;
}

class OfflineStorage {
  private dbName = 'snd-rental-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize IndexedDB
   */
  private async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('status', 'status', { unique: false });
          actionsStore.createIndex('priority', 'priority', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Queue an offline action
   */
  async queueAction(
    type: string,
    method: OfflineAction['method'],
    url: string,
    data?: any,
    options: {
      headers?: Record<string, string>;
      priority?: OfflineAction['priority'];
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    await this.ensureInitialized();

    const action: OfflineAction = {
      id: this.generateId(),
      type,
      method,
      url,
      data,
      headers: options.headers || {},
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 'medium',
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.add(action);

      request.onsuccess = () => {
        console.log('Action queued:', action.id);
        resolve(action.id);
      };

      request.onerror = () => {
        console.error('Failed to queue action:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all pending actions
   */
  async getPendingActions(): Promise<OfflineAction[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const actions = request.result.sort((a, b) => {
          // Sort by priority (high > medium > low) then by timestamp
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
        });
        resolve(actions);
      };

      request.onerror = () => {
        console.error('Failed to get pending actions:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update action status
   */
  async updateActionStatus(
    actionId: string,
    status: OfflineAction['status'],
    incrementRetry = false
  ): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.status = status;
          if (incrementRetry) {
            action.retryCount++;
          }

          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Action not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Remove completed or failed actions
   */
  async cleanupActions(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.getAll();

      request.onsuccess = () => {
        const actions = request.result;
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

        const deletePromises = actions
          .filter(action =>
            (action.status === 'completed' || action.status === 'failed') &&
            action.timestamp < cutoffTime
          )
          .map(action => {
            return new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = store.delete(action.id);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            });
          });

        Promise.all(deletePromises)
          .then(() => {
            console.log(`Cleaned up ${deletePromises.length} old actions`);
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache data with optional expiration
   */
  async cacheData(
    key: string,
    data: any,
    expirationMinutes?: number
  ): Promise<void> {
    await this.ensureInitialized();

    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined,
      version: '1.0.0'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cachedData);

      request.onsuccess = () => {
        console.log('Data cached:', key);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to cache data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<unknown | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const cachedData = request.result as CachedData;

        if (!cachedData) {
          resolve(null);
          return;
        }

        // Check if data has expired
        if (cachedData.expiresAt && Date.now() > cachedData.expiresAt) {
          // Remove expired data
          this.removeCachedData(key);
          resolve(null);
          return;
        }

        resolve(cachedData.data);
      };

      request.onerror = () => {
        console.error('Failed to get cached data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.getAll();

      request.onsuccess = () => {
        const cachedItems = request.result as CachedData[];
        const now = Date.now();

        const deletePromises = cachedItems
          .filter(item => item.expiresAt && now > item.expiresAt)
          .map(item => {
            return new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = store.delete(item.key);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            });
          });

        Promise.all(deletePromises)
          .then(() => {
            console.log(`Cleared ${deletePromises.length} expired cache entries`);
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sync pending actions with server
   */
  async syncWithServer(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    };

    try {
      const pendingActions = await this.getPendingActions();

      for (const action of pendingActions) {
        try {
          await this.updateActionStatus(action.id, 'processing');

          const response = await fetch(action.url, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
              ...action.headers
            },
            body: action.data ? JSON.stringify(action.data) : undefined
          });

          if (response.ok) {
            await this.updateActionStatus(action.id, 'completed');
            result.processed++;
            console.log('Action synced successfully:', action.id);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (action.retryCount < action.maxRetries) {
            await this.updateActionStatus(action.id, 'pending', true);
            console.log(`Action retry ${action.retryCount + 1}/${action.maxRetries}:`, action.id);
          } else {
            await this.updateActionStatus(action.id, 'failed');
            result.failed++;
            result.errors.push({ action, error: errorMessage });
            console.error('Action failed permanently:', action.id, errorMessage);
          }
        }
      }
    } catch (error) {
      result.success = false;
      console.error('Sync failed:', error);
    }

    return result;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    actions: { pending: number; completed: number; failed: number };
    cache: { entries: number; size: number };
    storage: { used: number; quota: number };
  }> {
    await this.ensureInitialized();

    const stats = {
      actions: { pending: 0, completed: 0, failed: 0 },
      cache: { entries: 0, size: 0 },
      storage: { used: 0, quota: 0 }
    };

    // Get action statistics
    const actions = await new Promise<OfflineAction[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    actions.forEach(action => {
      stats.actions[action.status]++;
    });

    // Get cache statistics
    const cacheEntries = await new Promise<CachedData[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    stats.cache.entries = cacheEntries.length;
    stats.cache.size = JSON.stringify(cacheEntries).length;

    // Get storage quota (if supported)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        stats.storage.used = estimate.usage || 0;
        stats.storage.quota = estimate.quota || 0;
      } catch (error) {
        console.warn('Failed to get storage estimate:', error);
      }
    }

    return stats;
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions', 'cache', 'settings'], 'readwrite');

      const clearPromises = [
        new Promise<void>((clearResolve, clearReject) => {
          const request = transaction.objectStore('actions').clear();
          request.onsuccess = () => clearResolve();
          request.onerror = () => clearReject(request.error);
        }),
        new Promise<void>((clearResolve, clearReject) => {
          const request = transaction.objectStore('cache').clear();
          request.onsuccess = () => clearResolve();
          request.onerror = () => clearReject(request.error);
        }),
        new Promise<void>((clearResolve, clearReject) => {
          const request = transaction.objectStore('settings').clear();
          request.onsuccess = () => clearResolve();
          request.onerror = () => clearReject(request.error);
        })
      ];

      Promise.all(clearPromises)
        .then(() => {
          console.log('All offline data cleared');
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();
export default offlineStorage;
export type { OfflineAction, CachedData, SyncResult };



