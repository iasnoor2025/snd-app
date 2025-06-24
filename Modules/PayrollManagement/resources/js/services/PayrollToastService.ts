import { ToastService } from '@/Core';

export class PayrollToastService extends ToastService {
  // Payroll CRUD operations
  static payrollCreated(period: string): string | number {
    return this.created(`Payroll for ${period}`);
  }

  static payrollUpdated(period: string): string | number {
    return this.updated(`Payroll for ${period}`);
  }

  static payrollDeleted(period: string): string | number {
    return this.deleted(`Payroll for ${period}`);
  }

  static payrollRestored(period: string): string | number {
    return this.restored(`Payroll for ${period}`);
  }

  // Salary operations
  static salaryCalculated(employeeName: string, period: string): string | number {
    return this.success(`Salary calculated for ${employeeName} (${period})`);
  }

  static salaryUpdated(employeeName: string, period: string): string | number {
    return this.success(`Salary updated for ${employeeName} (${period})`);
  }

  static salaryProcessed(employeeName: string, period: string): string | number {
    return this.success(`Salary processed for ${employeeName} (${period})`);
  }

  // Deduction operations
  static deductionAdded(employeeName: string, amount: number, reason: string): string | number {
    return this.success(`Deduction of SAR ${amount.toFixed(2)} added for ${employeeName} (${reason})`);
  }

  static deductionUpdated(employeeName: string, amount: number, reason: string): string | number {
    return this.success(`Deduction updated to SAR ${amount.toFixed(2)} for ${employeeName} (${reason})`);
  }

  static deductionRemoved(employeeName: string, reason: string): string | number {
    return this.success(`Deduction removed for ${employeeName} (${reason})`);
  }

  // Allowance operations
  static allowanceAdded(employeeName: string, amount: number, type: string): string | number {
    return this.success(`${type} allowance of SAR ${amount.toFixed(2)} added for ${employeeName}`);
  }

  static allowanceUpdated(employeeName: string, amount: number, type: string): string | number {
    return this.success(`${type} allowance updated to SAR ${amount.toFixed(2)} for ${employeeName}`);
  }

  static allowanceRemoved(employeeName: string, type: string): string | number {
    return this.success(`${type} allowance removed for ${employeeName}`);
  }

  // Bonus operations
  static bonusAdded(employeeName: string, amount: number, reason: string): string | number {
    return this.success(`Bonus of SAR ${amount.toFixed(2)} added for ${employeeName} (${reason})`);
  }

  static bonusUpdated(employeeName: string, amount: number, reason: string): string | number {
    return this.success(`Bonus updated to SAR ${amount.toFixed(2)} for ${employeeName} (${reason})`);
  }

  static bonusRemoved(employeeName: string, reason: string): string | number {
    return this.success(`Bonus removed for ${employeeName} (${reason})`);
  }

  // Tax operations
  static taxCalculated(employeeName: string, amount: number): string | number {
    return this.success(`Tax calculated: SAR ${amount.toFixed(2)} for ${employeeName}`);
  }

  static taxUpdated(employeeName: string, amount: number): string | number {
    return this.success(`Tax updated to SAR ${amount.toFixed(2)} for ${employeeName}`);
  }

  static taxExemption(employeeName: string, reason: string): string | number {
    return this.success(`Tax exemption applied for ${employeeName} (${reason})`);
  }

  // Payslip operations
  static payslipGenerated(employeeName: string, period: string): string | number {
    return this.success(`Payslip generated for ${employeeName} (${period})`);
  }

  static payslipSent(employeeName: string, period: string): string | number {
    return this.success(`Payslip sent to ${employeeName} (${period})`);
  }

  static payslipFailed(employeeName: string, period: string, error?: string): string | number {
    return this.error(`Failed to generate payslip for ${employeeName} (${period})${error ? `: ${error}` : ''}`);
  }

  // Bank transfer operations
  static transferInitiated(employeeName: string, amount: number): string | number {
    return this.loading(`Initiating transfer of SAR ${amount.toFixed(2)} to ${employeeName}...`);
  }

  static transferCompleted(employeeName: string, amount: number): string | number {
    return this.success(`Successfully transferred SAR ${amount.toFixed(2)} to ${employeeName}`);
  }

  static transferFailed(employeeName: string, amount: number, error?: string): string | number {
    return this.error(`Failed to transfer SAR ${amount.toFixed(2)} to ${employeeName}${error ? `: ${error}` : ''}`);
  }

  // Report operations
  static reportGenerated(type: string, period: string): string | number {
    return this.success(`${type} report generated for ${period}`);
  }

  static reportFailed(type: string, period: string, error?: string): string | number {
    return this.error(`Failed to generate ${type} report for ${period}${error ? `: ${error}` : ''}`);
  }

  // Validation errors
  static payrollValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingPayroll(action: string): string | number {
    return this.processing(`payroll ${action}`);
  }

  static payrollProcessed(action: string): string | number {
    return this.processed(`payroll ${action}`);
  }

  static payrollProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} payroll`, error);
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