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
import AppLayoutComponent from './layouts/AppLayout';
export { AppLayoutComponent as AppLayout };

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
  ToastService,
  LoadingSpinner,
  PaymentForm,
  MaintenanceRecordList
} from './components';


