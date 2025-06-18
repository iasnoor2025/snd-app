import { useTranslation } from 'react-i18next';
import axios, { AxiosResponse } from 'axios';
import {
  GeofenceZone,
  GeofenceFormData,
  GeofenceViolation,
  GeofenceStats,
  GeofenceValidationResult,
  GeofenceWorkAreaCoverage,
  GeofenceFilterOptions,
  GeofenceExportOptions,
  LocationData
} from '../types/geofencing';

// Base API configuration
const API_BASE = '/api/geofences';
const MOBILE_API_BASE = '/api/mobile/timesheets';

// API Response wrapper
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Geofence Zone Management
export const geofenceZoneApi = {
  // Get all geofence zones
  getAll: async (filters?: GeofenceFilterOptions): Promise<GeofenceZone[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ApiResponse<GeofenceZone[]>> = await axios.get(
      `${API_BASE}?${params.toString()}`
    );
    return response.data.data;
  },

  // Get single geofence zone
  getById: async (id: number): Promise<GeofenceZone> => {
    const response: AxiosResponse<ApiResponse<GeofenceZone>> = await axios.get(
      `${API_BASE}/${id}`
    );
    return response.data.data;
  },

  // Create new geofence zone
  create: async (data: GeofenceFormData): Promise<GeofenceZone> => {
    const response: AxiosResponse<ApiResponse<GeofenceZone>> = await axios.post(
      API_BASE,
      data
    );
    return response.data.data;
  },

  // Update geofence zone
  update: async (id: number, data: Partial<GeofenceFormData>): Promise<GeofenceZone> => {
    const response: AxiosResponse<ApiResponse<GeofenceZone>> = await axios.put(
      `${API_BASE}/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete geofence zone
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/${id}`);
  },

  // Toggle zone active status
  toggleActive: async (id: number): Promise<GeofenceZone> => {
    const response: AxiosResponse<ApiResponse<GeofenceZone>> = await axios.post(
      `${API_BASE}/${id}/toggle-active`
    );
    return response.data.data;
  },

  // Get nearby zones for mobile
  getNearby: async (latitude: number, longitude: number, radius?: number): Promise<GeofenceZone[]> => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      ...(radius && { radius: String(radius) })
    });

    const response: AxiosResponse<ApiResponse<GeofenceZone[]>> = await axios.get(
      `${MOBILE_API_BASE}/geofences/nearby?${params.toString()}`
    );
    return response.data.data;
  }
};

// Location Validation
export const geofenceValidationApi = {
  // Validate location against geofences
  validateLocation: async (
    latitude: number,
    longitude: number,
    employeeId?: number,
    projectId?: number
  ): Promise<GeofenceValidationResult> => {
    const response: AxiosResponse<ApiResponse<GeofenceValidationResult>> = await axios.post(
      `${API_BASE}/validate-location`,
      {
        latitude,
        longitude,
        employee_id: employeeId,
        project_id: projectId
      }
    );
    return response.data.data;
  },

  // Mobile location validation
  validateMobileLocation: async (locationData: LocationData, employeeId: number, projectId?: number): Promise<GeofenceValidationResult> => {
    const response: AxiosResponse<ApiResponse<GeofenceValidationResult>> = await axios.post(
      `${MOBILE_API_BASE}/location/validate`,
      {
        ...locationData,
        employee_id: employeeId,
        project_id: projectId
      }
    );
    return response.data.data;
  }
};

// Violation Management
export const geofenceViolationApi = {
  // Get violations with filters
  getViolations: async (filters?: GeofenceFilterOptions): Promise<GeofenceViolation[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ApiResponse<GeofenceViolation[]>> = await axios.get(
      `${API_BASE}/violations?${params.toString()}`
    );
    return response.data.data;
  },

  // Get violation statistics
  getViolationStats: async (filters?: GeofenceFilterOptions): Promise<any> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ApiResponse<any>> = await axios.get(
      `${API_BASE}/violation-stats?${params.toString()}`
    );
    return response.data.data;
  },

  // Update violation status
  updateStatus: async (violationId: number, status: string, notes?: string): Promise<void> => {
    await axios.patch(`${API_BASE}/violations/${violationId}/status`, {
      status,
      notes
    });
  },

  // Add notes to violation
  addNotes: async (violationId: number, notes: string): Promise<void> => {
    await axios.post(`${API_BASE}/violations/${violationId}/notes`, {
      notes
    });
  },

  // Send notification for violation
  sendNotification: async (violationId: number, recipients: string[], message?: string): Promise<void> => {
    await axios.post(`${API_BASE}/violations/${violationId}/notify`, {
      recipients,
      message
    });
  },

  // Export violations
  exportViolations: async (options: GeofenceExportOptions): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response: AxiosResponse<Blob> = await axios.get(
      `${API_BASE}/violations/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};

// Statistics and Analytics
export const geofenceStatsApi = {
  // Get comprehensive statistics
  getStatistics: async (filters?: GeofenceFilterOptions): Promise<GeofenceStats> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ApiResponse<GeofenceStats>> = await axios.get(
      `${API_BASE}/statistics?${params.toString()}`
    );
    return response.data.data;
  },

  // Get work area coverage
  getWorkAreaCoverage: async (projectId?: number): Promise<GeofenceWorkAreaCoverage[]> => {
    const params = new URLSearchParams();
    if (projectId) {
      params.append('project_id', String(projectId));
    }

    const response: AxiosResponse<ApiResponse<GeofenceWorkAreaCoverage[]>> = await axios.get(
      `${API_BASE}/work-area-coverage?${params.toString()}`
    );
    return response.data.data;
  },

  // Export statistics
  exportStatistics: async (options: GeofenceExportOptions): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response: AxiosResponse<Blob> = await axios.get(
      `${API_BASE}/statistics/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Export work area coverage
  exportWorkAreaCoverage: async (options: GeofenceExportOptions): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response: AxiosResponse<Blob> = await axios.get(
      `${API_BASE}/work-area-coverage/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Combined API object for easier imports
export const geofencingApi = {
  zones: geofenceZoneApi,
  validation: geofenceValidationApi,
  violations: geofenceViolationApi,
  stats: geofenceStatsApi,
  handleError: handleApiError
};

export default geofencingApi;
