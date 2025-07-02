import React, { ReactNode } from 'react';
import { AppShell } from '../components/app-shell';
import { AppSidebar } from '../components/app-sidebar';
import { AppSidebarHeader } from '../components/app-sidebar-header';
import { Sidebar, SidebarInset } from '../components/ui/sidebar';
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

export default function AppLayout({ children, title, breadcrumbs, requiredPermission }: AppLayoutProps) {
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
                <AppSidebar />
                <SidebarInset>
                    {translatedTitle && <Head title={translatedTitle} />}
                    <AppSidebarHeader breadcrumbs={translatedBreadcrumbs} />
                    <main className="flex-1 p-6 bg-gray-50">
                        {children}
                    </main>
                </SidebarInset>
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




















