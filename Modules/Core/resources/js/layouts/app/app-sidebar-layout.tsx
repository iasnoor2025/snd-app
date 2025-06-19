import { AppContent } from '@/Modules/Core/resources/js/components/app-content';
import { AppShell } from '@/Modules/Core/resources/js/components/app-shell';
import { AppSidebar } from '@/Modules/Core/resources/js/components/app-sidebar';
import { AppSidebarHeader } from '@/Modules/Core/resources/js/components/app-sidebar-header';
import { Sidebar, SidebarInset } from '@/Modules/Core/resources/js/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="offcanvas" className="bg-white border-r border-gray-200">
                <AppSidebar />
            </Sidebar>
            <SidebarInset className="min-h-screen">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 flex flex-col p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </AppShell>
    );
}




















