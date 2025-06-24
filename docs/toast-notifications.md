# Toast Notification System

## Overview

The toast notification system is built on top of Sonner and provides a consistent way to display notifications across the application. It includes support for different types of notifications, custom styling, and module-specific implementations.

## Basic Usage

```typescript
import { ToastService } from '@/Core';

// Basic notifications
ToastService.success('Operation completed successfully');
ToastService.error('Something went wrong');
ToastService.info('Here is some information');
ToastService.warning('Please be careful');
ToastService.loading('Processing...');

// CRUD notifications
ToastService.created('User');
ToastService.updated('Profile');
ToastService.deleted('Document');
ToastService.restored('Record');

// Process notifications
ToastService.processing('upload');
ToastService.processed('download');
ToastService.operationFailed('save', 'Network error');

// Validation notifications
ToastService.validationError('email');

// Custom notifications
ToastService.custom('Custom message', { type: 'success' });

// Promise handling
ToastService.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Data saved!',
    error: 'Failed to save',
  }
);
```

## Toast Component

The `Toast` component is automatically included in the application layout. You can customize its appearance and behavior through props:

```typescript
import { Toast } from '@/Core';

<Toast
  position="top-right"
  theme="system"
  richColors={true}
  expand={false}
  duration={4000}
  visibleToasts={3}
  closeButton={true}
  offset="32px"
  dir="auto"
/>
```

## Module-Specific Toast Services

Each module can have its own toast service that extends the core `ToastService`:

```typescript
import { ToastService } from '@/Core';

export class EmployeeToastService extends ToastService {
  static employeeHired(name: string) {
    return this.success(`${name} has been hired`);
  }

  static employeePromoted(name: string, position: string) {
    return this.success(`${name} has been promoted to ${position}`);
  }
}
```

## Toast Options

All toast methods accept an optional `ToastOptions` object:

```typescript
interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  id?: string | number;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  description?: string;
  important?: boolean;
}
```

## Styling

The toast system uses Tailwind CSS for styling. You can customize the appearance through the `toastOptions` prop:

```typescript
<Toast
  toastOptions={{
    className: 'rounded-lg shadow-lg',
    descriptionClassName: 'text-sm text-gray-500 dark:text-gray-400',
    classNames: {
      toast: 'group toast group-[.toaster]:bg-white ...',
      description: 'group-[.toast]:text-gray-500 ...',
      actionButton: 'group-[.toast]:bg-gray-900 ...',
      cancelButton: 'group-[.toast]:bg-gray-100 ...',
      closeButton: 'group-[.toast]:text-gray-950/50 ...',
    },
  }}
/>
```

## Best Practices

1. Use appropriate toast types:
   - `success` for successful operations
   - `error` for errors and failures
   - `warning` for potential issues
   - `info` for general information
   - `loading` for ongoing operations

2. Keep messages concise and clear

3. Use module-specific services for domain-specific notifications

4. Include helpful context in error messages

5. Use promise handling for async operations

6. Set appropriate durations:
   - Errors: 7000ms (default)
   - Warnings: 6000ms (default)
   - Success/Info: 4000ms (default)
   - Loading: Infinite (until dismissed)

## Installation

The toast system is automatically installed with the Core module. To publish the assets:

```bash
php artisan vendor:publish --tag=core-toast-component
php artisan vendor:publish --tag=core-toast-service
php artisan vendor:publish --tag=module-toast-services
```

## Accessibility

The toast system includes several accessibility features:

- Screen reader support
- Keyboard navigation
- High contrast themes
- RTL support
- Customizable hotkeys
- ARIA attributes

## Troubleshooting

Common issues and solutions:

1. Toasts not appearing:
   - Check if the Toast component is mounted
   - Verify the ToastService is properly imported
   - Check for console errors

2. Styling issues:
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Verify theme settings

3. Multiple toasts:
   - Use `visibleToasts` prop to control maximum visible toasts
   - Check for duplicate toast calls
   - Use unique IDs for important toasts 