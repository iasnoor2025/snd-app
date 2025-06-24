import { ToastService } from '@/Core';

export class ProjectToastService extends ToastService {
  // Project CRUD operations
  static projectCreated(projectName: string): string | number {
    return this.created(`Project ${projectName}`);
  }

  static projectUpdated(projectName: string): string | number {
    return this.updated(`Project ${projectName}`);
  }

  static projectDeleted(projectName: string): string | number {
    return this.deleted(`Project ${projectName}`);
  }

  static projectRestored(projectName: string): string | number {
    return this.restored(`Project ${projectName}`);
  }

  // Status operations
  static statusUpdated(projectName: string, status: string): string | number {
    return this.success(`Project ${projectName} status updated to ${status}`);
  }

  static statusUpdateFailed(projectName: string, error?: string): string | number {
    return this.operationFailed(`update status for project ${projectName}`, error);
  }

  // Task operations
  static taskCreated(taskName: string, projectName: string): string | number {
    return this.success(`Task ${taskName} created in ${projectName}`);
  }

  static taskUpdated(taskName: string): string | number {
    return this.success(`Task ${taskName} updated`);
  }

  static taskDeleted(taskName: string): string | number {
    return this.success(`Task ${taskName} deleted`);
  }

  static taskAssigned(taskName: string, assigneeName: string): string | number {
    return this.success(`Task ${taskName} assigned to ${assigneeName}`);
  }

  static taskCompleted(taskName: string): string | number {
    return this.success(`Task ${taskName} marked as completed`);
  }

  // Milestone operations
  static milestoneCreated(milestoneName: string, projectName: string): string | number {
    return this.success(`Milestone ${milestoneName} created in ${projectName}`);
  }

  static milestoneUpdated(milestoneName: string): string | number {
    return this.success(`Milestone ${milestoneName} updated`);
  }

  static milestoneDeleted(milestoneName: string): string | number {
    return this.success(`Milestone ${milestoneName} deleted`);
  }

  static milestoneCompleted(milestoneName: string): string | number {
    return this.success(`Milestone ${milestoneName} completed`);
  }

  // Team operations
  static memberAdded(memberName: string, projectName: string): string | number {
    return this.success(`${memberName} added to ${projectName}`);
  }

  static memberRemoved(memberName: string, projectName: string): string | number {
    return this.success(`${memberName} removed from ${projectName}`);
  }

  static roleUpdated(memberName: string, role: string): string | number {
    return this.success(`${memberName}'s role updated to ${role}`);
  }

  // Document operations
  static documentUploaded(documentName: string, projectName: string): string | number {
    return this.success(`${documentName} uploaded to ${projectName}`);
  }

  static documentDeleted(documentName: string): string | number {
    return this.success(`${documentName} deleted`);
  }

  static documentShared(documentName: string, recipientName: string): string | number {
    return this.success(`${documentName} shared with ${recipientName}`);
  }

  // Budget operations
  static budgetUpdated(projectName: string): string | number {
    return this.success(`Budget updated for ${projectName}`);
  }

  static expenseAdded(amount: number, projectName: string): string | number {
    return this.success(`Expense of SAR ${amount.toFixed(2)} added to ${projectName}`);
  }

  static budgetExceeded(projectName: string): string | number {
    return this.warning(`Budget exceeded for ${projectName}`);
  }

  // Timeline operations
  static timelineUpdated(projectName: string): string | number {
    return this.success(`Timeline updated for ${projectName}`);
  }

  static deadlineApproaching(projectName: string, daysLeft: number): string | number {
    return this.warning(`${projectName} deadline in ${daysLeft} days`);
  }

  static deadlineMissed(projectName: string): string | number {
    return this.error(`${projectName} deadline missed`);
  }

  // Comment operations
  static commentAdded(projectName: string): string | number {
    return this.success(`Comment added to ${projectName}`);
  }

  static commentUpdated(projectName: string): string | number {
    return this.success(`Comment updated in ${projectName}`);
  }

  static commentDeleted(projectName: string): string | number {
    return this.success(`Comment deleted from ${projectName}`);
  }

  // Validation errors
  static projectValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingProject(action: string): string | number {
    return this.processing(`project ${action}`);
  }

  static projectProcessed(action: string): string | number {
    return this.processed(`project ${action}`);
  }

  static projectProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} project`, error);
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