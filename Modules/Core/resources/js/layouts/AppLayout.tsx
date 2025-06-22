import { AppShell } from '../components/app-shell';
import { AppSidebar } from '../components/app-sidebar';
import { AppSidebarHeader } from '../components/app-sidebar-header';
import { Sidebar, SidebarInset } from '../components/ui/sidebar';
import { type ReactNode, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

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
    const { i18n, t } = useTranslation(['common']);
    const isRTL = i18n.dir() === 'rtl';

    // Update document direction based on language
    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;

        // Add RTL class for Arabic
        if (isRTL) {
            document.documentElement.classList.add('rtl');
        } else {
            document.documentElement.classList.remove('rtl');
        }
    }, [isRTL, i18n.language]);

    // Translate title if provided
    const translatedTitle = title ? t(title) : undefined;

    // Translate breadcrumbs
    const translatedBreadcrumbs = breadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        title: t(breadcrumb.title)
    }));

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="offcanvas" className="bg-white border-r border-gray-200" side={isRTL ? "right" : "left"}>
                <AppSidebar />
            </Sidebar>
            <SidebarInset className="min-h-screen bg-gray-50">
                {translatedTitle && <Head title={translatedTitle} />}
                <AppSidebarHeader breadcrumbs={translatedBreadcrumbs} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </AppShell>
    );
}




















