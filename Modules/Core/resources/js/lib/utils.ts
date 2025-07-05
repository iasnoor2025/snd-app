import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `$${amount}`
}
