// Core Module - Root Index
// Export all shared functionality for reuse across modules

// Services
export { ToastService, toast } from './services/ToastService';
export type { ToastOptions } from './services/ToastService';

// Export other services and components as needed
export * from './services/avatar-service';
export * from './services/pushNotificationService';

// Components
export * from './components/ui/toast';
export { DialogClose } from './components/ui/dialog';
export { FileUpload } from './components/ui/FileUpload';

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
export { createRoot } from 'react-dom/client';

export { createInertiaApp } from '@inertiajs/react';

export { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export { I18nextProvider, useTranslation } from 'react-i18next';

// Export theme and UI providers
export { ThemeProvider, useTheme } from './components/theme-provider';

export { TooltipProvider } from './components/ui/tooltip';

// Export common form libraries
export { Controller, useForm } from 'react-hook-form';

export { zodResolver } from '@hookform/resolvers/zod';

export * as z from 'zod';

// Export UI components
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
export * from './components/ui';
export { Progress, Switch, Toggle, TimePicker, ErrorAlert, Pagination, ToggleGroup, ToggleGroupItem, DialogFooter } from './components/ui';

// Export layouts
export { default as AppLayout } from './layouts/AppLayout';

// Export utilities
export { formatCurrency, t } from './utils';

// Export types
export type { BreadcrumbItem } from './types';

// Export components
export {
    AppHeader,
    AppSidebar,
    AppearanceDropdown,
    AppearanceTabs,
    ApplicationLogo,
    Breadcrumbs,
    Checkbox,
    CreateButton,
    CrudButtons,
    DangerButton,
    DeleteUser,
    Dropdown,
    ErrorBoundary,
    Heading,
    HeadingSmall,
    InputError,
    InputLabel,
    LanguageSwitcher,
    LoadingSpinner,
    MaintenanceRecordList,
    Modal,
    NavFooter,
    NavLink,
    NavMain,
    NavUser,
    PaymentForm,
    Permission,
    PrimaryButton,
    ResponsiveNavLink,
    SecondaryButton,
    TextInput,
    ToastManager,
    TranslatableField,
    TranslatableText,
    UserInfo,
    UserMenuContent,
    ValidationErrors,
} from './components';

// Export translation debug utilities
export { debugTranslationObject, isTranslatableObject, safeRender, withTranslationDebug } from './utils/debugTranslation';

// Export new Dashboard page
export { default as Dashboard } from './pages/Dashboard';

// Export new Dashboard widgets
export { default as ActivityFeed } from './components/dashboard/ActivityFeed';
export { default as AnalyticsWidget } from './components/dashboard/AnalyticsWidget';
export { default as AuditWidget } from './components/dashboard/AuditWidget';
export { default as ChartWidget } from './components/dashboard/ChartWidget';
export { default as CustomerWidget } from './components/dashboard/CustomerWidget';
export { default as EmployeeWidget } from './components/dashboard/EmployeeWidget';
export { default as EquipmentWidget } from './components/dashboard/EquipmentWidget';
export { default as PayrollWidget } from './components/dashboard/PayrollWidget';
export { default as ProjectWidget } from './components/dashboard/ProjectWidget';
export { default as RecentProjects } from './components/dashboard/RecentProjects';
export { default as RentalWidget } from './components/dashboard/RentalWidget';
export { default as StatsCard } from './components/dashboard/StatsCard';
export { default as TeamWidget } from './components/dashboard/TeamWidget';
export { default as VacationWidget } from './components/dashboard/VacationWidget';
