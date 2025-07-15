import { ToastService } from '@/Core';

export class LeaveToastService extends ToastService {
    // Leave request CRUD operations
    static leaveRequestCreated(employeeName: string, type: string): string | number {
        return this.created(`${type} leave request for ${employeeName}`);
    }

    static leaveRequestUpdated(employeeName: string, type: string): string | number {
        return this.updated(`${type} leave request for ${employeeName}`);
    }

    static leaveRequestDeleted(employeeName: string, type: string): string | number {
        return this.deleted(`${type} leave request for ${employeeName}`);
    }

    static leaveRequestRestored(employeeName: string, type: string): string | number {
        return this.restored(`${type} leave request for ${employeeName}`);
    }

    // Approval operations
    static leaveApproved(employeeName: string, type: string): string | number {
        return this.success(`${type} leave approved for ${employeeName}`);
    }

    static leaveRejected(employeeName: string, type: string, reason: string): string | number {
        return this.error(`${type} leave rejected for ${employeeName}: ${reason}`);
    }

    static leaveCancelled(employeeName: string, type: string): string | number {
        return this.success(`${type} leave cancelled for ${employeeName}`);
    }

    static leaveRevisionRequested(employeeName: string, type: string, reason: string): string | number {
        return this.warning(`Revision requested for ${type} leave (${employeeName}): ${reason}`);
    }

    // Balance operations
    static balanceUpdated(employeeName: string, type: string, days: number): string | number {
        return this.success(`${employeeName}'s ${type} leave balance updated to ${days} days`);
    }

    static balanceLow(employeeName: string, type: string, days: number): string | number {
        return this.warning(`${employeeName} has only ${days} days of ${type} leave remaining`);
    }

    static balanceExhausted(employeeName: string, type: string): string | number {
        return this.error(`${employeeName} has exhausted ${type} leave balance`);
    }

    // Document operations
    static documentUploaded(documentName: string, requestId: string): string | number {
        return this.success(`${documentName} uploaded for leave request #${requestId}`);
    }

    static documentDeleted(documentName: string, requestId: string): string | number {
        return this.success(`${documentName} deleted from leave request #${requestId}`);
    }

    static documentRequired(type: string): string | number {
        return this.warning(`Supporting document required for ${type} leave`);
    }

    // Calendar operations
    static leaveScheduled(employeeName: string, dates: string): string | number {
        return this.success(`Leave scheduled for ${employeeName} on ${dates}`);
    }

    static leaveRescheduled(employeeName: string, dates: string): string | number {
        return this.success(`Leave rescheduled for ${employeeName} to ${dates}`);
    }

    static leaveOverlap(employeeName: string, dates: string): string | number {
        return this.error(`Leave dates overlap for ${employeeName} on ${dates}`);
    }

    // Notification operations
    static managerNotified(managerName: string, requestId: string): string | number {
        return this.success(`${managerName} notified about leave request #${requestId}`);
    }

    static reminderSent(employeeName: string, requestId: string): string | number {
        return this.success(`Reminder sent to ${employeeName} for request #${requestId}`);
    }

    static approvalPending(count: number): string | number {
        return this.warning(`${count} leave requests pending approval`);
    }

    // Validation operations
    static dateValidationError(message: string): string | number {
        return this.error(`Date validation error: ${message}`);
    }

    static holidayConflict(date: string): string | number {
        return this.warning(`Holiday conflict detected on ${date}`);
    }

    static weekendConflict(date: string): string | number {
        return this.warning(`Weekend conflict detected on ${date}`);
    }

    // Export operations
    static exportStarted(period: string): string | number {
        return this.loading(`Exporting leave records for ${period}...`);
    }

    static exportCompleted(period: string): string | number {
        return this.success(`Leave records exported for ${period}`);
    }

    static exportFailed(period: string, error?: string): string | number {
        return this.error(`Failed to export leave records for ${period}${error ? `: ${error}` : ''}`);
    }

    // Validation errors
    static leaveValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingLeave(action: string): string | number {
        return this.processing(`leave request ${action}`);
    }

    static leaveProcessed(action: string): string | number {
        return this.processed(`leave request ${action}`);
    }

    static leaveProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} leave request`, error);
    }

    // Bulk operations
    static bulkOperationStarted(operation: string, count: number): string | number {
        return this.loading(`Processing ${operation} for ${count} leave requests...`);
    }

    static bulkOperationCompleted(operation: string, count: number): string | number {
        return this.success(`Successfully ${operation} ${count} leave requests`);
    }

    static bulkOperationFailed(operation: string, error?: string): string | number {
        return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
