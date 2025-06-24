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

  // Assignment operations
  static equipmentAssigned(equipmentName: string, assignedTo: string): string | number {
    return this.success(`${equipmentName} assigned to ${assignedTo}`);
  }

  static equipmentUnassigned(equipmentName: string): string | number {
    return this.success(`${equipmentName} unassigned`);
  }

  // Maintenance operations
  static maintenanceScheduled(equipmentName: string, date: string): string | number {
    return this.info(`Maintenance scheduled for ${equipmentName} on ${date}`);
  }

  static maintenanceCompleted(equipmentName: string): string | number {
    return this.success(`Maintenance completed for ${equipmentName}`);
  }

  static maintenanceOverdue(equipmentName: string): string | number {
    return this.warning(`Maintenance overdue for ${equipmentName}`);
  }

  // Inspection operations
  static inspectionCompleted(equipmentName: string, status: 'passed' | 'failed'): string | number {
    return status === 'passed'
      ? this.success(`${equipmentName} passed inspection`)
      : this.warning(`${equipmentName} failed inspection`);
  }

  static inspectionOverdue(equipmentName: string): string | number {
    return this.warning(`Inspection overdue for ${equipmentName}`);
  }

  // Status operations
  static statusChanged(equipmentName: string, status: string): string | number {
    return this.info(`${equipmentName} status changed to ${status}`);
  }

  // Calibration operations
  static calibrationRequired(equipmentName: string): string | number {
    return this.warning(`${equipmentName} requires calibration`);
  }

  static calibrationCompleted(equipmentName: string): string | number {
    return this.success(`${equipmentName} calibration completed`);
  }

  // Document operations
  static documentUploaded(equipmentName: string, documentType: string): string | number {
    return this.success(`${documentType} uploaded for ${equipmentName}`);
  }

  static documentExpiring(equipmentName: string, documentType: string, daysLeft: number): string | number {
    return this.warning(`${documentType} for ${equipmentName} expires in ${daysLeft} days`);
  }

  static documentExpired(equipmentName: string, documentType: string): string | number {
    return this.error(`${documentType} for ${equipmentName} has expired`);
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
}