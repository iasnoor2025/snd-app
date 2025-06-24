import { ToastService } from '@/Core';

export class AnalyticsToastService extends ToastService {
  // Dashboard CRUD operations
  static dashboardCreated(name: string): string | number {
    return this.created(`Dashboard "${name}"`);
  }

  static dashboardUpdated(name: string): string | number {
    return this.updated(`Dashboard "${name}"`);
  }

  static dashboardDeleted(name: string): string | number {
    return this.deleted(`Dashboard "${name}"`);
  }

  static dashboardRestored(name: string): string | number {
    return this.restored(`Dashboard "${name}"`);
  }

  // Widget operations
  static widgetAdded(name: string, dashboard: string): string | number {
    return this.success(`Widget "${name}" added to dashboard "${dashboard}"`);
  }

  static widgetUpdated(name: string, dashboard: string): string | number {
    return this.success(`Widget "${name}" updated in dashboard "${dashboard}"`);
  }

  static widgetRemoved(name: string, dashboard: string): string | number {
    return this.success(`Widget "${name}" removed from dashboard "${dashboard}"`);
  }

  static widgetError(name: string, error?: string): string | number {
    return this.error(`Widget "${name}" error${error ? `: ${error}` : ''}`);
  }

  // Data operations
  static dataRefreshed(widget: string): string | number {
    return this.success(`Data refreshed for widget "${widget}"`);
  }

  static dataLoading(widget: string): string | number {
    return this.loading(`Loading data for widget "${widget}"...`);
  }

  static dataError(widget: string, error?: string): string | number {
    return this.error(`Data error for widget "${widget}"${error ? `: ${error}` : ''}`);
  }

  // Metric operations
  static metricCreated(name: string): string | number {
    return this.success(`Metric "${name}" created successfully`);
  }

  static metricUpdated(name: string): string | number {
    return this.success(`Metric "${name}" updated successfully`);
  }

  static metricDeleted(name: string): string | number {
    return this.success(`Metric "${name}" deleted successfully`);
  }

  static metricThresholdReached(name: string, value: string): string | number {
    return this.warning(`Metric "${name}" reached threshold: ${value}`);
  }

  // Chart operations
  static chartCreated(name: string): string | number {
    return this.success(`Chart "${name}" created successfully`);
  }

  static chartUpdated(name: string): string | number {
    return this.success(`Chart "${name}" updated successfully`);
  }

  static chartDeleted(name: string): string | number {
    return this.success(`Chart "${name}" deleted successfully`);
  }

  static chartError(name: string, error?: string): string | number {
    return this.error(`Chart "${name}" error${error ? `: ${error}` : ''}`);
  }

  // Filter operations
  static filterApplied(name: string, dashboard: string): string | number {
    return this.success(`Filter "${name}" applied to dashboard "${dashboard}"`);
  }

  static filterRemoved(name: string, dashboard: string): string | number {
    return this.success(`Filter "${name}" removed from dashboard "${dashboard}"`);
  }

  static filterError(name: string, error?: string): string | number {
    return this.error(`Filter "${name}" error${error ? `: ${error}` : ''}`);
  }

  // Export operations
  static exportStarted(type: string, format: string): string | number {
    return this.loading(`Exporting ${type} to ${format}...`);
  }

  static exportCompleted(type: string, format: string): string | number {
    return this.success(`${type} exported to ${format} successfully`);
  }

  static exportFailed(type: string, format: string, error?: string): string | number {
    return this.error(`Failed to export ${type} to ${format}${error ? `: ${error}` : ''}`);
  }

  // Alert operations
  static alertCreated(metric: string, condition: string): string | number {
    return this.success(`Alert created for metric "${metric}" when ${condition}`);
  }

  static alertTriggered(metric: string, value: string): string | number {
    return this.warning(`Alert triggered: ${metric} reached ${value}`);
  }

  static alertResolved(metric: string): string | number {
    return this.success(`Alert resolved for metric "${metric}"`);
  }

  // Integration operations
  static integrationConnected(name: string): string | number {
    return this.success(`Connected to ${name} successfully`);
  }

  static integrationDisconnected(name: string): string | number {
    return this.warning(`Disconnected from ${name}`);
  }

  static integrationError(name: string, error?: string): string | number {
    return this.error(`Integration error with ${name}${error ? `: ${error}` : ''}`);
  }

  // Scheduled operations
  static scheduleCreated(name: string, frequency: string): string | number {
    return this.success(`Schedule created for "${name}": ${frequency}`);
  }

  static scheduleUpdated(name: string, frequency: string): string | number {
    return this.success(`Schedule updated for "${name}": ${frequency}`);
  }

  static scheduleDeleted(name: string): string | number {
    return this.success(`Schedule deleted for "${name}"`);
  }

  // Validation errors
  static analyticsValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingAnalytics(action: string): string | number {
    return this.processing(`analytics ${action}`);
  }

  static analyticsProcessed(action: string): string | number {
    return this.processed(`analytics ${action}`);
  }

  static analyticsProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} analytics`, error);
  }

  // Bulk operations
  static bulkOperationStarted(operation: string, count: number): string | number {
    return this.loading(`Processing ${operation} for ${count} items...`);
  }

  static bulkOperationCompleted(operation: string, count: number): string | number {
    return this.success(`Successfully ${operation} ${count} items`);
  }

  static bulkOperationFailed(operation: string, error?: string): string | number {
    return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
} 