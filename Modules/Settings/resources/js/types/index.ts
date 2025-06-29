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

export interface Webhook {
  id: number;
  event: string;
  url: string;
  secret?: string | null;
  is_active: boolean;
  last_triggered_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface SsoSetting {
  id: number;
  provider: string;
  client_id: string;
  client_secret: string;
  discovery_url: string;
  redirect_uri: string;
  scopes: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaymentGatewaySetting {
  id: number;
  provider: string;
  credentials: Record<string, any>;
  endpoints: Record<string, any>;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

