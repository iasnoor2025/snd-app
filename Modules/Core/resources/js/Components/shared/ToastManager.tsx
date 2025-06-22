import { toast } from "@/Core";
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

/**
 * Toast Manager Service
 * A utility class for managing toast notifications in the application.
 * Provides methods for showing success, error, info, warning, and loading toasts.
 */
export class ToastManager {
  /**
   * Get translation function
   * @returns The translation function
   */
  private static getT() {
    return i18next.t;
  }

  /**
   * Show a success toast notification
   * @param message The message to display
   * @param options Additional toast options
   */
  static success(message: string, options: any = {}) {
    const t = this.getT();
    toast({
              title: options.title || t('toasts.success', 'Success'),
      description: message,
      variant: 'success',
      duration: options.duration || 3000,
      ...options,
    });
  }

  /**
   * Show an error toast notification
   * @param message The error message to display
   * @param options Additional toast options
   */
  static error(message: string, options: any = {}) {
    const t = this.getT();
    toast({
              title: options.title || t('toasts.error', 'Error'),
      description: message,
      variant: 'destructive',
      duration: options.duration || 5000,
      ...options,
    });
  }

  /**
   * Show an info toast notification
   * @param message The info message to display
   * @param options Additional toast options
   */
  static info(message: string, options: any = {}) {
    const t = this.getT();
    toast({
              title: options.title || t('toasts.information', 'Information'),
      description: message,
      variant: 'info',
      duration: options.duration || 3000,
      ...options,
    });
  }

  /**
   * Show a warning toast notification
   * @param message The warning message to display
   * @param options Additional toast options
   */
  static warning(message: string, options: any = {}) {
    const t = this.getT();
    toast({
              title: options.title || t('toasts.warning', 'Warning'),
      description: message,
      variant: 'warning',
      duration: options.duration || 4000,
      ...options,
    });
  }

  /**
   * Show a loading toast notification
   * @param message The loading message to display
   * @param options Additional toast options
   * @returns The toast ID that can be used to dismiss the toast
   */
  static loading(message: string, options: any = {}) {
    const t = this.getT();
    return toast({
              title: options.title || t('toasts.loading', 'Loading'),
      description: message,
      variant: 'default',
      duration: options.duration || 0, // Infinite duration by default
      isLoading: true,
      ...options,
    });
  }

  /**
   * Dismiss a specific toast by ID
   * @param toastId The ID of the toast to dismiss
   */
  static dismiss(toastId: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll() {
    toast.dismiss();
  }
}

// For backward compatibility, also export as ToastService
export const ToastService = ToastManager;

// Default export for direct imports
export default ToastManager;





















