import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Folder, Users, Truck, DollarSign, UserCog, Calendar, BarChart, Settings, ClipboardList, Clock, Briefcase, FileDigit, Bell, Globe, Smartphone, FolderCheck, Network } from 'lucide-react';
import NavLink from '../components/NavLink';
import { useTranslation } from 'react-i18next';
import StatsCard from '../components/dashboard/StatsCard';
import ChartWidget from '../components/dashboard/ChartWidget';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TeamWidget from '../components/dashboard/TeamWidget';
import RecentProjects from '../components/dashboard/RecentProjects';
import { ActivityFeedProps } from '../components/dashboard/ActivityFeed';
import { TeamWidgetProps } from '../components/dashboard/TeamWidget';
import { RecentProjectsProps } from '../components/dashboard/RecentProjects';
import AppLogo from '../components/app-logo';
import EmployeeWidget from '../components/dashboard/EmployeeWidget';
import RentalWidget from '../components/dashboard/RentalWidget';
import VacationWidget from '../components/dashboard/VacationWidget';
import { EmployeeWidgetProps } from '../components/dashboard/EmployeeWidget';
import { RentalWidgetProps } from '../components/dashboard/RentalWidget';
import { VacationWidgetProps } from '../components/dashboard/VacationWidget';
import PayrollWidget from '../components/dashboard/PayrollWidget';
import EquipmentWidget from '../components/dashboard/EquipmentWidget';
import { PayrollWidgetProps } from '../components/dashboard/PayrollWidget';
import { EquipmentWidgetProps } from '../components/dashboard/EquipmentWidget';
import AnalyticsWidget from '../components/dashboard/AnalyticsWidget';
import AuditWidget from '../components/dashboard/AuditWidget';
import ProjectWidget from '../components/dashboard/ProjectWidget';
import CustomerWidget from '../components/dashboard/CustomerWidget';
import { AnalyticsWidgetProps } from '../components/dashboard/AnalyticsWidget';
import { AuditWidgetProps } from '../components/dashboard/AuditWidget';
import { ProjectWidgetProps } from '../components/dashboard/ProjectWidget';
import { CustomerWidgetProps } from '../components/dashboard/CustomerWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import FilesWidget from '../components/dashboard/FilesWidget';
import TimelineWidget from '../components/dashboard/TimelineWidget';
import KanbanWidget from '../components/dashboard/KanbanWidget';
import type { TimelineEvent } from '../components/dashboard/TimelineWidget';
import type { Task } from '../components/dashboard/KanbanWidget';
import type { FileItem } from '../components/dashboard/FilesWidget';
import type { CalendarEvent } from '../components/dashboard/CalendarWidget';
import ClockWidget from '../components/dashboard/ClockWidget';
import DualClockWidget from '../components/dashboard/DualClockWidget';

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
        route: '/leaves',
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

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const { t } = useTranslation();
    const [moduleCards, setModuleCards] = useState<ModuleCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Mock data state
    const [stats, setStats] = useState([
        { icon: <BarChart className="h-5 w-5 text-primary" />, label: 'Active Projects', value: 0, trend: '' },
        { icon: <Users className="h-5 w-5 text-primary" />, label: 'Team Members', value: 0, trend: '' },
        { icon: <Folder className="h-5 w-5 text-primary" />, label: 'Files', value: 0, trend: '' },
        { icon: <Briefcase className="h-5 w-5 text-primary" />, label: 'Clients', value: 0, trend: '' },
    ]);
    const [activities, setActivities] = useState<ActivityFeedProps['activities']>([]);
    const [team, setTeam] = useState<TeamWidgetProps['members']>([]);
    const [projects, setProjects] = useState<RecentProjectsProps['projects']>([]);
    const [loadingWidgets, setLoadingWidgets] = useState(true);
    const [employees, setEmployees] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        topEmployees: [] as EmployeeWidgetProps['topEmployees'],
    });
    const [rentals, setRentals] = useState({
        total: 0,
        active: 0,
        overdue: 0,
        topRentals: [] as RentalWidgetProps['topRentals'],
    });
    const [vacations, setVacations] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        recentRequests: [] as VacationWidgetProps['recentRequests'],
    });
    const [payrolls, setPayrolls] = useState({
        total: 0,
        processed: 0,
        pending: 0,
        recentPayrolls: [] as PayrollWidgetProps['recentPayrolls'],
    });
    const [equipment, setEquipment] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        topEquipment: [] as EquipmentWidgetProps['topEquipment'],
    });
    const [analytics, setAnalytics] = useState({
        total: 0,
        active: 0,
        archived: 0,
        recentReports: [] as AnalyticsWidgetProps['recentReports'],
    });
    const [audits, setAudits] = useState({
        total: 0,
        passed: 0,
        failed: 0,
        recentAudits: [] as AuditWidgetProps['recentAudits'],
    });
    const [projectsWidget, setProjectsWidget] = useState({
        total: 0,
        active: 0,
        completed: 0,
        topProjects: [] as ProjectWidgetProps['topProjects'],
    });
    const [customers, setCustomers] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        topCustomers: [] as CustomerWidgetProps['topCustomers'],
    });
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [kanbanTasks, setKanbanTasks] = useState<Task[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(true);
    const [loadingKanban, setLoadingKanban] = useState(true);
    const [errorTimeline, setErrorTimeline] = useState('');
    const [errorKanban, setErrorKanban] = useState('');
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [errorCalendar, setErrorCalendar] = useState('');
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [errorFiles, setErrorFiles] = useState('');

    useEffect(() => {
        // Fetch user and module status from Inertia or API
        const fetchData = async () => {
            try {
                // @ts-ignore
                const inertiaUser = window?.Inertia?.page?.props?.auth?.user;
                setUser(inertiaUser);
                const isAdmin = inertiaUser?.roles?.some((role: any) => role.name === 'admin');
                let cards: ModuleCard[] = [];
                if (isAdmin) {
                    cards = Object.entries(moduleMap)
                        .map(([module, mapInfo]) => ({
                            name: module.replace(/([A-Z])/g, ' $1').trim(),
                            icon: mapInfo.icon,
                            route: mapInfo.route,
                            description: mapInfo.description
                        }));
                } else {
                    const response = await fetch('/modules_statuses.json');
                    const data = await response.json() as ModuleStatus;
                    cards = Object.entries(data)
                        .filter(([module, enabled]) => enabled)
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
                }
                setModuleCards(cards);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setLoadingWidgets(true);
        // Employees
        fetch('/api/employees/all', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const allEmployees = result.data || [];
                const total = allEmployees.length;
                const active = allEmployees.filter((e: any) => e.status?.toLowerCase() === 'active').length;
                const inactive = allEmployees.filter((e: any) => e.status?.toLowerCase() === 'inactive').length;
                const topEmployees = allEmployees.slice(0, 10).map((e: any) => ({
                    id: String(e.id),
                    name: e.full_name || e.name || `${e.first_name} ${e.last_name}`,
                    status: e.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
                }));
                setEmployees({ total, active, inactive, topEmployees });
                setLoadingWidgets(false);
            })
            .catch(() => setLoadingWidgets(false));
        // Rentals
        fetch('/api/rentals/analytics', { credentials: 'include' })
            .then(res => res.json())
            .then((data) => {
                setRentals({
                    total: data.total || 0,
                    active: data.active || 0,
                    overdue: data.overdue || 0,
                    topRentals: [], // Optionally fetch top rentals if needed
                });
                setLoadingWidgets(false);
            })
            .catch(() => setLoadingWidgets(false));
        // Projects
        fetch('/api/projects', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const projects = result.data || [];
                const total = projects.length;
                const active = projects.filter((p: any) => p.status?.toLowerCase() === 'active').length;
                const completed = projects.filter((p: any) => p.status?.toLowerCase() === 'completed').length;
                const topProjects = projects.slice(0, 10).map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    status: p.status?.toLowerCase() === 'completed' ? 'Completed' : 'Active',
                    updatedAt: p.updated_at || p.end_date || '',
                }));
                setProjectsWidget({ total, active, completed, topProjects });
            })
            .catch(() => {});
        // Equipment
        fetch('/api/equipment', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const equipment = result.data || [];
                const total = equipment.length;
                const available = equipment.filter((e: any) => e.status?.toLowerCase() === 'available').length;
                const inUse = equipment.filter((e: any) => e.status?.toLowerCase() === 'in use').length;
                const topEquipment = equipment.slice(0, 10).map((e: any) => ({
                    id: String(e.id),
                    name: e.name,
                    status: e.status?.toLowerCase() === 'in use' ? 'In Use' : 'Available',
                }));
                setEquipment({ total, available, inUse, topEquipment });
            })
            .catch(() => {});
        // Files
        fetch('/api/files/recent', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const files = result.data || [];
                setFiles(files.map((file: any) => ({
                    id: String(file.id),
                    name: file.name,
                    uploader: file.uploader || 'Unknown',
                    date: file.created_at || file.date,
                    type: file.type || 'other',
                    url: file.url,
                })));
                setLoadingFiles(false);
            })
            .catch(() => setLoadingFiles(false));
        // Calendar
        fetch('/api/calendar/events', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const events = result.data || [];
                setCalendarEvents(events.map((event: any) => ({
                    id: String(event.id),
                    date: event.date,
                    title: event.title,
                    description: event.description,
                    type: event.type || 'meeting',
                })));
                setLoadingCalendar(false);
            })
            .catch(() => setLoadingCalendar(false));
        // Timeline
        fetch('/api/timeline', { credentials: 'include' })
            .then(res => res.json())
            .then((result) => {
                const events = result.data || [];
                setTimelineEvents(events.map((event: any) => ({
                    id: String(event.id),
                    time: event.date || event.time,
                    title: event.event || event.title,
                    description: event.description,
                    type: event.type || 'event',
                })));
                setLoadingTimeline(false);
            })
            .catch(() => setLoadingTimeline(false));
        // Kanban
        fetch('/api/kanban', { credentials: 'include' })
            .then(res => res.json())
            .then((kanban) => {
                const tasks: any[] = [];
                Object.entries(kanban).forEach(([status, items]: [string, any]) => {
                    (items as any[]).forEach((task) => {
                        tasks.push({
                            id: String(task.id),
                            title: task.task || task.title,
                            assignee: { name: task.assignee || 'Unassigned', avatarUrl: task.avatarUrl },
                            due: task.due || '',
                            status: status as 'todo' | 'inprogress' | 'done',
                        });
                    });
                });
                setKanbanTasks(tasks);
                setLoadingKanban(false);
            })
            .catch(() => setLoadingKanban(false));
    }, []);

    return (
        <AppLayout title="Dashboard" breadcrumbs={breadcrumbs}>
            {/* Branded Header */}
            <div className="flex items-center gap-3 bg-primary text-primary-foreground rounded-md mx-6 mt-6 mb-2 p-4 shadow-sm">
                <AppLogo />
                <span className="text-lg font-bold tracking-tight">{import.meta.env.VITE_APP_NAME || 'Dashboard'}</span>
            </div>
            {/* Top: Stats, Dual Clock, and Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
                {loadingWidgets ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <StatsCard key={idx} icon={<BarChart className="h-5 w-5 text-muted-foreground" />} label="---" value="--" trend="" className="animate-pulse" />
                    ))
                ) : (
                    stats.map((stat, idx) => (
                        <StatsCard key={idx} {...stat} />
                    ))
                )}
                <DualClockWidget />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-6 pb-6">
                <ChartWidget title="Project Progress" description="Overview of project completion" />
            </div>
            {/* Middle: Key Business Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 pb-6">
                <EmployeeWidget {...employees} />
                <RentalWidget {...rentals} />
                <VacationWidget {...vacations} />
                <PayrollWidget {...payrolls} />
                <EquipmentWidget {...equipment} />
            </div>
            {/* Lower: Analytics, Audit, Project, Customer, Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 pb-6">
                <AnalyticsWidget {...analytics} />
                <AuditWidget {...audits} />
                <ProjectWidget {...projectsWidget} />
                <CustomerWidget {...customers} />
                <TimelineWidget events={timelineEvents} className={loadingTimeline ? 'animate-pulse' : ''} />
            </div>
            {/* Bottom: Activity, Team, Recent Projects, Calendar, Files, Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 px-6 pb-6">
                <ActivityFeed activities={loadingWidgets ? [] : activities} />
                <TeamWidget members={loadingWidgets ? [] : team} />
                <RecentProjects projects={loadingWidgets ? [] : projects} />
                <CalendarWidget events={calendarEvents} className={loadingCalendar ? 'animate-pulse' : ''} />
                <FilesWidget files={files} className={loadingFiles ? 'animate-pulse' : ''} />
                <KanbanWidget tasks={kanbanTasks} className={loadingKanban ? 'animate-pulse' : ''} />
            </div>
        </AppLayout>
    );
}
