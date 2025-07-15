import { type NavItem } from '../types';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from './ui/sidebar';

import { usePermission } from '../hooks/usePermission';
import AppLogo from './app-logo';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Map module names to their respective icon, route, and required permission
const moduleMap: Record<string, { icon: string; route: string; permission: string }> = {
    Dashboard: { icon: 'home', route: '/dashboard', permission: 'dashboard.view' },
    Users: { icon: 'users', route: '/users', permission: 'users.view' },
    Roles: { icon: 'shield', route: '/roles', permission: 'roles.view' },
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
    API: { icon: 'file-digit', route: '/api', permission: 'api.view' },
    SafetyManagement: { icon: 'alert-triangle', route: '/safety/incidents', permission: 'incidents.view' },
};

// Map module keys to human-friendly display names
const moduleDisplayNames: Record<string, string> = {
    Dashboard: 'Dashboard',
    Users: 'Users',
    Roles: 'Roles',
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
    SafetyManagement: 'Safety Management',
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
                setModules(enabledModules);
            })
            .catch((err) => {
                console.error('Error fetching modules_statuses.json:', err);
            });
    }, []);

    // Build navigation items from enabled modules and user permissions
    const navigationItems: NavItem[] = modules
        .filter((module) => {
            if (isAdmin) return true; // Admin sees all enabled modules
            const perm = moduleMap[module]?.permission;
            const allowed = !perm || hasPermission(perm);
            return allowed;
        })
        .map((module) => ({
            title: module.replace(/([A-Z])/g, ' $1').trim(),
            href: moduleMap[module].route,
            icon: moduleMap[module].icon,
            permission: moduleMap[module].permission,
        }));

    return (
        <Sidebar collapsible="icon" className="border-r bg-white">
            <SidebarHeader className="flex items-center gap-2 border-b p-4">
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
