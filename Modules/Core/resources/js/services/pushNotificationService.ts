/**
 * Push Notification Service
 * Handles web push notifications for PWA functionality
 */

import { offlineStorage } from '../utils/offlineStorage';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationStats {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
}

class PushNotificationService {
  private vapidPublicKey: string = '';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkSupport();
    this.loadVapidKey();
  }

  /**
   * Check if push notifications are supported
   */
  private checkSupport(): void {
    this.isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
  }

  /**
   * Load VAPID public key from server
   */
  private async loadVapidKey(): Promise<void> {
    try {
      const response = await fetch('/api/push-notifications/vapid-key');
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.publicKey;
      }
    } catch (error) {
      console.warn('Failed to load VAPID key:', error);
    }
  }

  /**
   * Initialize push notification service
   */
  async initialize(serviceWorkerRegistration: ServiceWorkerRegistration): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    this.serviceWorkerRegistration = serviceWorkerRegistration;
    this.permission = Notification.permission;

    // Check for existing subscription
    try {
      this.subscription = await serviceWorkerRegistration.pushManager.getSubscription();
      if (this.subscription) {
        console.log('Existing push subscription found');
        await this.syncSubscriptionWithServer();
      }
    } catch (error) {
      console.error('Failed to get existing subscription:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported');
    }

    if (this.permission === 'granted') {
      return this.permission;
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('Notification permission:', this.permission);
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.serviceWorkerRegistration) {
      throw new Error('Push notifications are not supported or service worker not registered');
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    try {
      // Unsubscribe from existing subscription if any
      const existingSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // Create new subscription
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      console.log('Push subscription created:', this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');

        // Remove subscription from server
        if (this.subscription) {
          await this.removeSubscriptionFromServer(this.subscription);
        }
      }

      this.subscription = null;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  /**
   * Show local notification
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      throw new Error('Notifications are not permitted');
    }

    try {
      if (this.serviceWorkerRegistration) {
        // Show notification via service worker
        await this.serviceWorkerRegistration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/badge-72x72.png',
          image: payload.image,
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          requireInteraction: payload.requireInteraction || false,
          silent: payload.silent || false,
          timestamp: payload.timestamp || Date.now()
        });
      } else {
        // Fallback to regular notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false,
          silent: payload.silent || false
        });
      }

      console.log('Notification shown:', payload.title);
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': this.getCSRFToken()
        },
        body: JSON.stringify({
          subscription,
          user_agent: navigator.userAgent,
          platform: navigator.platform
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);

      // Queue for offline sync
      if (navigator.onLine === false) {
        await offlineStorage.queueAction(
          'push_subscribe',
          'POST',
          '/api/push/subscribe',
          {
            subscription,
            user_agent: navigator.userAgent,
            platform: navigator.platform
          },
          { priority: 'high' }
        );
      }

      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': this.getCSRFToken()
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);

      // Queue for offline sync
      if (navigator.onLine === false) {
        await offlineStorage.queueAction(
          'push_unsubscribe',
          'POST',
          '/api/push/unsubscribe',
          { subscription },
          { priority: 'medium' }
        );
      }

      throw error;
    }
  }

  /**
   * Sync subscription with server
   */
  private async syncSubscriptionWithServer(): Promise<void> {
    if (!this.subscription) return;

    try {
      const response = await fetch('/api/push/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': this.getCSRFToken()
        },
        body: JSON.stringify({ subscription: this.subscription })
      });

      if (response.ok) {
        console.log('Subscription synced with server');
      }
    } catch (error) {
      console.warn('Failed to sync subscription with server:', error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await fetch('/api/push/stats', {
        headers: {
          'X-CSRF-TOKEN': this.getCSRFToken()
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get notification stats:', error);
    }

    return {
      sent: 0,
      delivered: 0,
      clicked: 0,
      dismissed: 0,
      failed: 0
    };
  }

  /**
   * Test notification
   */
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: 'Test Notification',
      body: 'This is a test notification from SND Rental App',
      icon: '/icons/icon-192x192.png',
      tag: 'test',
      data: { type: 'test' },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(event: NotificationEvent): void {
    event.notification.close();

    const data = event.notification.data;
    const action = event.action;

    console.log('Notification clicked:', { action, data });

    // Handle different actions
    switch (action) {
      case 'view':
        if (data?.url) {
          event.waitUntil(
            self.clients.openWindow(data.url)
          );
        }
        break;
      case 'dismiss':
        // Just close the notification (already done above)
        break;
      default:
        // Default action (clicking notification body)
        if (data?.url) {
          event.waitUntil(
            self.clients.openWindow(data.url)
          );
        } else {
          event.waitUntil(
            self.clients.openWindow('/')
          );
        }
        break;
    }

    // Track notification interaction
    this.trackNotificationInteraction(event.notification.tag || 'unknown', action || 'click');
  }

  /**
   * Track notification interaction
   */
  private async trackNotificationInteraction(tag: string, action: string): Promise<void> {
    try {
      await fetch('/api/push/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': this.getCSRFToken()
        },
        body: JSON.stringify({
          tag,
          action,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to track notification interaction:', error);

      // Queue for offline sync
      if (navigator.onLine === false) {
        await offlineStorage.queueAction(
          'notification_track',
          'POST',
          '/api/push/track',
          {
            tag,
            action,
            timestamp: Date.now()
          },
          { priority: 'low' }
        );
      }
    }
  }

  /**
   * Utility: Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get CSRF token
   */
  private getCSRFToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token || '';
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Check if subscribed
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
export type { NotificationPayload, PushSubscription, NotificationAction, NotificationStats };



