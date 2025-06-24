import { ToastService } from '@/Core';

export class SettingsToastService extends ToastService {
  // General settings operations
  static settingSaved(settingName: string): string | number {
    return this.success(`${settingName} setting saved successfully`);
  }

  static settingUpdated(settingName: string): string | number {
    return this.success(`${settingName} setting updated successfully`);
  }

  static settingRestored(settingName: string): string | number {
    return this.success(`${settingName} setting restored to default`);
  }

  static settingError(settingName: string, error?: string): string | number {
    return this.error(`Failed to save ${settingName} setting${error ? `: ${error}` : ''}`);
  }

  // Company settings
  static companyProfileUpdated(): string | number {
    return this.success('Company profile updated successfully');
  }

  static companyLogoUpdated(): string | number {
    return this.success('Company logo updated successfully');
  }

  static branchAdded(branchName: string): string | number {
    return this.success(`Branch ${branchName} added successfully`);
  }

  static branchUpdated(branchName: string): string | number {
    return this.success(`Branch ${branchName} updated successfully`);
  }

  static branchDeleted(branchName: string): string | number {
    return this.success(`Branch ${branchName} deleted successfully`);
  }

  // User settings
  static userPreferencesSaved(): string | number {
    return this.success('User preferences saved successfully');
  }

  static themeChanged(themeName: string): string | number {
    return this.success(`Theme changed to ${themeName}`);
  }

  static languageChanged(language: string): string | number {
    return this.success(`Language changed to ${language}`);
  }

  static timezoneUpdated(timezone: string): string | number {
    return this.success(`Timezone updated to ${timezone}`);
  }

  // Email settings
  static emailConfigSaved(): string | number {
    return this.success('Email configuration saved successfully');
  }

  static emailTestSent(): string | number {
    return this.success('Test email sent successfully');
  }

  static emailTestFailed(error?: string): string | number {
    return this.error(`Test email failed${error ? `: ${error}` : ''}`);
  }

  // SMS settings
  static smsConfigSaved(): string | number {
    return this.success('SMS configuration saved successfully');
  }

  static smsTestSent(): string | number {
    return this.success('Test SMS sent successfully');
  }

  static smsTestFailed(error?: string): string | number {
    return this.error(`Test SMS failed${error ? `: ${error}` : ''}`);
  }

  // Integration settings
  static integrationEnabled(name: string): string | number {
    return this.success(`${name} integration enabled successfully`);
  }

  static integrationDisabled(name: string): string | number {
    return this.success(`${name} integration disabled successfully`);
  }

  static integrationConfigured(name: string): string | number {
    return this.success(`${name} integration configured successfully`);
  }

  static integrationError(name: string, error?: string): string | number {
    return this.error(`${name} integration error${error ? `: ${error}` : ''}`);
  }

  // Backup settings
  static backupConfigSaved(): string | number {
    return this.success('Backup configuration saved successfully');
  }

  static backupStarted(): string | number {
    return this.loading('System backup in progress...');
  }

  static backupCompleted(): string | number {
    return this.success('System backup completed successfully');
  }

  static backupFailed(error?: string): string | number {
    return this.error(`System backup failed${error ? `: ${error}` : ''}`);
  }

  // Security settings
  static securitySettingUpdated(setting: string): string | number {
    return this.success(`Security setting ${setting} updated successfully`);
  }

  static passwordPolicyUpdated(): string | number {
    return this.success('Password policy updated successfully');
  }

  static mfaConfigured(): string | number {
    return this.success('Multi-factor authentication configured successfully');
  }

  static mfaDisabled(): string | number {
    return this.warning('Multi-factor authentication disabled');
  }

  // License settings
  static licenseUpdated(): string | number {
    return this.success('License updated successfully');
  }

  static licenseExpiring(daysLeft: number): string | number {
    return this.warning(`License expires in ${daysLeft} days`);
  }

  static licenseExpired(): string | number {
    return this.error('License has expired');
  }

  // Module settings
  static moduleEnabled(moduleName: string): string | number {
    return this.success(`${moduleName} module enabled successfully`);
  }

  static moduleDisabled(moduleName: string): string | number {
    return this.warning(`${moduleName} module disabled`);
  }

  static moduleConfigured(moduleName: string): string | number {
    return this.success(`${moduleName} module configured successfully`);
  }

  // Validation errors
  static settingsValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingSettings(action: string): string | number {
    return this.processing(`settings ${action}`);
  }

  static settingsProcessed(action: string): string | number {
    return this.processed(`settings ${action}`);
  }

  static settingsProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} settings`, error);
  }

  // Bulk operations
  static bulkOperationStarted(operation: string, count: number): string | number {
    return this.loading(`Processing ${operation} for ${count} settings...`);
  }

  static bulkOperationCompleted(operation: string, count: number): string | number {
    return this.success(`Successfully ${operation} ${count} settings`);
  }

  static bulkOperationFailed(operation: string, error?: string): string | number {
    return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
} 