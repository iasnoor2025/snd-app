import { useTranslation } from 'react-i18next';
// Geofencing Types and Interfaces

export interface GeofenceZone {
  id: number;
  name: string;
  description?: string;
  type: 'circular' | 'polygon';
  latitude?: number;
  longitude?: number;
  radius?: number;
  polygon_coordinates?: Array<{ lat: number; lng: number }>;
  project_id?: number;
  site_id?: number;
  is_active: boolean;
  enforce_entry: boolean;
  enforce_exit: boolean;
  allow_overtime: boolean;
  time_restrictions?: {
    start_time?: string;
    end_time?: string;
    days_of_week?: number[];
  };
  monitoring_enabled: boolean;
  alert_on_violation: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
  };
  site?: {
    id: number;
    name: string;
  };
}

export interface GeofenceFormData {
  name: string;
  description?: string;
  type: 'circular' | 'polygon';
  latitude?: number;
  longitude?: number;
  radius?: number;
  polygon_coordinates?: Array<{ lat: number; lng: number }>;
  project_id?: number;
  site_id?: number;
  is_active: boolean;
  enforce_entry: boolean;
  enforce_exit: boolean;
  allow_overtime: boolean;
  time_restrictions?: {
    start_time?: string;
    end_time?: string;
    days_of_week?: number[];
  };
  monitoring_enabled: boolean;
  alert_on_violation: boolean;
  metadata?: Record<string, any>;
}

export interface GeofenceViolation {
  id: number;
  timesheet_id: number;
  employee_id: number;
  project_id?: number;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  distance_from_zone?: number;
  zone_name?: string;
  violation_time: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  employee: {
    id: number;
    name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
  };
  timesheet: {
    id: number;
    date: string;
    hours_worked: number;
  };
}

export interface GeofenceStats {
  total_zones: number;
  active_zones: number;
  total_violations: number;
  compliance_rate: number;
  zone_types: {
    circular: number;
    polygon: number;
  };
  violation_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  daily_compliance: Array<{
    date: string;
    compliance_rate: number;
    total_entries: number;
    violations: number;
  }>;
  top_violating_employees: Array<{
    employee_id: number;
    employee_name: string;
    violation_count: number;
  }>;
  zone_performance: Array<{
    zone_id: number;
    zone_name: string;
    total_entries: number;
    violations: number;
    compliance_rate: number;
  }>;
}

export interface GeofenceStatus {
  is_within_geofence: boolean;
  nearest_zone?: {
    id: number;
    name: string;
    distance: number;
  };
  violations?: string[];
  compliance_status: 'compliant' | 'violation' | 'warning';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeofenceValidationResult {
  compliant: boolean;
  violations: string[];
  distance_from_nearest_zone?: number;
  nearest_zone?: {
    id: number;
    name: string;
    type: string;
  };
  warning_messages?: string[];
}

export interface MobileTimesheetEntry {
  id?: number;
  employee_id: number;
  project_id: number;
  date: string;
  start_time: string;
  end_time?: string;
  hours_worked: number;
  overtime_hours?: number;
  description?: string;
  location?: LocationData;
  is_offline_entry: boolean;
  sync_status: 'pending' | 'synced' | 'failed' | 'synced_with_violations';
  geofence_status?: GeofenceStatus;
  device_info?: {
    device_id: string;
    platform: string;
    app_version: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GeofenceWorkAreaCoverage {
  project_id: number;
  project_name: string;
  total_work_area: number; // in square meters
  covered_area: number; // in square meters
  coverage_percentage: number;
  zones: Array<{
    id: number;
    name: string;
    area: number;
    type: string;
  }>;
  gaps: Array<{
    description: string;
    estimated_area: number;
    coordinates?: Array<{ lat: number; lng: number }>;
  }>;
}

export interface GeofenceFilterOptions {
  project_id?: number;
  site_id?: number;
  zone_type?: 'circular' | 'polygon';
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  employee_id?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
  search?: string;
}

export interface GeofenceExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  include_violations: boolean;
  include_statistics: boolean;
  date_range: {
    start: string;
    end: string;
  };
  filters?: GeofenceFilterOptions;
}
