import { ToastService } from '@/Core';

export class NotificationsToastService extends ToastService {
  // Notification CRUD operations
  static notificationCreated(title: string): string | number {
    return this.created(`Notification "${title}"`);
  }

  static notificationUpdated(title: string): string | number {
    return this.updated(`Notification "${title}"`);
  }

  static notificationDeleted(title: string): string | number {
    return this.deleted(`Notification "${title}"`);
  }

  static notificationRestored(title: string): string | number {
    return this.restored(`Notification "${title}"`);
  }

  // Delivery operations
  static notificationSent(type: string, recipients: number): string | number {
    return this.success(`${type} notification sent to ${recipients} recipient(s)`);
  }

  static notificationScheduled(type: string, datetime: string): string | number {
    return this.success(`${type} notification scheduled for ${datetime}`);
  }

  static notificationCancelled(type: string): string | number {
    return this.success(`${type} notification cancelled`);
  }

  static deliveryFailed(type: string, error?: string): string | number {
    return this.error(`Failed to deliver ${type} notification${error ? `: ${error}` : ''}`);
  }

  // Template operations
  static templateCreated(name: string): string | number {
    return this.success(`Template "${name}" created successfully`);
  }

  static templateUpdated(name: string): string | number {
    return this.success(`Template "${name}" updated successfully`);
  }

  static templateDeleted(name: string): string | number {
    return this.success(`Template "${name}" deleted successfully`);
  }

  static templateDuplicated(name: string): string | number {
    return this.success(`Template "${name}" duplicated successfully`);
  }

  // Channel operations
  static channelEnabled(name: string): string | number {
    return this.success(`${name} channel enabled successfully`);
  }

  static channelDisabled(name: string): string | number {
    return this.warning(`${name} channel disabled`);
  }

  static channelConfigured(name: string): string | number {
    return this.success(`${name} channel configured successfully`);
  }

  static channelError(name: string, error?: string): string | number {
    return this.error(`${name} channel error${error ? `: ${error}` : ''}`);
  }

  // Subscription operations
  static subscriptionUpdated(type: string): string | number {
    return this.success(`Subscription preferences for ${type} updated`);
  }

  static subscriptionEnabled(type: string): string | number {
    return this.success(`Subscribed to ${type} notifications`);
  }

  static subscriptionDisabled(type: string): string | number {
    return this.warning(`Unsubscribed from ${type} notifications`);
  }

  // Group operations
  static groupCreated(name: string): string | number {
    return this.success(`Notification group "${name}" created`);
  }

  static groupUpdated(name: string): string | number {
    return this.success(`Notification group "${name}" updated`);
  }

  static groupDeleted(name: string): string | number {
    return this.success(`Notification group "${name}" deleted`);
  }

  static recipientAdded(name: string, group: string): string | number {
    return this.success(`${name} added to ${group} group`);
  }

  static recipientRemoved(name: string, group: string): string | number {
    return this.success(`${name} removed from ${group} group`);
  }

  // Queue operations
  static queueCleared(): string | number {
    return this.success('Notification queue cleared successfully');
  }

  static queuePaused(): string | number {
    return this.warning('Notification queue paused');
  }

  static queueResumed(): string | number {
    return this.success('Notification queue resumed');
  }

  static queueError(error?: string): string | number {
    return this.error(`Notification queue error${error ? `: ${error}` : ''}`);
  }

  // Test operations
  static testNotificationSent(channel: string): string | number {
    return this.success(`Test notification sent via ${channel}`);
  }

  static testNotificationFailed(channel: string, error?: string): string | number {
    return this.error(`Test notification failed for ${channel}${error ? `: ${error}` : ''}`);
  }

  // Status operations
  static statusChanged(notification: string, status: string): string | number {
    return this.success(`Notification "${notification}" marked as ${status}`);
  }

  static allMarkedAsRead(): string | number {
    return this.success('All notifications marked as read');
  }

  static allArchived(): string | number {
    return this.success('All notifications archived');
  }

  // Validation errors
  static notificationValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingNotification(action: string): string | number {
    return this.processing(`notification ${action}`);
  }

  static notificationProcessed(action: string): string | number {
    return this.processed(`notification ${action}`);
  }

  static notificationProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} notification`, error);
  }

  // Bulk operations
  static bulkOperationStarted(operation: string, count: number): string | number {
    return this.loading(`Processing ${operation} for ${count} notifications...`);
  }

  static bulkOperationCompleted(operation: string, count: number): string | number {
    return this.success(`Successfully ${operation} ${count} notifications`);
  }

  static bulkOperationFailed(operation: string, error?: string): string | number {
    return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
} 