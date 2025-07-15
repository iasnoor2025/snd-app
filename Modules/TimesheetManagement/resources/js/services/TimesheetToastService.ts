import { ToastService } from '@/Core';

export class TimesheetToastService extends ToastService {
    // Timesheet CRUD operations
    static timesheetCreated(employeeName: string, period: string): string | number {
        return this.created(`Timesheet for ${employeeName} (${period})`);
    }

    static timesheetUpdated(employeeName: string, period: string): string | number {
        return this.updated(`Timesheet for ${employeeName} (${period})`);
    }

    static timesheetDeleted(employeeName: string, period: string): string | number {
        return this.deleted(`Timesheet for ${employeeName} (${period})`);
    }

    static timesheetRestored(employeeName: string, period: string): string | number {
        return this.restored(`Timesheet for ${employeeName} (${period})`);
    }

    // Entry operations
    static entryAdded(date: string, hours: number): string | number {
        return this.success(`Added ${hours} hours for ${date}`);
    }

    static entryUpdated(date: string, hours: number): string | number {
        return this.success(`Updated to ${hours} hours for ${date}`);
    }

    static entryDeleted(date: string): string | number {
        return this.success(`Entry deleted for ${date}`);
    }

    // Approval operations
    static timesheetSubmitted(period: string): string | number {
        return this.success(`Timesheet submitted for ${period}`);
    }

    static timesheetApproved(employeeName: string, period: string): string | number {
        return this.success(`Timesheet approved for ${employeeName} (${period})`);
    }

    static timesheetRejected(employeeName: string, period: string, reason: string): string | number {
        return this.error(`Timesheet rejected for ${employeeName} (${period}): ${reason}`);
    }

    static timesheetRevisionRequested(period: string, reason: string): string | number {
        return this.warning(`Revision requested for ${period}: ${reason}`);
    }

    // Overtime operations
    static overtimeRequested(hours: number, date: string): string | number {
        return this.success(`Overtime request for ${hours} hours on ${date}`);
    }

    static overtimeApproved(hours: number, date: string): string | number {
        return this.success(`Overtime approved for ${hours} hours on ${date}`);
    }

    static overtimeRejected(hours: number, date: string, reason: string): string | number {
        return this.error(`Overtime rejected for ${hours} hours on ${date}: ${reason}`);
    }

    // Project allocation operations
    static projectAllocated(projectName: string, hours: number): string | number {
        return this.success(`${hours} hours allocated to ${projectName}`);
    }

    static projectAllocationUpdated(projectName: string, hours: number): string | number {
        return this.success(`Allocation updated to ${hours} hours for ${projectName}`);
    }

    static projectAllocationRemoved(projectName: string): string | number {
        return this.success(`Project ${projectName} removed from timesheet`);
    }

    // Validation operations
    static hoursExceeded(date: string): string | number {
        return this.error(`Total hours exceed daily limit for ${date}`);
    }

    static overlappingEntries(date: string): string | number {
        return this.error(`Overlapping entries detected for ${date}`);
    }

    static futureDateError(): string | number {
        return this.error('Cannot add entries for future dates');
    }

    // Reminder operations
    static submissionReminder(daysLeft: number): string | number {
        return this.warning(`${daysLeft} days left to submit timesheet`);
    }

    static approvalReminder(count: number): string | number {
        return this.warning(`${count} timesheets pending approval`);
    }

    // Export operations
    static exportStarted(period: string): string | number {
        return this.loading(`Exporting timesheet for ${period}...`);
    }

    static exportCompleted(period: string): string | number {
        return this.success(`Timesheet exported for ${period}`);
    }

    static exportFailed(period: string, error?: string): string | number {
        return this.error(`Failed to export timesheet for ${period}${error ? `: ${error}` : ''}`);
    }

    // Validation errors
    static timesheetValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingTimesheet(action: string): string | number {
        return this.processing(`timesheet ${action}`);
    }

    static timesheetProcessed(action: string): string | number {
        return this.processed(`timesheet ${action}`);
    }

    static timesheetProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} timesheet`, error);
    }

    // Bulk operations
    static bulkOperationStarted(operation: string, count: number): string | number {
        return this.loading(`Processing ${operation} for ${count} timesheets...`);
    }

    static bulkOperationCompleted(operation: string, count: number): string | number {
        return this.success(`Successfully ${operation} ${count} timesheets`);
    }

    static bulkOperationFailed(operation: string, error?: string): string | number {
        return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
