import { type NavItem } from '../types';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from './ui/sidebar';

import { usePermission } from '../hooks/usePermission';
import AppLogo from './app-logo';

import { useEffect, useState, useCallback } from 'react';
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
    SalaryIncrement: { icon: 'trending-up', route: '/salary-increments', permission: 'salary-increments.view' },
};

// Map module keys to human-friendly display names
const moduleDisplayNames: Record<string, string> = {
    Dashboard: 'Dashboard',
    Users: 'Users',
    Roles: 'Roles',
    Core: 'Core',
    EmployeeManagement: 'Employee Management',
    SalaryIncrement: 'Salary Increments',
    LeaveManagement: 'Leave Management',
    PayrollManagement: 'Payroll Management',
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
    SafetyManagement: 'Safety Management',
};

export function AppSidebar() {
    const { i18n } = useTranslation(['common']);
    const { hasPermission, isAdmin, user } = usePermission();
    const [modules, setModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchModules = useCallback(async (useApi = false) => {
        try {
            setLoading(true);
            setError(null);

            let data;

            if (useApi) {
                // Use API endpoint for immediate updates
                const response = await fetch('/api/v1/modules/refresh-status', {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                data = result.data;
            } else {
                // Use static file for initial load
                const response = await fetch('/modules_statuses.json', {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                data = await response.json();
            }

            const enabledModules = Object.entries(data)
                .filter(([_, enabled]) => enabled)
                .map(([module]) => module)
                .filter((module) => moduleMap[module]);

            setModules(enabledModules);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Error fetching modules status:', err);
            setError(err instanceof Error ? err.message : 'Failed to load modules');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules(false); // Initial load from static file

        // Set up periodic refresh every 30 seconds using API
        const interval = setInterval(() => fetchModules(true), 30000);

        return () => clearInterval(interval);
    }, [fetchModules]);

    // Build navigation items from enabled modules and user permissions
    const navigationItems: NavItem[] = modules
        .filter((module) => {
            if (isAdmin) return true; // Admin sees all enabled modules
            const perm = moduleMap[module]?.permission;
            const allowed = !perm || hasPermission(perm);
            return allowed;
        })
        .map((module) => ({
            title: moduleDisplayNames[module] || module.replace(/([A-Z])/g, ' $1').trim(),
            href: moduleMap[module].route,
            icon: moduleMap[module].icon,
            permission: moduleMap[module].permission,
        }));

    // Add salary increment as a separate menu item
    const salaryIncrementItem: NavItem = {
        title: 'Salary Increments',
        href: '/salary-increments',
        icon: 'trending-up',
        permission: 'salary-increments.view',
    };

    // Add salary increment to navigation items if user has permission
    const finalNavigationItems = [...navigationItems];
    if (isAdmin || hasPermission('salary-increments.view')) {
        finalNavigationItems.push(salaryIncrementItem);
    }

    // Add refresh button to header
    const handleRefresh = () => {
        fetchModules(true); // Use API for manual refresh
    };

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
                <button
                    onClick={handleRefresh}
                    className="ml-auto text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    title={`Refresh modules${lastRefresh ? ` (Last: ${lastRefresh.toLocaleTimeString()})` : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    ) : (
                        '↻'
                    )}
                </button>
            </SidebarHeader>
            <SidebarContent className="flex-1">
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <NavMain items={finalNavigationItems} />
                )}
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

// Default export for compatibility with index.ts
export default AppSidebar;
