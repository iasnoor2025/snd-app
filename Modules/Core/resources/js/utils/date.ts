export function formatDateTime(date: string | Date): string {
  if (!date) {
    return ''; // Return empty string or a default value for null/undefined dates
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return ''; // Return empty string if the date is invalid
  }
  return d;
}


