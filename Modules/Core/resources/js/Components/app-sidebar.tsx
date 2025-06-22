import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { type NavItem } from '../types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import { usePermission } from '../hooks/usePermission';
import type { PageProps } from '../types';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from "./ui/button";

// Map module names to their respective icon, route, and required permission
const moduleMap: Record<string, { icon: string; route: string; permission: string; subItems?: Array<{ title: string; route: string; permission: string }> }> = {
    Core: { icon: 'network', route: '/core', permission: 'core.view' },
    EmployeeManagement: {
        icon: 'user-cog',
        route: '/employees',
        permission: 'employees.view',
        subItems: [
            { title: 'Employees', route: '/employees', permission: 'employees.view' },
            { title: 'Salary Increments', route: '/salary-increments', permission: 'salary-increments.view' }
        ]
    },
    LeaveManagement: { icon: 'clipboard-list', route: '/leave-requests', permission: 'leave-requests.view' },
    TimesheetManagement: { icon: 'clock', route: '/timesheets', permission: 'timesheets.view' },
    Payroll: { icon: 'dollar-sign', route: '/payrolls', permission: 'payroll.view' },
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
    Payroll: 'Payroll',
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
};

export function AppSidebar() {
    const { hasPermission, hasRole } = usePermission();
    const pageProps = usePage<PageProps>().props;
    const auth = pageProps?.auth || { user: null };
    const [moduleItems, setModuleItems] = useState<NavItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation(['common']);

    // Check if user is admin directly from auth data
    const isAdmin = auth?.user && 'roles' in auth.user && auth.user.roles
        ? auth.user.roles.some((role: any) =>
            (typeof role === 'string' && role === 'admin') ||
            (typeof role === 'object' && role.name === 'admin')
        )
        : false;

    // Check if user is a customer
    const isCustomer = auth?.user && 'is_customer' in auth.user
        ? auth.user.is_customer
        : false;

    // Permission-based sidebar logic
    useEffect(() => {
        const items: NavItem[] = [];
        // Add Dashboard as first item
        items.push({
            title: t('dashboard'),
            href: '/dashboard',
            icon: 'layout-grid',
        });
        // Add Users and Roles for admins
        if (isAdmin) {
            items.push({
                title: t('users'),
                href: '/settings/users',
                icon: 'users',
            });
            items.push({
                title: t('navigation.roles'),
                href: '/settings/roles',
                icon: 'shield',
            });
        }
        // Get permissions from auth
        const permissions: string[] = (auth?.permissions || []);
        // Admins see all modules
        if (isAdmin) {
            Object.entries(moduleMap).forEach(([module, mapInfo]) => {
                const navItem: NavItem = {
                    title: t(`modules.${module}`),
                    href: mapInfo.route.startsWith('/') ? mapInfo.route : route(mapInfo.route),
                    icon: mapInfo.icon,
                };

                // Add sub-items if they exist
                if (mapInfo.subItems) {
                    navItem.items = mapInfo.subItems.map(subItem => ({
                        title: t(`${module.toLowerCase()}.${subItem.title.toLowerCase().replace(' ', '_')}`),
                        href: subItem.route,
                    }));
                }

                items.push(navItem);
            });
        } else {
            Object.entries(moduleMap).forEach(([module, mapInfo]) => {
                if (permissions.includes(mapInfo.permission)) {
                    const navItem: NavItem = {
                        title: t(`modules.${module}`),
                        href: mapInfo.route.startsWith('/') ? mapInfo.route : route(mapInfo.route),
                        icon: mapInfo.icon,
                    };

                    // Add sub-items if they exist and user has permission
                    if (mapInfo.subItems) {
                        const allowedSubItems = mapInfo.subItems.filter(subItem =>
                            isAdmin || permissions.includes(subItem.permission)
                        );
                        if (allowedSubItems.length > 0) {
                            navItem.items = allowedSubItems.map(subItem => ({
                                title: t(`${module.toLowerCase()}.${subItem.title.toLowerCase().replace(' ', '_')}`),
                                href: subItem.route,
                            }));
                        }
                    }

                    items.push(navItem);
                }
            });
        }
        setModuleItems(items);
        setIsLoading(false);
    }, [isAdmin, auth?.permissions]);

    // Add Customer Portal link for customers
    useEffect(() => {
        if (isCustomer && !isLoading) {
            setModuleItems(prev => [
                ...prev,
                {
                    title: 'Customer Portal',
                    href: route('customer.dashboard'),
                    icon: 'user',
                }
            ]);
        }
    }, [isCustomer, isLoading]);

    return (
        <Sidebar>
            <SidebarHeader>
                <AppLogo />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={moduleItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
                {/* <NavFooter items={[
                    {
                        title: 'Documentation',
                        href: '/docs',
                        icon: 'book-open'
                    },
                    {
                        title: 'Support',
                        href: '/support',
                        icon: 'help-circle'
                    }
                ]} /> */}
            </SidebarFooter>
        </Sidebar>
    );
}

// Default export for compatibility with index.ts
export default AppSidebar;























