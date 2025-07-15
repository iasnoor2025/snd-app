// Core Module - Shared Types Index
// Export all shared TypeScript types and interfaces for reuse across modules

// Available types
export * from './models';

// Re-export common external types
export type { ComponentProps, FC, PropsWithChildren, ReactNode } from 'react';

// Export any other type files that might exist
// (This will be updated as more types are added)

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface SharedData {
    sidebarOpen: boolean;
}
