import { formatDateMedium } from '@/Core/utils/dateFormatter';

// Placeholder utility for formatting
export function formatCurrency(value: number): string {
  return `SAR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return formatDateMedium(d);
}

