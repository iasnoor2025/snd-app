import { ToastService } from '@/Core';

export class CustomerToastService extends ToastService {
    // Customer CRUD operations
    static customerCreated(customerName: string): string | number {
        return this.created(`Customer ${customerName}`);
    }

    static customerUpdated(customerName: string): string | number {
        return this.updated(`Customer ${customerName}`);
    }

    static customerDeleted(customerName: string): string | number {
        return this.deleted(`Customer ${customerName}`);
    }

    static customerRestored(customerName: string): string | number {
        return this.restored(`Customer ${customerName}`);
    }

    // Contact operations
    static contactAdded(contactName: string, customerName: string): string | number {
        return this.success(`Contact ${contactName} added to ${customerName}`);
    }

    static contactUpdated(contactName: string, customerName: string): string | number {
        return this.success(`Contact ${contactName} updated for ${customerName}`);
    }

    static contactDeleted(contactName: string, customerName: string): string | number {
        return this.success(`Contact ${contactName} removed from ${customerName}`);
    }

    static primaryContactChanged(contactName: string, customerName: string): string | number {
        return this.success(`${contactName} set as primary contact for ${customerName}`);
    }

    // Document operations
    static documentUploaded(documentName: string, customerName: string): string | number {
        return this.success(`${documentName} uploaded for ${customerName}`);
    }

    static documentDeleted(documentName: string, customerName: string): string | number {
        return this.success(`${documentName} deleted for ${customerName}`);
    }

    static documentExpiring(documentName: string, customerName: string, daysLeft: number): string | number {
        return this.warning(`${documentName} for ${customerName} expires in ${daysLeft} days`);
    }

    static documentExpired(documentName: string, customerName: string): string | number {
        return this.error(`${documentName} for ${customerName} has expired`);
    }

    // Address operations
    static addressAdded(type: string, customerName: string): string | number {
        return this.success(`${type} address added for ${customerName}`);
    }

    static addressUpdated(type: string, customerName: string): string | number {
        return this.success(`${type} address updated for ${customerName}`);
    }

    static addressDeleted(type: string, customerName: string): string | number {
        return this.success(`${type} address deleted for ${customerName}`);
    }

    static primaryAddressChanged(type: string, customerName: string): string | number {
        return this.success(`${type} address set as primary for ${customerName}`);
    }

    // Credit operations
    static creditLimitUpdated(customerName: string, limit: number): string | number {
        return this.success(`Credit limit updated to SAR ${limit.toFixed(2)} for ${customerName}`);
    }

    static creditHold(customerName: string, reason: string): string | number {
        return this.warning(`Credit hold placed on ${customerName}: ${reason}`);
    }

    static creditReleased(customerName: string): string | number {
        return this.success(`Credit hold released for ${customerName}`);
    }

    // Payment operations
    static paymentReceived(customerName: string, amount: number): string | number {
        return this.success(`Payment of SAR ${amount.toFixed(2)} received from ${customerName}`);
    }

    static paymentFailed(customerName: string, amount: number, error?: string): string | number {
        return this.error(`Payment of SAR ${amount.toFixed(2)} failed for ${customerName}${error ? `: ${error}` : ''}`);
    }

    static paymentOverdue(customerName: string, amount: number, days: number): string | number {
        return this.warning(`Payment of SAR ${amount.toFixed(2)} overdue by ${days} days for ${customerName}`);
    }

    // Communication operations
    static emailSent(customerName: string, subject: string): string | number {
        return this.success(`Email "${subject}" sent to ${customerName}`);
    }

    static emailFailed(customerName: string, subject: string, error?: string): string | number {
        return this.error(`Failed to send email "${subject}" to ${customerName}${error ? `: ${error}` : ''}`);
    }

    static smsSent(customerName: string): string | number {
        return this.success(`SMS sent to ${customerName}`);
    }

    static smsFailed(customerName: string, error?: string): string | number {
        return this.error(`Failed to send SMS to ${customerName}${error ? `: ${error}` : ''}`);
    }

    // Category operations
    static categoryAssigned(customerName: string, category: string): string | number {
        return this.success(`${customerName} assigned to ${category} category`);
    }

    static categoryUpdated(customerName: string, category: string): string | number {
        return this.success(`${customerName} moved to ${category} category`);
    }

    static categoryRemoved(customerName: string, category: string): string | number {
        return this.success(`${customerName} removed from ${category} category`);
    }

    // Validation errors
    static customerValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingCustomer(action: string): string | number {
        return this.processing(`customer ${action}`);
    }

    static customerProcessed(action: string): string | number {
        return this.processed(`customer ${action}`);
    }

    static customerProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} customer`, error);
    }

    // Bulk operations
    static bulkOperationStarted(operation: string, count: number): string | number {
        return this.loading(`Processing ${operation} for ${count} customers...`);
    }

    static bulkOperationCompleted(operation: string, count: number): string | number {
        return this.success(`Successfully ${operation} ${count} customers`);
    }

    static bulkOperationFailed(operation: string, error?: string): string | number {
        return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
