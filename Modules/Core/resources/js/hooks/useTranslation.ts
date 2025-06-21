/**
 * React hook for translation management with Inertia.js integration
 */

import { useMemo, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import {
  getTranslation,
  useLocale,
  useAvailableLocales,
  useLocaleConfig,
  switchLocale,
  hasTranslation,
  getAllTranslations,
  formatTranslatableForForm,
  validateRequiredTranslations,
  getLocaleDisplayName,
  isRTLLocale,
  getTextDirection
} from '../utils/translation';

interface TranslationHookReturn {
  // Current locale information
  locale: string;
  availableLocales: string[];
  localeConfig: {
    current: string;
    available: string[];
    rtl: boolean;
    fallback: string;
  };

  // Translation functions
  t: (key: string | Record<string, string> | null | undefined) => string;
  tl: (key: string | Record<string, string> | null | undefined, locale: string) => string;

  // Utility functions
  hasTranslation: (key: string | Record<string, string> | null | undefined, locale: string) => boolean;
  getAllTranslations: (key: string | Record<string, string> | null | undefined) => Record<string, string>;
  formatForForm: (key: string | Record<string, string> | null | undefined) => Record<string, string>;
  validateRequired: (key: string | Record<string, string> | null | undefined, requiredLocales: string[]) => string[];

  // Locale management
  switchLocale: (locale: string, preserveState?: boolean) => void;
  getDisplayName: (locale: string) => string;
  isRTL: (locale?: string) => boolean;
  getDirection: (locale?: string) => 'rtl' | 'ltr';

  // Laravel translations (from language files)
  __: (key: string, replacements?: Record<string, string | number>) => string;
}

/**
 * Hook for comprehensive translation management
 * @returns Translation utilities and functions
 */
export function useTranslation(): TranslationHookReturn {
  const locale = useLocale();
  const availableLocales = useAvailableLocales();
  const localeConfig = useLocaleConfig();

  // Get Laravel translations from Inertia props
  const { props } = usePage();
  const translations = (props as any).translations || {};

  // Translation function for translatable fields
  const t = useCallback(
    (key: string | Record<string, string> | null | undefined) => {
      return getTranslation(key, locale);
    },
    [locale]
  );

  // Translation function with explicit locale
  const tl = useCallback(
    (key: string | Record<string, string> | null | undefined, targetLocale: string) => {
      return getTranslation(key, targetLocale);
    },
    []
  );

  // Laravel translation function (for language files)
  const __ = useCallback(
    (key: string, replacements: Record<string, string | number> = {}) => {
      // Handle nested keys with dot notation
      let translation = translations[key];
      
      if (!translation && key.includes('.')) {
        // Try to access nested object
        const keys = key.split('.');
        let current = translations;
        
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            current = undefined;
            break;
          }
        }
        
        translation = current;
      }
      
      // If still no translation found, use the key as fallback
      if (translation === undefined || translation === null) {
        translation = key;
      }
      
      // Ensure we return a string, not an object
      if (typeof translation === 'object') {
        // If it's a translatable object, extract the current locale
        if (translation && typeof translation === 'object' && !Array.isArray(translation)) {
          translation = translation[locale] || translation.en || Object.values(translation)[0] || key;
        } else {
          translation = key;
        }
      }
      
      // Convert to string to ensure we never return objects
      translation = String(translation);

      // Replace placeholders
      Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(`:${placeholder}`, 'g');
        translation = translation.replace(regex, String(value));
      });

      return translation;
    },
    [translations, locale]
  );

  // Utility functions with current locale context
  const hasTranslationForCurrent = useCallback(
    (key: string | Record<string, string> | null | undefined, targetLocale: string) => {
      return hasTranslation(key, targetLocale);
    },
    []
  );

  const getAllTranslationsForKey = useCallback(
    (key: string | Record<string, string> | null | undefined) => {
      return getAllTranslations(key);
    },
    []
  );

  const formatForForm = useCallback(
    (key: string | Record<string, string> | null | undefined) => {
      return formatTranslatableForForm(key, availableLocales);
    },
    [availableLocales]
  );

  const validateRequired = useCallback(
    (key: string | Record<string, string> | null | undefined, requiredLocales: string[]) => {
      return validateRequiredTranslations(key, requiredLocales);
    },
    []
  );

  // Locale management functions
  const handleSwitchLocale = useCallback(
    (targetLocale: string, preserveState: boolean = true) => {
      switchLocale(targetLocale, preserveState);
    },
    []
  );

  const getDisplayName = useCallback(
    (targetLocale: string) => {
      return getLocaleDisplayName(targetLocale);
    },
    []
  );

  const isRTL = useCallback(
    (targetLocale?: string) => {
      return isRTLLocale(targetLocale || locale);
    },
    [locale]
  );

  const getDirection = useCallback(
    (targetLocale?: string) => {
      return getTextDirection(targetLocale || locale);
    },
    [locale]
  );

  return useMemo(
    () => ({
      // Current locale information
      locale,
      availableLocales,
      localeConfig,

      // Translation functions
      t,
      tl,

      // Utility functions
      hasTranslation: hasTranslationForCurrent,
      getAllTranslations: getAllTranslationsForKey,
      formatForForm,
      validateRequired,

      // Locale management
      switchLocale: handleSwitchLocale,
      getDisplayName,
      isRTL,
      getDirection,

      // Laravel translations
      __
    }),
    [
      locale,
      availableLocales,
      localeConfig,
      t,
      tl,
      hasTranslationForCurrent,
      getAllTranslationsForKey,
      formatForForm,
      validateRequired,
      handleSwitchLocale,
      getDisplayName,
      isRTL,
      getDirection,
      __
    ]
  );
}

/**
 * Hook for form handling with translatable fields
 * @param initialValues - Initial form values with translatable fields
 * @returns Form utilities for translatable fields
 */
export function useTranslatableForm<T extends Record<string, any>>(initialValues: T) {
  const { availableLocales, formatForForm, validateRequired } = useTranslation();

  // Format initial values for form
  const formattedInitialValues = useMemo(() => {
    const formatted: Record<string, any> = {};

    Object.entries(initialValues).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Assume it's a translatable field
        formatted[key] = formatForForm(value);
      } else {
        formatted[key] = value;
      }
    });

    return formatted;
  }, [initialValues, formatForForm]);

  // Validation function for required translations
  const validateTranslations = useCallback(
    (values: Record<string, any>, requiredFields: string[], requiredLocales: string[] = ['en']) => {
      const errors: Record<string, string[]> = {};

      requiredFields.forEach(field => {
        if (values[field]) {
          const missing = validateRequired(values[field], requiredLocales);
          if (missing.length > 0) {
            errors[field] = missing;
          }
        }
      });

      return errors;
    },
    [validateRequired]
  );

  return {
    formattedInitialValues,
    validateTranslations,
    availableLocales
  };
}

export default useTranslation;



