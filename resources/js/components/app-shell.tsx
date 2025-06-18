import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import PWAWrapper from '@/components/PWA/PWAWrapper';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <PWAWrapper>{children}</PWAWrapper>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            <PWAWrapper>{children}</PWAWrapper>
        </SidebarProvider>
    );
}


