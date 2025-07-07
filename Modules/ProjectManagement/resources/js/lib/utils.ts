import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDateMedium(dateObj);
}

