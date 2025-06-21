/**
 * Toast Replacement Guide
 * 
 * This file demonstrates how to replace all TODO toast comments
 * throughout the codebase with proper toast notifications using Sonner.
 * 
 * Usage: Replace all instances of "// TODO: Replace with toast('message')"
 * with the appropriate toast calls shown below.
 */

import { toast } from 'sonner';

// ========================================
// COMMON PATTERNS FOR REPLACEMENT
// ========================================

// 1. SUCCESS OPERATIONS
// OLD: // TODO: Replace with toast('message')
// NEW: toast.success('Operation completed successfully');

// 2. ERROR HANDLING
// OLD: // TODO: Replace with toast('message')
// NEW: toast.error('Operation failed. Please try again.');

// 3. VALIDATION ERRORS
// OLD: // TODO: Replace with toast('message')
// NEW: toast.error('Please check your input and try again');

// 4. NETWORK ERRORS
// OLD: // TODO: Replace with toast('message')
// NEW: toast.error('Network error. Please check your connection.');

// ========================================
// SPECIFIC REPLACEMENTS BY CONTEXT
// ========================================

export const toastReplacements = {
  // Document operations
  documentDeleted: () => toast.success('Document deleted successfully'),
  documentDeleteFailed: () => toast.error('Failed to delete document'),
  documentUploaded: () => toast.success('Document uploaded successfully'),
  documentUploadFailed: () => toast.error('Failed to upload document'),

  // Employee operations
  employeeDeleted: () => toast.success('Employee deleted successfully'),
  employeeDeleteFailed: () => toast.error('Failed to delete employee'),
  employeeUpdated: () => toast.success('Employee updated successfully'),
  employeeUpdateFailed: () => toast.error('Failed to update employee'),

  // Advance operations
  advanceCreated: () => toast.success('Advance request created successfully'),
  advanceCreateFailed: () => toast.error('Failed to create advance request'),
  advanceApproved: () => toast.success('Advance approved successfully'),
  advanceApproveFailed: () => toast.error('Failed to approve advance'),
  advanceRejected: () => toast.success('Advance rejected successfully'),
  advanceRejectFailed: () => toast.error('Failed to reject advance'),

  // Settlement operations
  settlementApproved: () => toast.success('Settlement approved successfully'),
  settlementApproveFailed: () => toast.error('Failed to approve settlement'),
  settlementRejected: () => toast.success('Settlement rejected successfully'),
  settlementRejectFailed: () => toast.error('Failed to reject settlement'),

  // Validation errors
  invalidAmount: () => toast.error('Please enter a valid amount'),
  invalidDeduction: () => toast.error('Please enter a valid monthly deduction'),
  missingReason: () => toast.error('Please provide a reason'),
  invalidInput: () => toast.error('Please check your input and try again'),

  // General operations
  saveSuccess: () => toast.success('Changes saved successfully'),
  saveFailed: () => toast.error('Failed to save changes'),
  loadFailed: () => toast.error('Failed to load data'),
  networkError: () => toast.error('Network error. Please check your connection.'),
  permissionDenied: () => toast.error('You do not have permission to perform this action'),
  sessionExpired: () => toast.error('Your session has expired. Please log in again.'),
};

// ========================================
// REPLACEMENT INSTRUCTIONS
// ========================================

/*
STEP 1: Find all TODO comments
Use this regex to find all TODO toast comments:
// TODO: Replace with toast\('message'\)

STEP 2: Replace with appropriate toast calls
Based on the context, replace with one of these patterns:

SUCCESS OPERATIONS:
.then(() => {
  toast.success('Operation completed successfully');
})

ERROR HANDLING:
.catch((error) => {
  toast.error('Operation failed. Please try again.');
})

VALIDATION:
if (!isValid) {
  toast.error('Please check your input');
  return;
}

STEP 3: Import toast at the top of each file:
import { toast } from 'sonner';

STEP 4: Test each replacement to ensure it works correctly

FILES TO UPDATE:
- Modules/EmployeeManagement/resources/js/pages/Employees/Show.tsx (30+ instances)
- Other files with TODO toast comments (search codebase)

EXAMPLE BEFORE/AFTER:

BEFORE:
axios.delete(`/api/employee/${employeeId}/documents/${doc.id}`)
  .then(() => {
    // TODO: Replace with toast('message')
  })
  .catch((error) => {
    // TODO: Replace with toast('message')
  });

AFTER:
axios.delete(`/api/employee/${employeeId}/documents/${doc.id}`)
  .then(() => {
    toast.success('Document deleted successfully');
  })
  .catch((error) => {
    toast.error('Failed to delete document');
  });
*/

export default toastReplacements; 
