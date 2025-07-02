import { SidebarProvider } from './ui/sidebar';
import { SharedData } from '../types';
import { usePage } from '@inertiajs/react';
// PWAWrapper component placeholder
const PWAWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    console.log('AppShell - Sidebar open state:', isOpen); // Debug log
    console.log('AppShell - Variant:', variant); // Debug log

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























