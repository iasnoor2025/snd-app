import AppLayout from '../../../Modules/Core/resources/js/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge
} from "../../../Modules/Core/resources/js/components/ui";
import { type BreadcrumbItem } from "../../../Modules/Core/resources/js/types";
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Folder, Users, Truck, DollarSign, UserCog, Calendar,
    BarChart, Settings, ClipboardList, Clock, Briefcase,
    FileDigit, Bell, Globe, Smartphone, FolderCheck, Network
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface ModuleInfo {
    icon: React.ElementType;
    route: string;
    description: string;
}

interface User {
    roles: Array<{ name: string }>;
    name: string;
    email: string;
    last_login_at: string | null;
    is_active: boolean;
}

interface Auth {
    user: User;
}

interface InertiaProps {
    auth: Auth;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Map module names to icons and routes
const moduleMap: Record<string, ModuleInfo> = {
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

interface ModuleCard {
    name: string;
    icon: React.ElementType;
    route: string;
    description: string;
}

interface ModuleStatus {
    [key: string]: boolean;
}

export default function Dashboard() {
    const { t } = useTranslation();
    const { auth } = usePage<InertiaProps>().props;
    const user = auth.user;
    const isAdmin = user.roles.some((role) => role.name === 'admin');
    const isManager = user.roles.some((role) => role.name === 'manager');
    const isEmployee = user.roles.some((role) => role.name === 'employee');
    const isHR = user.roles.some((role) => role.name === 'hr');
    const isAccountant = user.roles.some((role) => role.name === 'accountant');
    const isTechnician = user.roles.some((role) => role.name === 'technician');

    const [moduleCards, setModuleCards] = useState<ModuleCard[]>([]);
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

    const canAccessModule = (moduleName: string): boolean => {
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
                let cards: ModuleCard[];
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
                        const data = await response.json() as ModuleStatus;
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
                    } catch (error) {
                        console.error('Error fetching module statuses:', error);
                        cards = [];
                    }
                }
                setModuleCards(cards);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading modules:', error);
                setIsLoading(false);
            }
        };

        fetchModules();
    }, [isAdmin]);

    return (
        <AppLayout title="Dashboard" breadcrumbs={breadcrumbs}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
                {isLoading ? (
                    // Loading state
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardHeader className="h-20 bg-gray-100" />
                            <CardContent className="h-24 bg-gray-50" />
                        </Card>
                    ))
                ) : moduleCards.length > 0 ? (
                    // Module cards
                    moduleCards.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link key={module.name} href={module.route}>
                                <Card className="hover:bg-gray-50 transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {module.name}
                                        </CardTitle>
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {module.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })
                ) : (
                    // No modules available
                    <div className="col-span-full text-center p-8">
                        <Folder className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium">No modules available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Contact your administrator to enable modules.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


