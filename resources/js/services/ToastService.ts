import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  id?: string | number;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
}

export class ToastService {
  private static defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
    dismissible: true,
  };

  /**
   * Show a success toast notification
   */
  static success(message: string, options?: ToastOptions): string | number {
    return toast.success(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Show an error toast notification
   */
  static error(message: string, options?: ToastOptions): string | number {
    return toast.error(message, {
      ...this.defaultOptions,
      duration: 6000, // Errors stay longer
      ...options,
    });
  }

  /**
   * Show an info toast notification
   */
  static info(message: string, options?: ToastOptions): string | number {
    return toast.info(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Show a warning toast notification
   */
  static warning(message: string, options?: ToastOptions): string | number {
    return toast.warning(message, {
      ...this.defaultOptions,
      duration: 5000, // Warnings stay a bit longer
      ...options,
    });
  }

  /**
   * Show a loading toast notification
   */
  static loading(message: string, options?: ToastOptions): string | number {
    return toast.loading(message, {
      ...this.defaultOptions,
      duration: Infinity, // Loading toasts don't auto-dismiss
      dismissible: false,
      ...options,
    });
  }

  /**
   * Show a custom toast notification
   */
  static custom(message: string, options?: ToastOptions): string | number {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Show a promise-based toast (for async operations)
   */
  static promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    } & ToastOptions
  ): Promise<T> {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    }, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Dismiss a specific toast
   */
  static dismiss(id?: string | number): void {
    toast.dismiss(id);
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Update an existing toast
   */
  static update(id: string | number, message: string, options?: ToastOptions): void {
    // Sonner doesn't have direct update, so we dismiss and create new
    this.dismiss(id);
    toast(message, {
      ...this.defaultOptions,
      ...options,
      id,
    });
  }

  // Convenience methods for common scenarios

  /**
   * Show a saved successfully toast
   */
  static saved(itemName: string = 'Item'): string | number {
    return this.success(`${itemName} saved successfully`);
  }

  /**
   * Show a deleted successfully toast
   */
  static deleted(itemName: string = 'Item'): string | number {
    return this.success(`${itemName} deleted successfully`);
  }

  /**
   * Show an updated successfully toast
   */
  static updated(itemName: string = 'Item'): string | number {
    return this.success(`${itemName} updated successfully`);
  }

  /**
   * Show a created successfully toast
   */
  static created(itemName: string = 'Item'): string | number {
    return this.success(`${itemName} created successfully`);
  }

  /**
   * Show a validation error toast
   */
  static validationError(message: string = 'Please check your input and try again'): string | number {
    return this.error(message);
  }

  /**
   * Show a network error toast
   */
  static networkError(message: string = 'Network error. Please check your connection and try again'): string | number {
    return this.error(message);
  }

  /**
   * Show a permission denied toast
   */
  static permissionDenied(message: string = 'You do not have permission to perform this action'): string | number {
    return this.error(message);
  }

  /**
   * Show a not found toast
   */
  static notFound(itemName: string = 'Item'): string | number {
    return this.error(`${itemName} not found`);
  }

  /**
   * Show a confirmation toast with action
   */
  static confirm(
    message: string,
    onConfirm: () => void,
    confirmLabel: string = 'Confirm',
    cancelLabel: string = 'Cancel'
  ): string | number {
    return this.warning(message, {
      duration: Infinity,
      action: {
        label: confirmLabel,
        onClick: onConfirm,
      },
      cancel: {
        label: cancelLabel,
        onClick: () => this.dismiss(),
      },
    });
  }

  /**
   * Show an undo toast
   */
  static undo(
    message: string,
    onUndo: () => void,
    undoLabel: string = 'Undo'
  ): string | number {
    return this.info(message, {
      duration: 8000, // Give more time for undo
      action: {
        label: undoLabel,
        onClick: onUndo,
      },
    });
  }

  /**
   * Show a file upload progress toast
   */
  static uploadProgress(fileName: string, progress: number): string | number {
    if (progress < 100) {
      return this.loading(`Uploading ${fileName}... ${progress}%`);
    } else {
      return this.success(`${fileName} uploaded successfully`);
    }
  }

  /**
   * Show a download started toast
   */
  static downloadStarted(fileName: string): string | number {
    return this.info(`Download started: ${fileName}`);
  }

  /**
   * Show a download completed toast
   */
  static downloadCompleted(fileName: string): string | number {
    return this.success(`Download completed: ${fileName}`);
  }

  /**
   * Show a copy to clipboard toast
   */
  static copied(content: string = 'Content'): string | number {
    return this.success(`${content} copied to clipboard`);
  }

  /**
   * Show a form validation summary toast
   */
  static formErrors(errors: string[]): string | number {
    const message = errors.length === 1 
      ? errors[0] 
      : `Please fix ${errors.length} validation errors`;
    
    return this.error(message, {
      duration: 6000,
    });
  }

  /**
   * Show a batch operation result toast
   */
  static batchResult(
    successCount: number,
    failureCount: number,
    operation: string = 'operation'
  ): string | number {
    if (failureCount === 0) {
      return this.success(`${operation} completed successfully for ${successCount} items`);
    } else if (successCount === 0) {
      return this.error(`${operation} failed for all ${failureCount} items`);
    } else {
      return this.warning(
        `${operation} completed with ${successCount} successes and ${failureCount} failures`
      );
    }
  }

  /**
   * Show a connection status toast
   */
  static connectionStatus(isOnline: boolean): string | number {
    if (isOnline) {
      return this.success('Connection restored');
    } else {
      return this.warning('Connection lost. Some features may not work properly', {
        duration: Infinity,
      });
    }
  }

  /**
   * Show a session expiry warning toast
   */
  static sessionExpiring(minutesLeft: number): string | number {
    return this.warning(
      `Your session will expire in ${minutesLeft} minutes. Please save your work.`,
      {
        duration: 10000,
        action: {
          label: 'Extend Session',
          onClick: () => {
            // This would trigger session extension logic
            window.location.reload();
          },
        },
      }
    );
  }

  /**
   * Show a maintenance mode toast
   */
  static maintenanceMode(message: string = 'System is under maintenance'): string | number {
    return this.warning(message, {
      duration: Infinity,
      dismissible: false,
    });
  }

  /**
   * Show a feature not available toast
   */
  static featureNotAvailable(featureName: string = 'This feature'): string | number {
    return this.info(`${featureName} is not available in your current plan`);
  }

  /**
   * Show a quota exceeded toast
   */
  static quotaExceeded(quotaType: string = 'usage'): string | number {
    return this.warning(`You have exceeded your ${quotaType} quota`);
  }

  /**
   * Show a sync status toast
   */
  static syncStatus(status: 'syncing' | 'synced' | 'failed'): string | number {
    switch (status) {
      case 'syncing':
        return this.loading('Syncing data...');
      case 'synced':
        return this.success('Data synced successfully');
      case 'failed':
        return this.error('Sync failed. Will retry automatically');
      default:
        return this.info('Unknown sync status');
    }
  }

  /**
   * Show an auto-save status toast
   */
  static autoSave(status: 'saving' | 'saved' | 'failed'): string | number {
    switch (status) {
      case 'saving':
        return this.loading('Auto-saving...', { duration: 2000 });
      case 'saved':
        return this.success('Auto-saved', { duration: 2000 });
      case 'failed':
        return this.error('Auto-save failed');
      default:
        return this.info('Unknown auto-save status');
    }
  }
}

// Export both the class and individual methods for convenience
export const {
  success,
  error,
  info,
  warning,
  loading,
  custom,
  promise,
  dismiss,
  dismissAll,
  update,
  saved,
  deleted,
  updated,
  created,
  validationError,
  networkError,
  permissionDenied,
  notFound,
  confirm,
  undo,
  uploadProgress,
  downloadStarted,
  downloadCompleted,
  copied,
  formErrors,
  batchResult,
  connectionStatus,
  sessionExpiring,
  maintenanceMode,
  featureNotAvailable,
  quotaExceeded,
  syncStatus,
  autoSave,
} = ToastService;

export default ToastService; 
