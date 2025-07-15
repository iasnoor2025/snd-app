import { ToastService } from '@/Core';

export class AuditComplianceToastService extends ToastService {
    // Audit log operations
    static logCreated(type: string): string | number {
        return this.created(`${type} audit log`);
    }

    static logUpdated(type: string): string | number {
        return this.updated(`${type} audit log`);
    }

    static logDeleted(type: string): string | number {
        return this.deleted(`${type} audit log`);
    }

    static logRestored(type: string): string | number {
        return this.restored(`${type} audit log`);
    }

    // Compliance check operations
    static complianceCheckStarted(type: string): string | number {
        return this.loading(`Starting ${type} compliance check...`);
    }

    static complianceCheckCompleted(type: string, status: string): string | number {
        return this.success(`${type} compliance check completed: ${status}`);
    }

    static complianceCheckFailed(type: string, error?: string): string | number {
        return this.error(`${type} compliance check failed${error ? `: ${error}` : ''}`);
    }

    // Policy operations
    static policyCreated(name: string): string | number {
        return this.success(`Policy "${name}" created successfully`);
    }

    static policyUpdated(name: string): string | number {
        return this.success(`Policy "${name}" updated successfully`);
    }

    static policyDeleted(name: string): string | number {
        return this.success(`Policy "${name}" deleted successfully`);
    }

    static policyEnabled(name: string): string | number {
        return this.success(`Policy "${name}" enabled`);
    }

    static policyDisabled(name: string): string | number {
        return this.warning(`Policy "${name}" disabled`);
    }

    // Rule operations
    static ruleCreated(name: string, policy: string): string | number {
        return this.success(`Rule "${name}" created for ${policy} policy`);
    }

    static ruleUpdated(name: string, policy: string): string | number {
        return this.success(`Rule "${name}" updated for ${policy} policy`);
    }

    static ruleDeleted(name: string, policy: string): string | number {
        return this.success(`Rule "${name}" deleted from ${policy} policy`);
    }

    static ruleEnabled(name: string): string | number {
        return this.success(`Rule "${name}" enabled`);
    }

    static ruleDisabled(name: string): string | number {
        return this.warning(`Rule "${name}" disabled`);
    }

    // Violation operations
    static violationDetected(rule: string, severity: string): string | number {
        return this.error(`${severity} violation detected: ${rule}`);
    }

    static violationResolved(rule: string): string | number {
        return this.success(`Violation resolved: ${rule}`);
    }

    static violationEscalated(rule: string, level: string): string | number {
        return this.warning(`Violation escalated to ${level}: ${rule}`);
    }

    // Report operations
    static reportGenerated(type: string, period: string): string | number {
        return this.success(`${type} report generated for ${period}`);
    }

    static reportScheduled(type: string, schedule: string): string | number {
        return this.success(`${type} report scheduled for ${schedule}`);
    }

    static reportFailed(type: string, error?: string): string | number {
        return this.error(`Failed to generate ${type} report${error ? `: ${error}` : ''}`);
    }

    // Alert operations
    static alertCreated(type: string, severity: string): string | number {
        return this.warning(`${severity} ${type} alert created`);
    }

    static alertResolved(type: string): string | number {
        return this.success(`${type} alert resolved`);
    }

    static alertEscalated(type: string, level: string): string | number {
        return this.error(`${type} alert escalated to ${level}`);
    }

    // Review operations
    static reviewStarted(type: string): string | number {
        return this.loading(`Starting ${type} review...`);
    }

    static reviewCompleted(type: string): string | number {
        return this.success(`${type} review completed`);
    }

    static reviewFailed(type: string, error?: string): string | number {
        return this.error(`${type} review failed${error ? `: ${error}` : ''}`);
    }

    // Export operations
    static exportStarted(type: string): string | number {
        return this.loading(`Exporting ${type} data...`);
    }

    static exportCompleted(type: string): string | number {
        return this.success(`${type} data exported successfully`);
    }

    static exportFailed(type: string, error?: string): string | number {
        return this.error(`Failed to export ${type} data${error ? `: ${error}` : ''}`);
    }

    // Validation errors
    static auditValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingAudit(action: string): string | number {
        return this.processing(`audit ${action}`);
    }

    static auditProcessed(action: string): string | number {
        return this.processed(`audit ${action}`);
    }

    static auditProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} audit`, error);
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
