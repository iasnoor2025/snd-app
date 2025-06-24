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

  static documentExpiring(employeeName: string, documentType: string, daysLeft: number): string | number {
    return this.warning(`${documentType} for ${employeeName} expires in ${daysLeft} days`);
  }

  static documentExpired(employeeName: string, documentType: string): string | number {
    return this.error(`${documentType} for ${employeeName} has expired`);
  }

  // Training operations
  static trainingAssigned(employeeName: string, trainingName: string): string | number {
    return this.success(`${trainingName} training assigned to ${employeeName}`);
  }

  static trainingCompleted(employeeName: string, trainingName: string): string | number {
    return this.success(`${employeeName} completed ${trainingName} training`);
  }

  // Benefits operations
  static benefitsEnrolled(employeeName: string, benefitName: string): string | number {
    return this.success(`${employeeName} enrolled in ${benefitName}`);
  }

  static benefitsUpdated(employeeName: string, benefitName: string): string | number {
    return this.success(`${employeeName}'s ${benefitName} benefits updated`);
  }

  // Department operations
  static departmentChanged(employeeName: string, departmentName: string): string | number {
    return this.success(`${employeeName} transferred to ${departmentName} department`);
  }

  // Salary operations
  static salaryUpdated(employeeName: string): string | number {
    return this.success(`Salary updated for ${employeeName}`);
  }

  static advanceRequested(employeeName: string, amount: number): string | number {
    return this.success(`Salary advance of SAR ${amount.toFixed(2)} approved for ${employeeName}`);
  }

  static advanceRepaid(employeeName: string, amount: number): string | number {
    return this.success(`Repayment of SAR ${amount.toFixed(2)} recorded for ${employeeName}`);
  }

  static advanceApproved(employeeName: string, amount: number): string | number {
    return this.success(`Advance of SAR ${amount.toFixed(2)} approved for ${employeeName}`);
  }

  static advanceRejected(employeeName: string): string | number {
    return this.info(`Advance request rejected for ${employeeName}`);
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

  // Contract operations
  static contractSigned(employeeName: string): string | number {
    return this.success(`Contract signed for ${employeeName}`);
  }

  static contractExpiring(employeeName: string, daysLeft: number): string | number {
    return this.warning(`Contract for ${employeeName} expires in ${daysLeft} days`);
  }

  static salaryProcessed(employeeName: string): string | number {
    return this.success(`Salary processed for ${employeeName}`);
  }

  // Leave operations
  static leaveRequested(employeeName: string): string | number {
    return this.success(`Leave request submitted for ${employeeName}`);
  }

  static leaveApproved(employeeName: string): string | number {
    return this.success(`Leave approved for ${employeeName}`);
  }

  static leaveRejected(employeeName: string, reason?: string): string | number {
    const message = reason ? `Leave rejected for ${employeeName}: ${reason}` : `Leave rejected for ${employeeName}`;
    return this.error(message);
  }

  // Attendance operations
  static attendanceMarked(employeeName: string, type: 'check-in' | 'check-out'): string | number {
    return this.success(`${type === 'check-in' ? 'Check-in' : 'Check-out'} marked for ${employeeName}`);
  }

  static attendanceError(employeeName: string, type: 'check-in' | 'check-out'): string | number {
    return this.error(`Failed to mark ${type} for ${employeeName}`);
  }

  // Performance operations
  static performanceReviewSubmitted(employeeName: string): string | number {
    return this.success(`Performance review submitted for ${employeeName}`);
  }

  static performanceReviewUpdated(employeeName: string): string | number {
    return this.success(`Performance review updated for ${employeeName}`);
  }

  // Role operations
  static roleChanged(employeeName: string, roleName: string): string | number {
    return this.success(`${employeeName}'s role updated to ${roleName}`);
  }

  // Settlement operations
  static settlementRequested(employeeName: string): string | number {
    return this.success(`Final settlement requested for ${employeeName}`);
  }

  static settlementApproved(employeeName: string): string | number {
    return this.success(`Final settlement approved for ${employeeName}`);
  }

  static settlementRejected(employeeName: string): string | number {
    return this.info(`Final settlement rejected for ${employeeName}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
}