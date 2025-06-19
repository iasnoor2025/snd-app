// Core Module - Shared Layouts Index
// Export all shared layout components for reuse across modules

export { default as AppLayout } from './app-layout';
export { default as AuthLayout } from './auth-layout';
export { default as AuthenticatedLayout } from './AuthenticatedLayout';
export { default as GuestLayout } from './GuestLayout';
export { default as AdminLayout } from './AdminLayout';

// Export sub-directory layouts
export * from './app';
export * from './auth';
export * from './settings'; 


