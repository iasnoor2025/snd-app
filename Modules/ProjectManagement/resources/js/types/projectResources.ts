import { useTranslation } from 'react-i18next';
export interface ProjectResource {
  id: number;
  project_id: number;
  type: ResourceType;
  name: string;
  description?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  status: ResourceStatus;
  allocated_date?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentResource extends ProjectResource {
  type: 'equipment';
  equipment_type: string;
  model?: string;
  serial_number?: string;
  rental_rate?: number;
  maintenance_cost?: number;
}

export interface ManpowerResource extends ProjectResource {
  type: 'manpower';
  role: string;
  hourly_rate: number;
  hours_allocated: number;
  skill_level: 'junior' | 'intermediate' | 'senior' | 'expert';
  employee_id?: number;
}

export interface MaterialResource extends ProjectResource {
  type: 'material';
  material_type: string;
  supplier?: string;
  unit_of_measure: string;
  minimum_quantity?: number;
  reorder_level?: number;
}

export interface FuelResource extends ProjectResource {
  type: 'fuel';
  fuel_type: string;
  consumption_rate?: number;
  storage_location?: string;
  supplier?: string;
}

export interface ExpenseResource extends ProjectResource {
  type: 'expense';
  expense_category: string;
  vendor?: string;
  receipt_number?: string;
  payment_method?: string;
}

export type ResourceType = 'equipment' | 'manpower' | 'material' | 'fuel' | 'expense';

export type ResourceStatus = 'planned' | 'allocated' | 'in_use' | 'completed' | 'cancelled';

export interface ProjectTask {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: number;
  start_date?: string;
  due_date?: string;
  completion_date?: string;
  progress: number;
  dependencies?: number[];
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ResourceFilter {
  type?: ResourceType;
  status?: ResourceStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface ResourcePagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ResourceResponse {
  data: ProjectResource[];
  pagination: ResourcePagination;
}

