import { AppContent } from '@/Modules/Core/resources/js/components/app-content';
import { AppHeader } from '@/Modules/Core/resources/js/components/app-header';
import { AppShell } from '@/Modules/Core/resources/js/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}




















