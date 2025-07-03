import { SidebarInset } from "@/Core";
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-xl" {...props}>
            {children}
        </main>
    );
}





















