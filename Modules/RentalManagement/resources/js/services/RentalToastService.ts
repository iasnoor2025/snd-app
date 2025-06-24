import { ToastService } from '@/Core';

export class RentalToastService extends ToastService {
  // Rental CRUD operations
  static rentalCreated(rentalId: string): string | number {
    return this.created(`Rental #${rentalId}`);
  }

  static rentalUpdated(rentalId: string): string | number {
    return this.updated(`Rental #${rentalId}`);
  }

  static rentalDeleted(rentalId: string): string | number {
    return this.deleted(`Rental #${rentalId}`);
  }

  static rentalRestored(rentalId: string): string | number {
    return this.restored(`Rental #${rentalId}`);
  }

  // Equipment operations
  static equipmentAssigned(equipmentName: string, rentalId: string): string | number {
    return this.success(`${equipmentName} assigned to rental #${rentalId}`);
  }

  static equipmentUnassigned(equipmentName: string, rentalId: string): string | number {
    return this.success(`${equipmentName} unassigned from rental #${rentalId}`);
  }

  static equipmentUnavailable(equipmentName: string, dates: string): string | number {
    return this.error(`${equipmentName} is not available for ${dates}`);
  }

  static bookingConflict(equipmentName: string, dates: string): string | number {
    return this.error(`Booking conflict for ${equipmentName} on ${dates}`);
  }

  // Inspection operations
  static inspectionCompleted(equipmentName: string, status: 'passed' | 'failed'): string | number {
    return status === 'passed'
      ? this.success(`${equipmentName} passed inspection`)
      : this.warning(`${equipmentName} failed inspection`);
  }

  static damageReported(equipmentName: string, rentalId: string): string | number {
    return this.warning(`Damage reported for ${equipmentName} from rental #${rentalId}`);
  }

  // Maintenance operations
  static maintenanceScheduled(equipmentName: string, date: string): string | number {
    return this.info(`Maintenance scheduled for ${equipmentName} on ${date}`);
  }

  static maintenanceCompleted(equipmentName: string): string | number {
    return this.success(`Maintenance completed for ${equipmentName}`);
  }

  // Customer operations
  static customerAssigned(customerName: string, rentalId: string): string | number {
    return this.success(`${customerName} assigned to rental #${rentalId}`);
  }

  // Payment operations
  static paymentReceived(rentalId: string, amount: number): string | number {
    return this.success(`Payment of SAR ${amount.toFixed(2)} received for rental #${rentalId}`);
  }

  static paymentFailed(rentalId: string, error?: string): string | number {
    return this.operationFailed(`process payment for rental #${rentalId}`, error);
  }

  // Validation errors
  static rentalValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingRental(action: string): string | number {
    return this.processing(`rental ${action}`);
  }

  static rentalProcessed(action: string): string | number {
    return this.processed(`rental ${action}`);
  }

  static rentalProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} rental`, error);
  }
} 