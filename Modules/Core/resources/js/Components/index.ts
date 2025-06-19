// Core Module - Shared Components Index
// Export all shared UI components for reuse across modules

// Layout Components
export { default as AuthenticatedLayout } from './AuthenticatedLayout';
export { default as GuestLayout } from './GuestLayout';
export { default as AdminLayout } from '../layouts/AdminLayout';

// Navigation Components
export { default as AppSidebar } from './app-sidebar';
export { default as AppHeader } from './app-header';
export { default as NavMain } from './nav-main';
export { default as NavUser } from './nav-user';
export { default as NavFooter } from './nav-footer';
export { default as Breadcrumbs } from './breadcrumbs';

// UI Components
export { default as ApplicationLogo } from './ApplicationLogo';
export { default as Modal } from './Modal';
export { default as Dropdown } from './Dropdown';
export { default as ThemeProvider } from './theme-provider';

// Form Components
export { default as TextInput } from './TextInput';
export { default as InputLabel } from './InputLabel';
export { default as InputError } from './InputError';
export { default as Checkbox } from './Checkbox';
export { default as TranslatableField } from './TranslatableField';
export { default as ValidationErrors } from './ValidationErrors';

// Button Components
export { default as PrimaryButton } from './PrimaryButton';
export { default as SecondaryButton } from './SecondaryButton';
export { default as DangerButton } from './DangerButton';

// User Components
export { default as UserMenuContent } from './user-menu-content';
export { default as UserInfo } from './user-info';
export { default as DeleteUser } from './delete-user';

// Avatar Components - AvatarShowcase removed

// Utility Components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as Permission } from './Permission';
export { default as LanguageSwitcher } from './LanguageSwitcher';

// Appearance Components
export { default as AppearanceDropdown } from './appearance-dropdown';
export { default as AppearanceTabs } from './appearance-tabs';

// Export all UI components
export * from './ui';

// Export all shared components
export * from './shared';


