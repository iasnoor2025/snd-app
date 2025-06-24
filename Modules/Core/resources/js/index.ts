// Core Module - Root Index
// Export all shared functionality for reuse across modules

// Services
export { ToastService } from './services/ToastService';
export type { ToastOptions } from './services/ToastService';
export { toast } from './services/ToastService';

// Export other services and components as needed
export * from './services/pushNotificationService';
export * from './services/avatar-service';

// Components
export * from './components/ui/toast';
export * from './components/Common/Toast';

// Core Module - Shared Resources Index
// This file exports all shared resources for use by other modules

// Export all shared hooks
export * from './hooks';

// Export all shared utilities
export * from './utils';

// Export all shared types
export * from './types';

// Export all shared services
export * from './services';

// Export all shared libraries
export * from './lib';

// Re-export commonly used external libraries for consistency
export { 
  createRoot 
} from 'react-dom/client';

export { 
  createInertiaApp,
  router
} from '@inertiajs/react';

export { 
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

export {
  useTranslation,
  I18nextProvider
} from 'react-i18next';

// Export theme and UI providers
export {
  ThemeProvider,
  useTheme
} from './components/theme-provider';

export {
  TooltipProvider
} from './components/ui/tooltip';

// Export common form libraries
export {
  useForm,
  Controller
} from 'react-hook-form';

export {
  zodResolver
} from '@hookform/resolvers/zod';

export * as z from 'zod'; 

// Export UI components
export * from './components/ui';

// Export layouts
export { default as AppLayout } from './layouts/AppLayout';

// Export utilities
export { formatCurrency, t } from './utils';

// Export types
export type { BreadcrumbItem } from './types';

// Export components
export {
  ApplicationLogo,
  Modal,
  Dropdown,
  TextInput,
  InputLabel,
  InputError,
  Checkbox,
  TranslatableField,
  TranslatableText,
  ValidationErrors,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  UserMenuContent,
  UserInfo,
  DeleteUser,
  ErrorBoundary,
  Permission,
  LanguageSwitcher,
  AppearanceDropdown,
  AppearanceTabs,
  AppSidebar,
  AppHeader,
  NavMain,
  NavUser,
  NavFooter,
  Breadcrumbs,
  NavLink,
  ResponsiveNavLink,
  HeadingSmall,
  Heading,
  CreateButton,
  CrudButtons,
  ToastManager,
  LoadingSpinner,
  PaymentForm,
  MaintenanceRecordList
} from './components';

// Export translation debug utilities
export {
  isTranslatableObject,
  safeRender,
  debugTranslationObject,
  withTranslationDebug
} from './utils/debugTranslation';


