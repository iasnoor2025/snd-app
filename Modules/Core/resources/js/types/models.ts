export interface Timesheet {
  id: number;
  hours_worked: number;
  overtime_hours: number;
  status: string;
  date: string;
  employee?: {
    first_name?: string;
    last_name?: string;
    monthly_regular_hours?: number;
    monthly_overtime_hours?: number;
    recent_timesheets?: Array<{
      date: string;
      hours_worked: number;
      overtime_hours: number;
      status: string;
    }>;
  };
  project?: {
    name?: string;
  };
  tasks_completed?: string;
  description?: string;
}

export interface Rental {
  id: number;
  customer_id: number;
  quotation_id?: number;
  rental_number: string;
  start_date: string;
  expected_end_date?: string;
  actual_end_date?: string;
  mobilization_date?: string;
  invoice_date?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'overdue';
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  deposit_amount: number;
  payment_terms_days: number;
  payment_due_date?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  tax_percentage: number;
  discount_percentage: number;
  has_timesheet: boolean;
  notes?: string;
  created_by?: number;
  completed_by?: number;
  completed_at?: string;
  approved_by?: number;
  approved_at?: string;
  location_id?: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  rental_items?: RentalItem[];
  payments?: Payment[];
  invoices?: Invoice[];
}

export interface RentalItem {
  id: number;
  rental_id: number;
  equipment_id: number;
  rate: number;
  rate_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  quantity: number;
  total_amount: number;
  operator_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
  operator?: Employee;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  model?: string;
  serial_number?: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  daily_rate?: number;
  hourly_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  rental_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  rental_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

export type PermissionString = string;

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    items?: Omit<NavItem, 'icon'>[];
    permission?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles?: string[];
    permissions?: string[];
}

export interface PageProps {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}



