/**
 * Debug utilities for translation issues
 * Helps identify objects being rendered as React children
 */

/**
 * Check if a value is a translatable object that might cause React errors
 */
export function isTranslatableObject(value: any): value is Record<string, string> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).some(key => key.length === 2 && /^[a-z]{2}$/.test(key))
  );
}

/**
 * Safe render function that converts translatable objects to strings
 */
export function safeRender(value: any, locale: string = 'en', fallback: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (isTranslatableObject(value)) {
    // Try to get the translation for the current locale
    if (value[locale]) {
      return value[locale];
    }

    // Try fallback locale
    if (value.en) {
      return value.en;
    }

    // Return first available translation
    const translations = Object.values(value);
    if (translations.length > 0) {
      return translations[0];
    }
  }

  return fallback;
}

/**
 * Debug function to log potential translation issues
 */
export function debugTranslationObject(value: any, context?: string): void {
  if (process.env.NODE_ENV === 'development' && isTranslatableObject(value)) {
    console.warn(
      `[Translation Debug] Found translatable object that might cause React rendering error:`,
      {
        value,
        context,
        suggestion: 'Use TranslatableText component or t() function to render this safely'
      }
    );
  }
}

/**
 * React development helper to catch translatable objects in JSX
 */
export function withTranslationDebug<T>(component: T, name?: string): T {
  if (process.env.NODE_ENV !== 'development') {
    return component;
  }

  // In development, wrap the component to catch potential issues
  // This is a simplified version - full implementation would require more React internals
  return component;
} 