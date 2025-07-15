import { ToastService } from '@/Core';

export class EmployeeToastService extends ToastService {
    // Employee CRUD operations
    static employeeCreated(employeeName: string): string | number {
        return this.created(`Employee ${employeeName}`);
    }

    static employeeUpdated(employeeName: string): string | number {
        return this.updated(`Employee ${employeeName}`);
    }

    static employeeDeleted(employeeName: string): string | number {
        return this.deleted(`Employee ${employeeName}`);
    }

    static employeeRestored(employeeName: string): string | number {
        return this.restored(`Employee ${employeeName}`);
    }

    // Document operations
    static documentUploaded(employeeName: string, documentType: string): string | number {
        return this.success(`${documentType} uploaded for ${employeeName}`);
    }

    static documentUploadFailed(documentType: string, error?: string): string | number {
        return this.operationFailed(`upload ${documentType}`, error);
    }

    // Status operations
    static statusUpdated(employeeName: string, status: string): string | number {
        return this.success(`Employee ${employeeName} status updated to ${status}`);
    }

    static statusUpdateFailed(employeeName: string, error?: string): string | number {
        return this.operationFailed(`update status for employee ${employeeName}`, error);
    }

    // Validation errors
    static employeeValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingEmployee(action: string): string | number {
        return this.processing(`employee ${action}`);
    }

    static employeeProcessed(action: string): string | number {
        return this.processed(`employee ${action}`);
    }

    static employeeProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} employee`, error);
    }

    // Bulk operations
    static bulkOperationStarted(operation: string, count: number): string | number {
        return this.loading(`Processing ${operation} for ${count} employees...`);
    }

    static bulkOperationCompleted(operation: string, count: number): string | number {
        return this.success(`Successfully ${operation} ${count} employees`);
    }

    static bulkOperationFailed(operation: string, error?: string): string | number {
        return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
