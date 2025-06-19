import { PlaceholderPattern } from '@/Modules/Core/resources/js/Components/ui/placeholder-pattern';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Modules/Core/resources/js/Components/ui/card';
import { Badge } from '@/Modules/Core/resources/js/Components/ui/badge';
import AppLayout from '@/Modules/Core/resources/js/layouts/app-layout';
import { type BreadcrumbItem, type NavItem } from '@/Modules/Core/resources/js/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { LayoutGrid, Folder, Users, Truck, FileText, DollarSign, Wrench, UserCog, Calendar,
    MapPin, BarChart, Settings, UserPlus, ClipboardList, Clock, Shield, FileCheck, Briefcase,
    History, ShoppingBag, User, FileDigit, Bell, Globe, Smartphone, FolderCheck, Network
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Map module names to icons and routes (same as in app-sidebar.tsx)
const moduleMap: Record<string, { icon: any; route: string; description: string }> = {
    Core: {
        icon: Network,
        route: '/core',
        description: 'Core system functionality and settings'
    },
    EmployeeManagement: {
        icon: UserCog,
        route: '/employees',
        description: 'Manage employees, roles and responsibilities'
    },
    LeaveManagement: {
        icon: ClipboardList,
        route: '/leave-requests',
        description: 'Track and approve leave requests'
    },
    TimesheetManagement: {
        icon: Clock,
        route: '/timesheets',
        description: 'Monitor time entries and approvals'
    },
    Payroll: {
        icon: DollarSign,
        route: '/payrolls',
        description: 'Process payroll and manage compensation'
    },
    ProjectManagement: {
        icon: Briefcase,
        route: '/projects',
        description: 'Manage projects, tasks and milestones'
    },
    RentalManagement: {
        icon: Calendar,
        route: '/rentals',
        description: 'Track equipment rentals and availability'
    },
    EquipmentManagement: {
        icon: Truck,
        route: '/equipment',
        description: 'Manage equipment inventory and maintenance'
    },
    Settings: {
        icon: Settings,
        route: '/settings',
        description: 'Configure system preferences and options'
    },
    Notifications: {
        icon: Bell,
        route: '/notifications',
        description: 'Manage system and user notifications'
    },
    Reporting: {
        icon: BarChart,
        route: '/reports',
        description: 'Generate and view business reports'
    },
    MobileBridge: {
        icon: Smartphone,
        route: '/mobile-bridge',
        description: 'Mobile app integration and connectivity'
    },
    Localization: {
        icon: Globe,
        route: '/localization',
        description: 'Manage languages and localizations'
    },
    CustomerManagement: {
        icon: Users,
        route: '/customers',
        description: 'Manage customer accounts and data'
    },
    AuditCompliance: {
        icon: FolderCheck,
        route: '/audit',
        description: 'Track compliance and system audits'
    },
    API: {
        icon: FileDigit,
        route: '/api',
        description: 'API integrations and management'
    }
};

export default function Dashboard() {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const isAdmin = user?.roles?.some((role: any) => role.name === 'admin');
    const isManager = user?.roles?.some((role: any) => role.name === 'manager');
    const isEmployee = user?.roles?.some((role: any) => role.name === 'employee');
    const isHR = user?.roles?.some((role: any) => role.name === 'hr');
    const isAccountant = user?.roles?.some((role: any) => role.name === 'accountant');
    const isTechnician = user?.roles?.some((role: any) => role.name === 'technician');

    const [moduleCards, setModuleCards] = useState<Array<{
        name: string;
        icon: any;
        route: string;
        description: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            customer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            hr: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            accountant: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            technician: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            supervisor: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const canAccessModule = (moduleName: string) => {
        // Admin can access everything
        if (isAdmin) return true;

        // Role-based module access
        const moduleAccess: Record<string, boolean> = {
            Core: isAdmin || isManager,
            EmployeeManagement: isAdmin || isManager || isHR,
            CustomerManagement: isAdmin || isManager || isEmployee,
            EquipmentManagement: isAdmin || isManager || isTechnician,
            RentalManagement: isAdmin || isManager || isEmployee,
            Payroll: isAdmin || isHR || isAccountant,
            ProjectManagement: isAdmin || isManager || isEmployee,
            TimesheetManagement: isAdmin || isManager || isEmployee,
            LeaveManagement: isAdmin || isManager || isHR || isEmployee,
            Reporting: isAdmin || isManager || isAccountant,
            Settings: isAdmin || isManager,
            Notifications: true, // Everyone can access notifications
            Localization: isAdmin,
            AuditCompliance: isAdmin || isManager,
            MobileBridge: true, // Everyone can access mobile features
            API: isAdmin,
        };

        return moduleAccess[moduleName] || false;
    };

    useEffect(() => {
        const fetchModules = async () => {
            try {
                let cards;
                if (isAdmin) {
                    // Admin: show all modules
                    cards = Object.entries(moduleMap)
                        .map(([module, mapInfo]) => ({
                            name: module.replace(/([A-Z])/g, ' $1').trim(),
                            icon: mapInfo.icon,
                            route: mapInfo.route,
                            description: mapInfo.description
                        }));
                } else {
                    // Role-based access: show only accessible modules
                    try {
                        const response = await fetch('/modules_statuses.json');
                        const data = await response.json();
                        cards = Object.entries(data)
                            .filter(([module, enabled]) => enabled && canAccessModule(module))
                            .map(([module, _]) => {
                                const mapInfo = moduleMap[module] || {
                                    icon: Folder,
                                    route: `/modules/${module.toLowerCase()}`,
                                    description: `${module.replace(/([A-Z])/g, ' $1').trim()} module`
                                };
                                return {
                                    name: module.replace(/([A-Z])/g, ' $1').trim(),
                                    icon: mapInfo.icon,
                                    route: mapInfo.route,
                                    description: mapInfo.description
                                };
                            });
                    } catch {
                        // Fallback: show modules based on role access only
                        cards = Object.entries(moduleMap)
                            .filter(([module]) => canAccessModule(module))
                            .map(([module, mapInfo]) => ({
                                name: module.replace(/([A-Z])/g, ' $1').trim(),
                                icon: mapInfo.icon,
                                route: mapInfo.route,
                                description: mapInfo.description
                            }));
                    }
                }
                setModuleCards(cards);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load modules:', error);
                setIsLoading(false);
            }
        };
        fetchModules();
    }, [isAdmin, isManager, isEmployee, isHR, isAccountant, isTechnician]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* User Welcome Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-2">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {user?.email}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user?.roles?.map((role: any) => (
                                    <Badge
                                        key={role.id}
                                        className={getRoleColor(role.name)}
                                        variant="secondary"
                                    >
                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last login: {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Status: <span className={user?.is_active ? 'text-green-600' : 'text-red-600'}>
                                    {user?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold tracking-tight mb-2">Available Modules</h2>

                {isLoading ? (
                    // Loading placeholders
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="h-[150px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
                        ))}
                    </div>
                ) : moduleCards.length > 0 ? (
                    // Module cards
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {moduleCards.map((module) => (
                            <Link key={module.name} href={module.route}>
                                <Card className="border-sidebar-border/70 dark:border-sidebar-border h-full transition-all hover:shadow-md hover:border-sidebar-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium">{module.name}</CardTitle>
                                        {module.icon && <module.icon className="h-5 w-5 text-muted-foreground" />}
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {module.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // No modules found
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border md:min-h-min flex items-center justify-center">
                        <div className="text-center">
                            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium">No modules available</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Contact your administrator to enable modules.</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


