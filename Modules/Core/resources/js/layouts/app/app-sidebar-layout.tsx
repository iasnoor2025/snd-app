import { AppContent } from '@/Modules/Core/resources/js/components/app-content';
import { AppShell } from '@/Modules/Core/resources/js/components/app-shell';
import { AppSidebar } from '@/Modules/Core/resources/js/components/app-sidebar';
import { AppSidebarHeader } from '@/Modules/Core/resources/js/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}




















