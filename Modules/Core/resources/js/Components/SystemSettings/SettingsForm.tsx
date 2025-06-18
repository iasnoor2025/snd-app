import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, Clock, Globe, Shield, Zap } from 'lucide-react';

interface SettingValue {
  value: any;
  type: string;
  description: string;
  is_public: boolean;
  updated_at: string;
}

interface SettingsFormProps {
  category: string;
  settings: { [key: string]: SettingValue };
  fields: string[];
  onChange: (category: string, key: string, value: any) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  category,
  settings,
  fields,
  onChange
}) => {
  const getFieldLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldDescription = (key: string): string => {
    const setting = settings[key];
    return setting?.description || getFieldLabel(key);
  };

  const renderField = (key: string) => {
    const setting = settings[key];
    if (!setting) return null;

    const { value, type } = setting;
    const label = getFieldLabel(key);
    const description = getFieldDescription(key);

    const fieldId = `${category}-${key}`;

    switch (type) {
      case 'boolean':
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor={fieldId} className="text-sm font-medium">
                  {label}
                  {setting.is_public && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </Label>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <Switch
                id={fieldId}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange(category, key, checked)}
              />
            </div>
          </div>
        );

      case 'integer':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
              {setting.is_public && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </Label>
            <Input
              id={fieldId}
              type="number"
              value={value || ''}
              onChange={(e) => onChange(category, key, parseInt(e.target.value) || 0)}
              className="w-full"
              min={getMinValue(key)}
              max={getMaxValue(key)}
            />
            <p className="text-xs text-gray-500">{description}</p>
            {getFieldHint(key) && (
              <p className="text-xs text-blue-600 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {getFieldHint(key)}
              </p>
            )}
          </div>
        );

      case 'float':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
              {setting.is_public && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </Label>
            <Input
              id={fieldId}
              type="number"
              step="0.01"
              value={value || ''}
              onChange={(e) => onChange(category, key, parseFloat(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        );

      case 'string':
        // Special handling for select fields
        if (isSelectField(key)) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {label}
                {setting.is_public && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </Label>
              <Select
                value={value || ''}
                onValueChange={(newValue) => onChange(category, key, newValue)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {getSelectOptions(key).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          );
        }

        // Textarea for long text fields
        if (isTextareaField(key)) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {label}
                {setting.is_public && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </Label>
              <Textarea
                id={fieldId}
                value={value || ''}
                onChange={(e) => onChange(category, key, e.target.value)}
                className="w-full"
                rows={3}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          );
        }

        // Regular input field
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
              {setting.is_public && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </Label>
            <Input
              id={fieldId}
              type={getInputType(key)}
              value={value || ''}
              onChange={(e) => onChange(category, key, e.target.value)}
              className="w-full"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            <p className="text-xs text-gray-500">{description}</p>
            {getFieldHint(key) && (
              <p className="text-xs text-blue-600 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {getFieldHint(key)}
              </p>
            )}
          </div>
        );

      case 'array':
      case 'json':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
              {setting.is_public && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </Label>
            <Textarea
              id={fieldId}
              value={Array.isArray(value) ? JSON.stringify(value, null, 2) : value || ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(category, key, parsed);
                } catch {
                  // Keep the raw value if JSON is invalid
                  onChange(category, key, e.target.value);
                }
              }}
              className="w-full font-mono text-sm"
              rows={4}
              placeholder="Enter JSON data"
            />
            <p className="text-xs text-gray-500">{description}</p>
            <p className="text-xs text-yellow-600 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Enter valid JSON format
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const isSelectField = (key: string): boolean => {
    const selectFields = [
      'default_timezone',
      'default_language',
      'currency',
      'backup_frequency',
      'digest_frequency',
      'health_check_frequency'
    ];
    return selectFields.includes(key);
  };

  const isTextareaField = (key: string): boolean => {
    const textareaFields = [
      'app_description',
      'maintenance_message',
      'company_address'
    ];
    return textareaFields.includes(key);
  };

  const getInputType = (key: string): string => {
    if (key.includes('email')) return 'email';
    if (key.includes('url')) return 'url';
    if (key.includes('phone')) return 'tel';
    if (key.includes('password')) return 'password';
    return 'text';
  };

  const getMinValue = (key: string): number | undefined => {
    const minValues: { [key: string]: number } = {
      pagination_size: 1,
      session_timeout: 5,
      password_min_length: 4,
      max_login_attempts: 1,
      lockout_duration: 1,
      cache_ttl: 60,
      max_file_upload_size: 1024,
      decimal_places: 0,
    };
    return minValues[key];
  };

  const getMaxValue = (key: string): number | undefined => {
    const maxValues: { [key: string]: number } = {
      pagination_size: 100,
      session_timeout: 1440,
      password_min_length: 128,
      max_login_attempts: 20,
      lockout_duration: 1440,
      cache_ttl: 86400,
      max_file_upload_size: 102400,
      decimal_places: 8,
    };
    return maxValues[key];
  };

  const getFieldHint = (key: string): string | null => {
    const hints: { [key: string]: string } = {
      session_timeout: 'Time in minutes before user sessions expire',
      password_min_length: 'Minimum number of characters required for passwords',
      max_login_attempts: 'Number of failed attempts before account lockout',
      lockout_duration: 'Time in minutes for account lockout',
      cache_ttl: 'Cache time-to-live in seconds',
      max_file_upload_size: 'Maximum file size in KB (1024 KB = 1 MB)',
      pagination_size: 'Number of items displayed per page',
      decimal_places: 'Number of decimal places for currency display',
      backup_retention_days: 'Number of days to keep backup files',
      log_retention_days: 'Number of days to keep log files',
      notification_retention_days: 'Number of days to keep notifications',
    };
    return hints[key] || null;
  };

  const getSelectOptions = (key: string) => {
    const options: { [key: string]: { value: string; label: string }[] } = {
      default_timezone: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time (US)' },
        { value: 'America/Chicago', label: 'Central Time (US)' },
        { value: 'America/Denver', label: 'Mountain Time (US)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
        { value: 'Asia/Shanghai', label: 'Shanghai' },
        { value: 'Australia/Sydney', label: 'Sydney' },
      ],
      default_language: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'ar', label: 'Arabic' },
      ],
      currency: [
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'JPY', label: 'Japanese Yen (JPY)' },
        { value: 'CAD', label: 'Canadian Dollar (CAD)' },
        { value: 'AUD', label: 'Australian Dollar (AUD)' },
        { value: 'CHF', label: 'Swiss Franc (CHF)' },
        { value: 'CNY', label: 'Chinese Yuan (CNY)' },
        { value: 'INR', label: 'Indian Rupee (INR)' },
      ],
      backup_frequency: [
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
      digest_frequency: [
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
      health_check_frequency: [
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
      ],
    };
    return options[key] || [];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: Globe,
      security: Shield,
      performance: Zap,
      notifications: Clock,
      maintenance: Info,
    };
    return icons[category as keyof typeof icons] || Info;
  };

  const groupedFields = fields.reduce((groups, field) => {
    const setting = settings[field];
    if (!setting) return groups;

    // Group fields by logical sections
    let section = 'General';
    if (field.includes('password') || field.includes('login') || field.includes('lockout') || field.includes('two_factor')) {
      section = 'Authentication';
    } else if (field.includes('cache') || field.includes('compression') || field.includes('optimization')) {
      section = 'Performance';
    } else if (field.includes('notification') || field.includes('email') || field.includes('sms')) {
      section = 'Notifications';
    } else if (field.includes('backup') || field.includes('maintenance') || field.includes('cleanup')) {
      section = 'Maintenance';
    } else if (field.includes('company')) {
      section = 'Company Information';
    }

    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(field);
    return groups;
  }, {} as { [section: string]: string[] });

  return (
    <div className="space-y-6">
      {Object.entries(groupedFields).map(([section, sectionFields], index) => (
        <div key={section}>
          {index > 0 && <Separator className="my-6" />}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              {React.createElement(getCategoryIcon(category), { className: "h-4 w-4 mr-2" })}
              {section}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionFields.map(renderField)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsForm;
