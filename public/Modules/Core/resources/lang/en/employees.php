<?php

return array (
  // Success messages
  'employee_created_success' => 'Employee created successfully',
  'employee_updated_success' => 'Employee updated successfully',
  'designation_created_success' => 'Designation created successfully',
  'designation_updated_success' => 'Designation updated successfully',
  'designation_deleted_success' => 'Designation deleted successfully',
  'designation_added_success' => 'Designation added successfully',
  'settlement_calculated_success' => 'Final settlement calculated successfully',
  'settlement_document_generated_success' => 'Settlement document generated successfully',
  'repayment_recorded_success' => 'Repayment recorded successfully',

  // Error messages
  'error_creating_employee' => 'An error occurred while creating the employee',
  'error_updating_employee' => 'Failed to update employee',
  'error_updating_employee_network' => 'Failed to update employee: Network error',
  'error_loading_employees' => 'Failed to load employees',
  'error_loading_documents' => 'Failed to fetch documents',
  'error_calculating_settlement' => 'Failed to calculate settlement. Please try again.',
  'error_generating_settlement' => 'Failed to generate settlement document',
  'error_fetching_designations' => 'Failed to fetch designations. Please try again.',
  'error_session_expired' => 'Your session has expired. Please log in again.',
  'error_unexpected' => 'An unexpected error occurred. Please try again.',
  'error_designation_name_required' => 'Designation name is required',
  'error_designation_name_unique' => 'Designation name must be unique.',
  'error_designation_not_found' => 'Selected designation not found. Please try again.',
  'error_update_designation_list' => 'Failed to update designation list after add.',
  'error_invalid_repayment' => 'Invalid repayment data',
  'error_no_active_advances' => 'No active advances available for repayment',
  'error_no_permission_advances' => 'You do not have permission to view advances',

  // Validation messages
  'select_employee_and_date' => 'Please select an employee and specify the last working date',
  'calculate_settlement_first' => 'Please calculate the settlement first',
  'employee_number_retrieval_error' => 'Could not retrieve last employee number. Using default value.',
  'employee_number_fetch_error' => 'Failed to fetch employee number. Using default value.',
);
