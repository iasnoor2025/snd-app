export interface Setting {
  id: number;
  group: string;
  key: string;
  value: any;
  type: 'string' | 'boolean' | 'integer' | 'float' | 'array' | 'json';
  options?: any[];
  display_name?: string;
  description?: string;
  is_system: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SettingFormData {
  key: string;
  value: any;
  group?: string;
  type?: 'string' | 'boolean' | 'integer' | 'float' | 'array' | 'json';
  options?: any[];
  display_name?: string;
  description?: string;
  is_system?: boolean;
  order?: number;
}

