import * as React from 'react';
import { cn } from '../../lib/utils';

const SidebarContext = React.createContext<{ collapsible?: string }>({});

export function Sidebar({ children, collapsible = 'icon', className, ...props }: React.HTMLAttributes<HTMLDivElement> & { collapsible?: string }) {
    return (
        <SidebarContext.Provider value={{ collapsible }}>
            <aside
                data-collapsible={collapsible}
                className={cn('group/sidebar-wrapper flex h-full flex-col transition-[width] ease-linear', className)}
                {...props}
            >
                {children}
            </aside>
        </SidebarContext.Provider>
    );
}

export function SidebarHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex-1 overflow-y-auto', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarMenu({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul className={cn('flex flex-col gap-1', className)} {...props}>
            {children}
        </ul>
    );
}

export function SidebarMenuItem({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
    return (
        <li className={cn('flex', className)} {...props}>
            {children}
        </li>
    );
}

export function SidebarMenuButton({
    children,
    className,
    size = 'md',
    asChild = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg'; asChild?: boolean }) {
    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-3 text-lg',
    };
    const Comp = asChild ? (props as any).asChild : 'button';
    return (
        <Comp
            className={cn(
                'flex w-full items-center gap-2 rounded transition-colors hover:bg-accent focus:ring-2 focus:ring-primary focus:outline-none',
                sizes[size],
                className,
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            aria-label="Toggle sidebar"
            className={cn(
                'inline-flex items-center justify-center rounded p-2 text-muted-foreground hover:bg-accent focus:ring-2 focus:ring-primary focus:outline-none',
                className,
            )}
            {...props}
        >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    );
}

// Optional: SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton for advanced nav
export function SidebarGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarGroupLabel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('px-3 py-1 text-xs font-semibold text-muted-foreground uppercase', className)} {...props}>
            {children}
        </div>
    );
}

export function SidebarMenuSub({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul className={cn('ml-4 flex flex-col gap-1 border-l pl-2', className)} {...props}>
            {children}
        </ul>
    );
}

export function SidebarMenuSubItem({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
    return (
        <li className={cn('flex', className)} {...props}>
            {children}
        </li>
    );
}

export function SidebarMenuSubButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex w-full items-center gap-2 rounded px-3 py-2 text-base transition-colors hover:bg-accent focus:ring-2 focus:ring-primary focus:outline-none',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
    // Placeholder for context logic if needed
    return <>{children}</>;
}
