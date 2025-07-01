// Core Module - Shared Layouts Index
// Export all shared layout components for reuse across modules

// Export the main application layout
export { default as AppLayout } from './AppLayout';

// Export auth-related layouts
export { default as AuthLayout } from './auth-layout';
export { default as AuthenticatedLayout } from './AuthenticatedLayout';
export { default as GuestLayout } from './GuestLayout';

// Export sub-directory layouts
export * from './app';
export * from './auth';
export * from './settings';


