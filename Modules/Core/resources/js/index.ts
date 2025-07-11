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
  createInertiaApp
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

// Export new Dashboard page
export { default as Dashboard } from './pages/Dashboard';

// Export new Dashboard widgets
export { default as StatsCard } from './components/dashboard/StatsCard';
export { default as ChartWidget } from './components/dashboard/ChartWidget';
export { default as ActivityFeed } from './components/dashboard/ActivityFeed';
export { default as TeamWidget } from './components/dashboard/TeamWidget';
export { default as RecentProjects } from './components/dashboard/RecentProjects';
export { default as EmployeeWidget } from './components/dashboard/EmployeeWidget';
export { default as RentalWidget } from './components/dashboard/RentalWidget';
export { default as VacationWidget } from './components/dashboard/VacationWidget';
export { default as PayrollWidget } from './components/dashboard/PayrollWidget';
export { default as EquipmentWidget } from './components/dashboard/EquipmentWidget';
export { default as AnalyticsWidget } from './components/dashboard/AnalyticsWidget';
export { default as AuditWidget } from './components/dashboard/AuditWidget';
export { default as ProjectWidget } from './components/dashboard/ProjectWidget';
export { default as CustomerWidget } from './components/dashboard/CustomerWidget';


