import { Toaster, toast as sonnerToast } from 'sonner';
import React from 'react';

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  action?: ToastAction;
  cancel?: ToastAction;
  id?: string | number;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  description?: string;
  important?: boolean;
}

export class ToastService {
  protected static defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
    dismissible: true,
  };

  // Basic notifications
  public static success(message: string, options?: ToastOptions): string | number {
    return sonnerToast.success(message, { ...this.defaultOptions, ...options });
  }

  public static error(message: string, options?: ToastOptions): string | number {
    return sonnerToast.error(message, {
      ...this.defaultOptions,
      duration: 7000, // Longer duration for errors
      important: true, // Errors are important by default
      ...options,
    });
  }

  public static info(message: string, options?: ToastOptions): string | number {
    return sonnerToast(message, { ...this.defaultOptions, ...options });
  }

  public static warning(message: string, options?: ToastOptions): string | number {
    return sonnerToast.warning(message, {
      ...this.defaultOptions,
      duration: 6000, // Medium duration for warnings
      ...options,
    });
  }

  public static loading(message: string, options?: ToastOptions): string | number {
    return sonnerToast.loading(message, {
      ...this.defaultOptions,
      duration: Infinity, // Loading toasts stay until manually dismissed
      ...options,
    });
  }

  // CRUD operation notifications
  public static created(itemName: string, options?: ToastOptions): string | number {
    return this.success(`${itemName} created successfully`, options);
  }

  public static updated(itemName: string, options?: ToastOptions): string | number {
    return this.success(`${itemName} updated successfully`, options);
  }

  public static deleted(itemName: string, options?: ToastOptions): string | number {
    return this.success(`${itemName} deleted successfully`, options);
  }

  public static restored(itemName: string, options?: ToastOptions): string | number {
    return this.success(`${itemName} restored successfully`, options);
  }

  // Process notifications
  public static processing(action: string, options?: ToastOptions): string | number {
    return this.loading(`Processing ${action}...`, options);
  }

  public static processed(action: string, options?: ToastOptions): string | number {
    return this.success(`${action} completed successfully`, options);
  }

  public static operationFailed(action: string, error?: string, options?: ToastOptions): string | number {
    const message = error ? `Failed to ${action}: ${error}` : `Failed to ${action}`;
    return this.error(message, options);
  }

  // Validation notifications
  public static validationError(field: string, options?: ToastOptions): string | number {
    return this.error(`Invalid ${field}`, options);
  }

  // Custom notifications
  public static custom(
    message: string | React.ReactNode,
    options?: ToastOptions & { type?: ToastType }
  ): string | number {
    const { type, ...restOptions } = options || {};
    if (type) {
      return sonnerToast[type](message, { ...this.defaultOptions, ...restOptions });
    }
    return sonnerToast(message, { ...this.defaultOptions, ...restOptions });
  }

  // Promise handling
  public static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ): Promise<T> {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...this.defaultOptions,
      ...options,
    });
  }

  // Dismiss notifications
  public static dismiss(toastId: string | number): void {
    sonnerToast.dismiss(toastId);
  }

  // Update existing notification
  public static update(
    toastId: string | number,
    message: string,
    options?: ToastOptions
  ): void {
    sonnerToast.update(toastId, {
      render: message,
      ...options,
    });
  }

  // Network Notifications
  public static networkError(message: string = 'Network error. Please check your connection'): string | number {
    return this.error(message);
  }

  // Authentication Notifications
  public static sessionExpired(): string | number {
    return this.warning('Your session has expired. Please log in again.');
  }

  public static unauthorized(): string | number {
    return this.error('You are not authorized to perform this action.');
  }

  // File Operation Notifications
  public static uploadSuccess(fileName: string = 'File'): string | number {
    return this.success(`${fileName} uploaded successfully`);
  }

  public static uploadError(fileName: string = 'File', error?: string): string | number {
    const message = error ? `Failed to upload ${fileName}: ${error}` : `Failed to upload ${fileName}`;
    return this.error(message);
  }

  // Process Notifications
  public static processStarted(processName: string = 'Process'): string | number {
    return this.info(`${processName} started`);
  }

  public static processCompleted(processName: string = 'Process'): string | number {
    return this.success(`${processName} completed successfully`);
  }

  public static processFailed(processName: string = 'Process', error?: string): string | number {
    const message = error ? `${processName} failed: ${error}` : `${processName} failed`;
    return this.error(message);
  }
}

// Export the Sonner toast function with a different name to avoid conflicts
export { sonnerToast as toast }; 