import { format } from 'date-fns';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

export function formatCurrency(value: number) {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'SAR' }) ?? '—';
}

export function formatPercentage(value: number) {
  return value?.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }) ?? '—';
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd');
}



