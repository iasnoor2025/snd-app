import React, { ReactNode } from 'react';
import { AppShell } from '../components/app-shell';
import { AppSidebar } from '../components/app-sidebar';
import { AppSidebarHeader } from '../components/app-sidebar-header';
import { Sidebar } from '../components/ui/sidebar';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import type { BreadcrumbItem } from '../types';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    requiredPermission?: string;
}

function AppLayout({ children, title, breadcrumbs, requiredPermission }: AppLayoutProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const translatedTitle = title ? t(title) : undefined;
    const translatedBreadcrumbs = breadcrumbs?.map(item => ({
        ...item,
        title: t(item.title)
    }));

    console.log('AppLayout - Rendering with title:', translatedTitle); // Debug log

    return (
        <>
            <AppShell variant="sidebar">
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                        {translatedTitle && <Head title={translatedTitle} />}
                        <AppSidebarHeader breadcrumbs={translatedBreadcrumbs} />
                        <main className="flex-1 p-6 bg-gray-50">
                            {children}
                        </main>
                    </div>
                </div>
            </AppShell>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                expand={false}
                richColors
                closeButton
                theme="system"
            />
        </>
    );
}

export default AppLayout;
export { AppLayout };




















