import { AppShell } from '../components/app-shell';
import { AppSidebar } from '../components/app-sidebar';
import { AppSidebarHeader } from '../components/app-sidebar-header';
import { Sidebar, SidebarInset } from '../components/ui/sidebar';
import { type ReactNode } from 'react';
import { Head } from '@inertiajs/react';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    requiredPermission?: string;
}

export default function AppLayout({ children, title, breadcrumbs = [], requiredPermission }: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="offcanvas" className="bg-white border-r border-gray-200">
                <AppSidebar />
            </Sidebar>
            <SidebarInset className="min-h-screen bg-gray-50">
                {title && <Head title={title} />}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </AppShell>
    );
}




















