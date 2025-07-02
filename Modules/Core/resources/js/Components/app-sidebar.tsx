import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { type NavItem } from '../types';

import AppLogo from './app-logo';
import { usePermission } from '../hooks/usePermission';

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
    LeaveManagement: { icon: 'clipboard-list', route: '/leaves', permission: 'leave-requests.view' },
    TimesheetManagement: { icon: 'clock', route: '/timesheets', permission: 'timesheets.view' },
    PayrollManagenent: { icon: 'dollar-sign', route: '/payroll-managenent', permission: 'payroll-managenent.view' },
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
    const { hasPermission, hasRole } = usePermission();
    const [moduleItems, setModuleItems] = useState<NavItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t, i18n } = useTranslation(['common']);

    // Get auth data from global window object as fallback
    const auth = (window as any)?.authData || null;

    // Determine if the current language is RTL
    const isRTL = i18n.dir() === 'rtl';

    // Check if user is admin directly from auth data - simplified for testing
    const isAdmin = true; // Temporarily set to true for testing

    // Check if user is a customer
    const isCustomer = auth?.user && 'is_customer' in auth.user
        ? auth.user.is_customer
        : false;

    // Permission-based sidebar logic
    useEffect(() => {
        console.log('Setting up sidebar items...'); // Debug log

        const items: NavItem[] = [];

        // Add Dashboard as first item
        items.push({
            title: 'Dashboard',
            href: '/dashboard',
            icon: 'layout-grid',
        });

        // Add core modules - simplified approach for testing
        items.push({
            title: 'Employees',
            href: '/employees',
            icon: 'user-cog',
        });

        items.push({
            title: 'Rentals',
            href: '/rentals',
            icon: 'calendar',
        });

        items.push({
            title: 'Projects',
            href: '/projects',
            icon: 'briefcase',
        });

        items.push({
            title: 'Equipment',
            href: '/equipment',
            icon: 'truck',
        });

        items.push({
            title: 'Customers',
            href: '/customers',
            icon: 'users',
        });

        items.push({
            title: 'Timesheets',
            href: '/timesheets',
            icon: 'clock',
        });

        items.push({
            title: 'Leave Management',
            href: '/leaves',
            icon: 'clipboard-list',
        });

        items.push({
            title: 'Reporting',
            href: '/reporting',
            icon: 'bar-chart',
        });

        items.push({
            title: 'Settings',
            href: '/settings',
            icon: 'settings',
        });

        // Add Users for admins
        if (isAdmin) {
            items.push({
                title: 'Users',
                href: '/users',
                icon: 'users',
            });
            items.push({
                title: 'Roles',
                href: '/roles',
                icon: 'shield',
            });
        }

        console.log('Setting sidebar items:', items); // Debug log
        console.log('Items count:', items.length); // Debug log

        setModuleItems(items);
        setIsLoading(false);
    }, [isAdmin, hasPermission, t]);

    console.log('Rendering sidebar with items:', moduleItems); // Debug log
    console.log('Is loading:', isLoading); // Debug log

    return (
        <Sidebar side={isRTL ? "right" : "left"}>
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























