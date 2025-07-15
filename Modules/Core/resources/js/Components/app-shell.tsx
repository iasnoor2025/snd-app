import { usePage } from '@inertiajs/react';
import { SharedData } from '../types';
import { SidebarProvider } from './ui/sidebar';
// PWAWrapper component placeholder
const PWAWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

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
        <SidebarProvider defaultOpen={true}>
            <PWAWrapper>{children}</PWAWrapper>
        </SidebarProvider>
    );
}
