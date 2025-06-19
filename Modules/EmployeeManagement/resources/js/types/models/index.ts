import { useTranslation } from 'react-i18next';
export interface Position {
  id: number;
  name: string;
  department_id?: number;
  department?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  file_number: string;
  employee_id?: string;
  position_id: number;
  position?: Position | string;
  department?: {
    id: number;
    name: string;
  } | string;
  hourly_rate?: number;
  basic_salary?: number;
  overtime_rate_multiplier?: number;
  overtime_fixed_rate?: number;
  contract_hours_per_day?: number;
  contract_days_per_month?: number;
  iqama_number?: string;
  iqama_expiry?: string;
  iqama_cost?: number;
  passport_number?: string;
  passport_expiry?: string;
  driving_license?: {
    number?: string;
    expiry_date?: string;
    cost?: number;
  };
  operator_license?: {
    number?: string;
    expiry_date?: string;
    cost?: number;
  };
  tuv_certification?: {
    number?: string;
    expiry_date?: string;
    cost?: number;
  };
  spsp_license?: {
    number?: string;
    expiry_date?: string;
    cost?: number;
  };
  status: string;
  hire_date?: string;
  termination_date?: string;
  food_allowance?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  advance_payment?: number;
  absent_deduction_rate?: number;
  current_assignment?: {
    id: number;
    type: string;
    name: string;
    location?: string;
    start_date?: string;
    end_date?: string;
  };
  current_location?: string;
  created_at?: string;
  updated_at?: string;
}

