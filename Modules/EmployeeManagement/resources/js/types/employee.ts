import { useTranslation } from 'react-i18next';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';
export interface Employee {
  id: number;
  employee_id: string;
  file_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  nationality?: string;
  position_id?: number;
  department_id?: number;
  supervisor?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  current_location?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;

  // ID documents
  iqama_number?: string;
  iqama_expiry?: string;
  passport_number?: string;
  passport_expiry?: string;
  date_of_birth?: string;

  // Banking information
  bank_name?: string;
  bank_account_number?: string;
  bank_iban?: string;

  // Salary and compensation
  basic_salary?: number;
  food_allowance?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  hourly_rate?: number;
  absent_deduction_rate?: number;
  overtime_rate_multiplier?: number;
  overtime_fixed_rate?: number;
  contract_hours_per_day?: number;
  contract_days_per_month?: number;

  // Licenses and certifications
  driving_license_number?: string;
  driving_license_expiry?: string;
  operator_license_number?: string;
  operator_license_expiry?: string;
  tuv_certification_number?: string;
  tuv_certification_expiry?: string;
  spsp_license_number?: string;
  spsp_license_expiry?: string;

  // Relationships
  position?: Position;
  department?: Department;
  user_id?: number;
  user?: User;
  current_assignment?: Assignment;
  documents?: Document[];
  timesheets?: Timesheet[];
  leave_requests?: LeaveRequest[];

  // Virtual attributes
  full_name?: string;
  total_salary?: number;
  bank_details?: any;
  has_approved_resignation?: boolean;
}

export interface Position {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  parent_id?: number;
  code?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  id: number;
  employee_id: number;
  assignable_id: number;
  assignable_type: string;
  start_date: string;
  end_date?: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  type?: string;
}

export interface Timesheet {
  id: number;
  employee_id: number;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  start_time?: string;
  end_time?: string;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason?: string;
  approved_by?: number;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  collection_name: string;
  model_type: string;
  model_id: number;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceReview {
    id: number;
    review_date: string;
    reviewer: string;
    rating: number;
    status: 'pending' | 'completed';
    strengths: string[];
    areas_for_improvement: string[];
    goals: string[];
    notes?: string;
}

