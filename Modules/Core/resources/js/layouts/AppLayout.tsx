import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { AppShell } from '../Components/app-shell';
import { AppSidebar } from '../Components/app-sidebar';
import { AppSidebarHeader } from '../Components/app-sidebar-header';
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
    const translatedBreadcrumbs = breadcrumbs?.map((item) => ({
        ...item,
        title: t(item.title),
    }));

    return (
        <>
            <AppShell variant="sidebar">
                {translatedTitle && <Head title={translatedTitle} />}
                <div className="flex h-screen">
                    <AppSidebar />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <AppSidebarHeader breadcrumbs={translatedBreadcrumbs} />
                        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
                    </div>
                </div>
            </AppShell>

            {/* Toast notifications */}
            <Toaster position="top-right" expand={false} richColors closeButton theme="system" />
        </>
    );
}

export default AppLayout;
export { AppLayout };
