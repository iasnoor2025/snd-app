/**
 * Utility functions for handling translatable fields in React components
 */

import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

/**
 * Extract the translated value from a translatable field object
 * @param translatableField - The translatable field (can be string or object with locale keys)
 * @param locale - The current locale (defaults to 'en')
 * @param fallbackLocale - Fallback locale if the requested locale is not available
 * @returns The translated string or empty string if not found
 */
export function getTranslation(
  translatableField: string | Record<string, string> | null | undefined,
  locale: string = 'en',
  fallbackLocale: string = 'en'
): string {
  // If it's already a string, return it
  if (typeof translatableField === 'string') {
    return translatableField;
  }

  // If it's null or undefined, return empty string
  if (!translatableField || typeof translatableField !== 'object') {
    return '';
  }

  // Try to get the translation for the requested locale
  if (translatableField[locale]) {
    return translatableField[locale];
  }

  // Try fallback locale
  if (translatableField[fallbackLocale]) {
    return translatableField[fallbackLocale];
  }

  // Try to get any available translation
  const availableTranslations = Object.values(translatableField);
  if (availableTranslations.length > 0) {
    return availableTranslations[0];
  }

  // Return empty string if no translation found
  return '';
}

/**
 * Hook to get the current locale from Inertia shared data
 * @returns The current locale string
 */
export function useLocale(): string {
  try {
    const { props } = usePage();
    return (props as any).locale || 'en';
  } catch {
    return 'en';
  }
}

/**
 * Hook to get available locales from Inertia shared data
 * @returns Array of available locale codes
 */
export function useAvailableLocales(): string[] {
  try {
    const { props } = usePage();
    return (props as any).availableLocales || ['en'];
  } catch {
    return ['en'];
  }
}

/**
 * Hook to get locale configuration from Inertia shared data
 * @returns Locale configuration object
 */
export function useLocaleConfig(): {
  current: string;
  available: string[];
  rtl: boolean;
  fallback: string;
} {
  try {
    const { props } = usePage();
    const localeConfig = (props as any).localeConfig || {};
    return {
      current: localeConfig.current || 'en',
      available: localeConfig.available || ['en'],
      rtl: localeConfig.rtl || false,
      fallback: localeConfig.fallback || 'en'
    };
  } catch {
    return {
      current: 'en',
      available: ['en'],
      rtl: false,
      fallback: 'en'
    };
  }
}

/**
 * Get translated value using the current locale from Inertia
 * @param translatableField - The translatable field
 * @param locale - The current locale (must be passed from a React component)
 * @returns The translated string
 */
export function t(translatableField: string | Record<string, string> | null | undefined, locale: string = 'en'): string {
  return getTranslation(translatableField, locale);
}

/**
 * Get translated value with explicit locale
 * @param translatableField - The translatable field
 * @param locale - The locale to use
 * @returns The translated string
 */
export function tl(
  translatableField: string | Record<string, string> | null | undefined,
  locale: string
): string {
  return getTranslation(translatableField, locale);
}

/**
 * Check if a translatable field has translation for a specific locale
 * @param translatableField - The translatable field
 * @param locale - The locale to check
 * @returns True if translation exists
 */
export function hasTranslation(
  translatableField: string | Record<string, string> | null | undefined,
  locale: string
): boolean {
  if (typeof translatableField === 'string') {
    return true;
  }

  if (!translatableField || typeof translatableField !== 'object') {
    return false;
  }

  return Boolean(translatableField[locale]);
}

/**
 * Get all available translations for a translatable field
 * @param translatableField - The translatable field
 * @returns Object with all available translations
 */
export function getAllTranslations(
  translatableField: string | Record<string, string> | null | undefined
): Record<string, string> {
  if (typeof translatableField === 'string') {
    return { en: translatableField };
  }

  if (!translatableField || typeof translatableField !== 'object') {
    return {};
  }

  return { ...translatableField };
}

/**
 * Switch the application locale
 * @param locale - Target locale
 * @param preserveState - Whether to preserve current state
 */
export function switchLocale(locale: string, preserveState: boolean = false): void {
  // Use a GET request instead of POST to avoid CSRF issues on login page
  // This is important because the login page might not have the CSRF token properly set
  window.location.href = route('localization.switch.public', locale);
}

/**
 * Format a translatable field for form input
 * @param translatableField - The translatable field
 * @param availableLocales - Available locales
 * @returns Object formatted for form inputs
 */
export function formatTranslatableForForm(
  translatableField: string | Record<string, string> | null | undefined,
  availableLocales: string[]
): Record<string, string> {
  const translations = getAllTranslations(translatableField);
  const formatted: Record<string, string> = {};

  availableLocales.forEach(locale => {
    formatted[locale] = translations[locale] || '';
  });

  return formatted;
}

/**
 * Validate that required translations are present
 * @param translatableField - The translatable field
 * @param requiredLocales - Locales that must have translations
 * @returns Array of missing locales
 */
export function validateRequiredTranslations(
  translatableField: string | Record<string, string> | null | undefined,
  requiredLocales: string[]
): string[] {
  const translations = getAllTranslations(translatableField);
  const missing: string[] = [];

  requiredLocales.forEach(locale => {
    if (!translations[locale] || translations[locale].trim() === '') {
      missing.push(locale);
    }
  });

  return missing;
}

/**
 * Get locale display name
 * @param locale - The locale code
 * @returns Human-readable locale name
 */
export function getLocaleDisplayName(locale: string): string {
  const localeNames: Record<string, string> = {
    'en': 'English',
    'ar': 'العربية',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어'
  };

  return localeNames[locale] || locale.toUpperCase();
}

/**
 * Check if locale is RTL (Right-to-Left)
 * @param locale - The locale code
 * @returns True if locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];
  return rtlLocales.includes(locale);
}

/**
 * Get text direction for locale
 * @param locale - The locale code (required)
 * @returns 'rtl' or 'ltr'
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}



