import { ToastService } from '@/Core';

export class ReportingToastService extends ToastService {
  // Report CRUD operations
  static reportCreated(name: string): string | number {
    return this.created(`Report "${name}"`);
  }

  static reportUpdated(name: string): string | number {
    return this.updated(`Report "${name}"`);
  }

  static reportDeleted(name: string): string | number {
    return this.deleted(`Report "${name}"`);
  }

  static reportRestored(name: string): string | number {
    return this.restored(`Report "${name}"`);
  }

  // Generation operations
  static generationStarted(name: string): string | number {
    return this.loading(`Generating report "${name}"...`);
  }

  static generationCompleted(name: string): string | number {
    return this.success(`Report "${name}" generated successfully`);
  }

  static generationFailed(name: string, error?: string): string | number {
    return this.error(`Failed to generate report "${name}"${error ? `: ${error}` : ''}`);
  }

  // Schedule operations
  static scheduleCreated(name: string, frequency: string): string | number {
    return this.success(`Report "${name}" scheduled for ${frequency}`);
  }

  static scheduleUpdated(name: string, frequency: string): string | number {
    return this.success(`Schedule updated for report "${name}" to ${frequency}`);
  }

  static scheduleDeleted(name: string): string | number {
    return this.success(`Schedule removed for report "${name}"`);
  }

  static scheduleError(name: string, error?: string): string | number {
    return this.error(`Schedule error for report "${name}"${error ? `: ${error}` : ''}`);
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

  // Filter operations
  static filterCreated(name: string, report: string): string | number {
    return this.success(`Filter "${name}" created for report "${report}"`);
  }

  static filterUpdated(name: string, report: string): string | number {
    return this.success(`Filter "${name}" updated for report "${report}"`);
  }

  static filterDeleted(name: string, report: string): string | number {
    return this.success(`Filter "${name}" deleted from report "${report}"`);
  }

  static filterApplied(name: string, report: string): string | number {
    return this.success(`Filter "${name}" applied to report "${report}"`);
  }

  // Export operations
  static exportStarted(name: string, format: string): string | number {
    return this.loading(`Exporting report "${name}" to ${format}...`);
  }

  static exportCompleted(name: string, format: string): string | number {
    return this.success(`Report "${name}" exported to ${format} successfully`);
  }

  static exportFailed(name: string, format: string, error?: string): string | number {
    return this.error(`Failed to export report "${name}" to ${format}${error ? `: ${error}` : ''}`);
  }

  // Share operations
  static shareCreated(name: string, recipient: string): string | number {
    return this.success(`Report "${name}" shared with ${recipient}`);
  }

  static shareUpdated(name: string, recipient: string): string | number {
    return this.success(`Share settings updated for report "${name}" with ${recipient}`);
  }

  static shareDeleted(name: string, recipient: string): string | number {
    return this.success(`Share removed for report "${name}" with ${recipient}`);
  }

  static shareError(name: string, recipient: string, error?: string): string | number {
    return this.error(`Failed to share report "${name}" with ${recipient}${error ? `: ${error}` : ''}`);
  }

  // Dashboard operations
  static dashboardCreated(name: string): string | number {
    return this.success(`Dashboard "${name}" created successfully`);
  }

  static dashboardUpdated(name: string): string | number {
    return this.success(`Dashboard "${name}" updated successfully`);
  }

  static dashboardDeleted(name: string): string | number {
    return this.success(`Dashboard "${name}" deleted successfully`);
  }

  static reportAddedToDashboard(report: string, dashboard: string): string | number {
    return this.success(`Report "${report}" added to dashboard "${dashboard}"`);
  }

  static reportRemovedFromDashboard(report: string, dashboard: string): string | number {
    return this.success(`Report "${report}" removed from dashboard "${dashboard}"`);
  }

  // Data source operations
  static dataSourceConnected(name: string): string | number {
    return this.success(`Connected to data source "${name}"`);
  }

  static dataSourceDisconnected(name: string): string | number {
    return this.warning(`Disconnected from data source "${name}"`);
  }

  static dataSourceError(name: string, error?: string): string | number {
    return this.error(`Data source "${name}" error${error ? `: ${error}` : ''}`);
  }

  // Cache operations
  static cacheCleared(name: string): string | number {
    return this.success(`Cache cleared for report "${name}"`);
  }

  static cacheUpdated(name: string): string | number {
    return this.success(`Cache updated for report "${name}"`);
  }

  static cacheError(name: string, error?: string): string | number {
    return this.error(`Cache error for report "${name}"${error ? `: ${error}` : ''}`);
  }

  // Validation errors
  static reportValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingReport(action: string): string | number {
    return this.processing(`report ${action}`);
  }

  static reportProcessed(action: string): string | number {
    return this.processed(`report ${action}`);
  }

  static reportProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} report`, error);
  }

  // Bulk operations
  static bulkOperationStarted(operation: string, count: number): string | number {
    return this.loading(`Processing ${operation} for ${count} reports...`);
  }

  static bulkOperationCompleted(operation: string, count: number): string | number {
    return this.success(`Successfully ${operation} ${count} reports`);
  }

  static bulkOperationFailed(operation: string, error?: string): string | number {
    return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
} 