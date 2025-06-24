import { ToastService } from '@/Core';

export class EquipmentToastService extends ToastService {
  // Equipment CRUD operations
  static equipmentCreated(equipmentName: string): string | number {
    return this.created(`Equipment ${equipmentName}`);
  }

  static equipmentUpdated(equipmentName: string): string | number {
    return this.updated(`Equipment ${equipmentName}`);
  }

  static equipmentDeleted(equipmentName: string): string | number {
    return this.deleted(`Equipment ${equipmentName}`);
  }

  static equipmentRestored(equipmentName: string): string | number {
    return this.restored(`Equipment ${equipmentName}`);
  }

  // Status operations
  static statusUpdated(equipmentName: string, status: string): string | number {
    return this.success(`${equipmentName} status updated to ${status}`);
  }

  static statusUpdateFailed(equipmentName: string, error?: string): string | number {
    return this.operationFailed(`update status for ${equipmentName}`, error);
  }

  // Maintenance operations
  static maintenanceScheduled(equipmentName: string, date: string): string | number {
    return this.info(`Maintenance scheduled for ${equipmentName} on ${date}`);
  }

  static maintenanceStarted(equipmentName: string): string | number {
    return this.info(`Maintenance started for ${equipmentName}`);
  }

  static maintenanceCompleted(equipmentName: string): string | number {
    return this.success(`Maintenance completed for ${equipmentName}`);
  }

  static maintenanceFailed(equipmentName: string, error?: string): string | number {
    return this.operationFailed(`complete maintenance for ${equipmentName}`, error);
  }

  // Inspection operations
  static inspectionStarted(equipmentName: string): string | number {
    return this.info(`Inspection started for ${equipmentName}`);
  }

  static inspectionCompleted(equipmentName: string, status: 'passed' | 'failed'): string | number {
    return status === 'passed'
      ? this.success(`${equipmentName} passed inspection`)
      : this.warning(`${equipmentName} failed inspection`);
  }

  static inspectionFailed(equipmentName: string, error?: string): string | number {
    return this.operationFailed(`complete inspection for ${equipmentName}`, error);
  }

  // Document operations
  static documentUploaded(equipmentName: string, documentType: string): string | number {
    return this.success(`${documentType} uploaded for ${equipmentName}`);
  }

  static documentUploadFailed(documentType: string, error?: string): string | number {
    return this.operationFailed(`upload ${documentType}`, error);
  }

  // Rate operations
  static rateUpdated(equipmentName: string, rateType: string): string | number {
    return this.success(`${rateType} rate updated for ${equipmentName}`);
  }

  static rateUpdateFailed(equipmentName: string, rateType: string, error?: string): string | number {
    return this.operationFailed(`update ${rateType} rate for ${equipmentName}`, error);
  }

  // Category operations
  static categoryUpdated(equipmentName: string, category: string): string | number {
    return this.success(`${equipmentName} moved to category ${category}`);
  }

  static categoryUpdateFailed(equipmentName: string, error?: string): string | number {
    return this.operationFailed(`update category for ${equipmentName}`, error);
  }

  // Validation errors
  static equipmentValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingEquipment(action: string): string | number {
    return this.processing(`equipment ${action}`);
  }

  static equipmentProcessed(action: string): string | number {
    return this.processed(`equipment ${action}`);
  }

  static equipmentProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} equipment`, error);
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

  // Availability operations
  static equipmentAvailable(equipmentName: string): string | number {
    return this.success(`${equipmentName} is now available`);
  }

  static equipmentUnavailable(equipmentName: string, reason: string): string | number {
    return this.warning(`${equipmentName} is unavailable: ${reason}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
}