import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Icon } from '../icon';

// Sidebar Context
interface SidebarContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}
const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

// Sidebar Provider
export function SidebarProvider({ defaultOpen = true, children }: { defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// Sidebar Root
export function Sidebar({ collapsible = false, className = '', children }: { collapsible?: boolean | 'icon'; className?: string; children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <aside
      data-collapsible={collapsible ? (typeof collapsible === 'string' ? collapsible : 'true') : undefined}
      data-open={open}
      className={cn(
        'sidebar-wrapper group/sidebar-wrapper flex flex-col transition-all duration-300 bg-white border-r min-w-[64px]',
        !open && collapsible ? 'w-16' : 'w-64',
        className
      )}
    >
      {children}
    </aside>
  );
}

// Sidebar Trigger (toggle button)
export function SidebarTrigger({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle, open } = useSidebar();
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      onClick={toggle}
      className={cn('sidebar-trigger', className)}
      {...props}
    >
      <Icon name="layout-grid" className={open ? '' : 'rotate-180'} />
    </Button>
  );
}

// Sidebar Header
export function SidebarHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('sidebar-header', className)}>{children}</div>;
}

// Sidebar Content
export function SidebarContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('sidebar-content flex-1 overflow-y-auto', className)}>{children}</div>;
}

// Sidebar Footer
export function SidebarFooter({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('sidebar-footer', className)}>{children}</div>;
}

// Sidebar Menu
export function SidebarMenu({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn('sidebar-menu flex flex-col gap-1', className)}>{children}</ul>;
}

// Sidebar Menu Item
export function SidebarMenuItem({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <li className={cn('sidebar-menu-item', className)}>{children}</li>;
}

// Sidebar Menu Button
export function SidebarMenuButton({ className = '', asChild = false, size = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; size?: 'default' | 'lg' | 'sm' | 'icon' }) {
  return (
    <Button type="button" size={size} variant="ghost" className={cn('sidebar-menu-button w-full justify-start', className)} {...props} />
  );
}

// Sidebar Menu Sub (for nested menus)
export function SidebarMenuSub({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn('sidebar-menu-sub pl-4', className)}>{children}</ul>;
}

// Sidebar Menu Sub Item
export function SidebarMenuSubItem({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <li className={cn('sidebar-menu-sub-item', className)}>{children}</li>;
}

// Sidebar Menu Sub Button
export function SidebarMenuSubButton({ className = '', asChild = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  return (
    <Button type="button" size="sm" variant="ghost" className={cn('sidebar-menu-sub-button w-full justify-start', className)} {...props} />
  );
}

// Sidebar Group
export function SidebarGroup({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('sidebar-group', className)}>{children}</div>;
}

// Sidebar Group Label
export function SidebarGroupLabel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('sidebar-group-label px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}>{children}</div>;
}

// Sidebar context hook
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
