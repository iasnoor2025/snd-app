import { ToastService } from '@/Core';

export class RentalToastService extends ToastService {
    // Rental CRUD operations
    static rentalCreated(rentalNumber: string): string | number {
        return this.created(`Rental #${rentalNumber}`);
    }

    static rentalUpdated(rentalNumber: string): string | number {
        return this.updated(`Rental #${rentalNumber}`);
    }

    static rentalDeleted(rentalNumber: string): string | number {
        return this.deleted(`Rental #${rentalNumber}`);
    }

    static rentalRestored(rentalNumber: string): string | number {
        return this.restored(`Rental #${rentalNumber}`);
    }

    // Equipment operations
    static equipmentAssigned(equipmentName: string, rentalNumber: string): string | number {
        return this.success(`${equipmentName} assigned to rental #${rentalNumber}`);
    }

    static equipmentUnassigned(equipmentName: string, rentalNumber: string): string | number {
        return this.success(`${equipmentName} unassigned from rental #${rentalNumber}`);
    }

    static equipmentUnavailable(equipmentName: string, dates: string): string | number {
        return this.error(`${equipmentName} is not available for ${dates}`);
    }

    static bookingConflict(equipmentName: string, dates: string): string | number {
        return this.error(`Booking conflict for ${equipmentName} on ${dates}`);
    }

    // Operator operations
    static operatorAssigned(operatorName: string, rentalNumber: string): string | number {
        return this.success(`${operatorName} assigned to rental #${rentalNumber}`);
    }

    static operatorUnassigned(operatorName: string, rentalNumber: string): string | number {
        return this.success(`${operatorName} unassigned from rental #${rentalNumber}`);
    }

    static operatorUnavailable(operatorName: string, dates: string): string | number {
        return this.error(`${operatorName} is not available for ${dates}`);
    }

    // Document operations
    static documentUploaded(rentalNumber: string, documentType: string): string | number {
        return this.success(`${documentType} uploaded for rental #${rentalNumber}`);
    }

    static documentUploadFailed(documentType: string, error?: string): string | number {
        return this.operationFailed(`upload ${documentType}`, error);
    }

    // Status operations
    static statusUpdated(rentalNumber: string, status: string): string | number {
        return this.success(`Rental #${rentalNumber} status updated to ${status}`);
    }

    static statusUpdateFailed(rentalNumber: string, error?: string): string | number {
        return this.operationFailed(`update status for rental #${rentalNumber}`, error);
    }

    // Payment operations
    static paymentReceived(rentalNumber: string, amount: number): string | number {
        return this.success(`Payment of SAR ${amount.toFixed(2)} received for rental #${rentalNumber}`);
    }

    static paymentFailed(rentalNumber: string, error?: string): string | number {
        return this.operationFailed(`process payment for rental #${rentalNumber}`, error);
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

    // Extension operations
    static rentalExtended(rentalNumber: string, newEndDate: string): string | number {
        return this.success(`Rental #${rentalNumber} extended to ${newEndDate}`);
    }

    static extensionFailed(rentalNumber: string, error?: string): string | number {
        return this.operationFailed(`extend rental #${rentalNumber}`, error);
    }

    // Return operations
    static rentalReturned(rentalNumber: string): string | number {
        return this.success(`Rental #${rentalNumber} marked as returned`);
    }

    static returnFailed(rentalNumber: string, error?: string): string | number {
        return this.operationFailed(`process return for rental #${rentalNumber}`, error);
    }

    // Inspection operations
    static inspectionCompleted(equipmentName: string, status: 'passed' | 'failed'): string | number {
        return status === 'passed' ? this.success(`${equipmentName} passed inspection`) : this.warning(`${equipmentName} failed inspection`);
    }

    static damageReported(equipmentName: string, rentalNumber: string): string | number {
        return this.warning(`Damage reported for ${equipmentName} from rental #${rentalNumber}`);
    }

    // Maintenance operations
    static maintenanceScheduled(equipmentName: string, date: string): string | number {
        return this.info(`Maintenance scheduled for ${equipmentName} on ${date}`);
    }

    static maintenanceCompleted(equipmentName: string): string | number {
        return this.success(`Maintenance completed for ${equipmentName}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
