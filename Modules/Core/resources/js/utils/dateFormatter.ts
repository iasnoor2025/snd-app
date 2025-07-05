import { format, parseISO, isValid } from 'date-fns';

/**
 * Comprehensive date formatting utilities for the application
 * Uses date-fns for consistent, locale-independent formatting
 */

export interface DateFormats {
  short: string;      // MM/dd/yyyy
  medium: string;     // MMM dd, yyyy
  long: string;       // MMMM dd, yyyy
  full: string;       // EEEE, MMMM dd, yyyy
  time: string;       // h:mm a
  datetime: string;   // MMM dd, yyyy h:mm a
  iso: string;        // yyyy-MM-dd
  timestamp: string;  // MMM dd, yyyy 'at' h:mm a
}

export const DATE_FORMATS: DateFormats = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'h:mm a',
  datetime: 'MMM dd, yyyy h:mm a',
  iso: 'yyyy-MM-dd',
  timestamp: "MMM dd, yyyy 'at' h:mm a"
};

/**
 * Parse a date string or Date object into a valid Date
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }

  try {
    // Try parsing as ISO string first
    const parsed = parseISO(date);
    if (isValid(parsed)) return parsed;

    // Fallback to Date constructor
    const fallback = new Date(date);
    return isValid(fallback) ? fallback : null;
  } catch {
    return null;
  }
}

/**
 * Format a date with the specified format
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = DATE_FORMATS.medium
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';

  try {
    return format(parsedDate, formatString);
  } catch {
    return '-';
  }
}

/**
 * Format a date in short format (MM/dd/yyyy)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.short);
}

/**
 * Format a date in medium format (MMM dd, yyyy)
 */
export function formatDateMedium(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.medium);
}

/**
 * Format a date in long format (MMMM dd, yyyy)
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.long);
}

/**
 * Format a date in full format (EEEE, MMMM dd, yyyy)
 */
export function formatDateFull(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.full);
}

/**
 * Format time only (h:mm a)
 */
export function formatTime(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.time);
}

/**
 * Format date and time (MMM dd, yyyy h:mm a)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.datetime);
}

/**
 * Format date as ISO string (yyyy-MM-dd)
 */
export function formatDateISO(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.iso);
}

/**
 * Format date with timestamp (MMM dd, yyyy 'at' h:mm a)
 */
export function formatDateTimestamp(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.timestamp);
}

/**
 * Format created_at/updated_at timestamps consistently
 */
export function formatCreatedAt(date: string | Date | null | undefined): string {
  return formatDateTime(date);
}

export function formatUpdatedAt(date: string | Date | null | undefined): string {
  return formatDateTime(date);
}

/**
 * Format date for form inputs (yyyy-MM-dd)
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  return formatDateISO(date);
}

/**
 * Format relative date (for created_at, updated_at in lists)
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '-';

  const now = new Date();
  const diffInMs = now.getTime() - parsedDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDateMedium(date);
  }
}

/**
 * Check if a date string/object is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  return parseDate(date) !== null;
}

/**
 * Get current date formatted for display
 */
export function getCurrentDate(formatString: string = DATE_FORMATS.medium): string {
  return formatDate(new Date(), formatString);
}

// Export all functions as a single object for easy importing
export const DateFormatter = {
  formatDate,
  formatDateShort,
  formatDateMedium,
  formatDateLong,
  formatDateFull,
  formatTime,
  formatDateTime,
  formatDateISO,
  formatDateTimestamp,
  formatCreatedAt,
  formatUpdatedAt,
  formatDateForInput,
  formatRelativeDate,
  isValidDate,
  getCurrentDate,
  DATE_FORMATS 
};
