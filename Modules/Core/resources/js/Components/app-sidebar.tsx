import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from './ui/sidebar';
import { type NavItem } from '../types';

import AppLogo from './app-logo';
import { usePermission } from '../hooks/usePermission';

import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from "./ui/button";
import { Icon } from "./icon";

// Map module names to their respective icon, route, and required permission
const moduleMap: Record<string, { icon: string; route: string; permission: string }> = {
    Core: { icon: 'network', route: '/core', permission: 'core.view' },
    EmployeeManagement: { icon: 'user-cog', route: '/employees', permission: 'employees.view' },
    LeaveManagement: { icon: 'clipboard-list', route: '/leaves', permission: 'leave-requests.view' },
    TimesheetManagement: { icon: 'clock', route: '/timesheets', permission: 'timesheets.view' },
    PayrollManagement: { icon: 'dollar-sign', route: '/payroll', permission: 'payroll.view' },
    ProjectManagement: { icon: 'briefcase', route: '/projects', permission: 'projects.view' },
    RentalManagement: { icon: 'calendar', route: '/rentals', permission: 'rentals.view' },
    EquipmentManagement: { icon: 'truck', route: '/equipment', permission: 'equipment.view' },
    Settings: { icon: 'settings', route: '/settings', permission: 'settings.view' },
    Notifications: { icon: 'bell', route: '/notifications', permission: 'notifications.view' },
    Reporting: { icon: 'bar-chart', route: '/reporting', permission: 'reports.view' },
    MobileBridge: { icon: 'smartphone', route: '/mobile-bridge', permission: 'mobile-bridge.view' },
    Localization: { icon: 'globe', route: '/localization', permission: 'localization.view' },
    CustomerManagement: { icon: 'users', route: '/customers', permission: 'customers.view' },
    AuditCompliance: { icon: 'folder-check', route: '/audit', permission: 'audit.view' },
    API: { icon: 'file-digit', route: '/api', permission: 'api.view' }
};

// Map module keys to human-friendly display names
const moduleDisplayNames: Record<string, string> = {
    Core: 'Core',
    EmployeeManagement: 'Employee Management',
    LeaveManagement: 'Leave Management',
    TimesheetManagement: 'Timesheet Management',
    ProjectManagement: 'Project Management',
    RentalManagement: 'Rental Management',
    EquipmentManagement: 'Equipment Management',
    Settings: 'Settings',
    Notifications: 'Notifications',
    Reporting: 'Reporting',
    MobileBridge: 'Mobile Bridge',
    Localization: 'Localization',
    CustomerManagement: 'Customer Management',
    AuditCompliance: 'Audit & Compliance',
    API: 'API',
    PayrollManagenent: 'Payroll Managenent',
};

export function AppSidebar() {
    const { i18n } = useTranslation(['common']);
    const { hasPermission, isAdmin, user } = usePermission();
    const [modules, setModules] = useState<string[]>([]);

    useEffect(() => {
        fetch('/modules_statuses.json')
            .then((res) => res.json())
            .then((data) => {
                const enabledModules = Object.entries(data)
                    .filter(([_, enabled]) => enabled)
                    .map(([module]) => module)
                    .filter((module) => moduleMap[module]);
                console.log('[Sidebar] Enabled modules from JSON:', enabledModules);
                setModules(enabledModules);
            })
            .catch((err) => {
                console.error('[Sidebar] Error fetching modules_statuses.json:', err);
            });
    }, []);

    // Build navigation items from enabled modules and user permissions
    const navigationItems: NavItem[] = modules
        .filter((module) => {
            if (isAdmin) return true; // Admin sees all enabled modules
            const perm = moduleMap[module]?.permission;
            const allowed = !perm || hasPermission(perm);
            console.log(`[Sidebar] Module: ${module}, Permission: ${perm}, Allowed: ${allowed}, isAdmin: ${isAdmin}`);
            return allowed;
        })
        .map((module) => ({
            title: module.replace(/([A-Z])/g, ' $1').trim(),
            href: moduleMap[module].route,
            icon: moduleMap[module].icon,
            permission: moduleMap[module].permission,
        }));

    console.log('[Sidebar] navigationItems:', navigationItems);
    console.log('[Sidebar] Current user:', user);

    return (
        <Sidebar collapsible="icon" className="bg-white border-r">
            <SidebarHeader className="border-b p-4 flex items-center gap-2">
                <SidebarTrigger className="mr-2" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="flex-1">
                <NavMain items={navigationItems} />
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

// Default export for compatibility with index.ts
export default AppSidebar;























