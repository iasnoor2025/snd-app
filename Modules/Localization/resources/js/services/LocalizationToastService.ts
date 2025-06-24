import { ToastService } from '@/Core';

export class LocalizationToastService extends ToastService {
  // Language operations
  static languageAdded(language: string): string | number {
    return this.success(`Language "${language}" added successfully`);
  }

  static languageUpdated(language: string): string | number {
    return this.success(`Language "${language}" updated successfully`);
  }

  static languageRemoved(language: string): string | number {
    return this.success(`Language "${language}" removed successfully`);
  }

  static languageEnabled(language: string): string | number {
    return this.success(`Language "${language}" enabled`);
  }

  static languageDisabled(language: string): string | number {
    return this.warning(`Language "${language}" disabled`);
  }

  // Translation operations
  static translationAdded(key: string, language: string): string | number {
    return this.success(`Translation added for "${key}" in ${language}`);
  }

  static translationUpdated(key: string, language: string): string | number {
    return this.success(`Translation updated for "${key}" in ${language}`);
  }

  static translationRemoved(key: string, language: string): string | number {
    return this.success(`Translation removed for "${key}" in ${language}`);
  }

  static translationMissing(key: string, language: string): string | number {
    return this.warning(`Missing translation for "${key}" in ${language}`);
  }

  // Import operations
  static importStarted(language: string): string | number {
    return this.loading(`Importing translations for ${language}...`);
  }

  static importCompleted(language: string, count: number): string | number {
    return this.success(`Imported ${count} translations for ${language}`);
  }

  static importFailed(language: string, error?: string): string | number {
    return this.error(`Failed to import translations for ${language}${error ? `: ${error}` : ''}`);
  }

  // Export operations
  static exportStarted(language: string): string | number {
    return this.loading(`Exporting translations for ${language}...`);
  }

  static exportCompleted(language: string): string | number {
    return this.success(`Translations exported for ${language}`);
  }

  static exportFailed(language: string, error?: string): string | number {
    return this.error(`Failed to export translations for ${language}${error ? `: ${error}` : ''}`);
  }

  // Sync operations
  static syncStarted(): string | number {
    return this.loading('Syncing translations with modules...');
  }

  static syncCompleted(count: number): string | number {
    return this.success(`Synced ${count} translations with modules`);
  }

  static syncFailed(error?: string): string | number {
    return this.error(`Failed to sync translations${error ? `: ${error}` : ''}`);
  }

  // Cache operations
  static cacheCleared(): string | number {
    return this.success('Translation cache cleared');
  }

  static cacheUpdated(): string | number {
    return this.success('Translation cache updated');
  }

  static cacheError(error?: string): string | number {
    return this.error(`Translation cache error${error ? `: ${error}` : ''}`);
  }

  // Module operations
  static moduleTranslationsAdded(module: string, language: string): string | number {
    return this.success(`Translations added for ${module} module in ${language}`);
  }

  static moduleTranslationsUpdated(module: string, language: string): string | number {
    return this.success(`Translations updated for ${module} module in ${language}`);
  }

  static moduleTranslationsRemoved(module: string, language: string): string | number {
    return this.success(`Translations removed for ${module} module in ${language}`);
  }

  // Scan operations
  static scanStarted(): string | number {
    return this.loading('Scanning for new translation keys...');
  }

  static scanCompleted(count: number): string | number {
    return this.success(`Found ${count} new translation keys`);
  }

  static scanFailed(error?: string): string | number {
    return this.error(`Failed to scan for translation keys${error ? `: ${error}` : ''}`);
  }

  // Validation operations
  static validationStarted(): string | number {
    return this.loading('Validating translations...');
  }

  static validationCompleted(issues: number): string | number {
    return issues > 0
      ? this.warning(`Found ${issues} translation issues`)
      : this.success('All translations are valid');
  }

  static validationFailed(error?: string): string | number {
    return this.error(`Translation validation failed${error ? `: ${error}` : ''}`);
  }

  // Validation errors
  static localizationValidationError(field: string): string | number {
    return this.validationError(field);
  }

  // Process notifications
  static processingLocalization(action: string): string | number {
    return this.processing(`localization ${action}`);
  }

  static localizationProcessed(action: string): string | number {
    return this.processed(`localization ${action}`);
  }

  static localizationProcessFailed(action: string, error?: string): string | number {
    return this.operationFailed(`${action} localization`, error);
  }

  // Bulk operations
  static bulkOperationStarted(operation: string, count: number): string | number {
    return this.loading(`Processing ${operation} for ${count} translations...`);
  }

  static bulkOperationCompleted(operation: string, count: number): string | number {
    return this.success(`Successfully ${operation} ${count} translations`);
  }

  static bulkOperationFailed(operation: string, error?: string): string | number {
    return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
  }

  // Permission errors
  static permissionDenied(action: string): string | number {
    return this.error(`You don't have permission to ${action}`);
  }
} 