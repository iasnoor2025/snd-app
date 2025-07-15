import {
    BarChart,
    Bell,
    Briefcase,
    Calendar,
    ClipboardList,
    Clock,
    DollarSign,
    FileDigit,
    Folder,
    FolderCheck,
    Globe,
    Network,
    Settings,
    Smartphone,
    Truck,
    UserCog,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useTranslation } from 'react-i18next';
import 'react-resizable/css/styles.css';
import AppLogo from '../components/app-logo';
import ActivityFeed, { ActivityFeedProps } from '../components/dashboard/ActivityFeed';
import AnalyticsWidget, { AnalyticsWidgetProps } from '../components/dashboard/AnalyticsWidget';
import AuditWidget, { AuditWidgetProps } from '../components/dashboard/AuditWidget';
import type { CalendarEvent } from '../components/dashboard/CalendarWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import ChartWidget from '../components/dashboard/ChartWidget';
import CustomerWidget, { CustomerWidgetProps } from '../components/dashboard/CustomerWidget';
import DualClockWidget from '../components/dashboard/DualClockWidget';
import EmployeeWidget, { EmployeeWidgetProps } from '../components/dashboard/EmployeeWidget';
import EquipmentWidget, { EquipmentWidgetProps } from '../components/dashboard/EquipmentWidget';
import type { FileItem } from '../components/dashboard/FilesWidget';
import FilesWidget from '../components/dashboard/FilesWidget';
import type { Task } from '../components/dashboard/KanbanWidget';
import KanbanWidget from '../components/dashboard/KanbanWidget';
import PayrollWidget, { PayrollWidgetProps } from '../components/dashboard/PayrollWidget';
import ProjectWidget, { ProjectWidgetProps } from '../components/dashboard/ProjectWidget';
import RecentProjects, { RecentProjectsProps } from '../components/dashboard/RecentProjects';
import RentalWidget, { RentalWidgetProps } from '../components/dashboard/RentalWidget';
import StatsCard from '../components/dashboard/StatsCard';
import TeamWidget, { TeamWidgetProps } from '../components/dashboard/TeamWidget';
import type { TimelineEvent } from '../components/dashboard/TimelineWidget';
import TimelineWidget from '../components/dashboard/TimelineWidget';
import VacationWidget, { VacationWidgetProps } from '../components/dashboard/VacationWidget';
import { widgetRegistry } from '../components/dashboard/widgetRegistry';
import GlassCard from '../components/GlassCard';
import AppLayout from '../layouts/AppLayout';

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
        description: 'Core system functionality and settings',
    },
    EmployeeManagement: {
        icon: UserCog,
        route: '/employees',
        description: 'Manage employees, roles and responsibilities',
    },
    LeaveManagement: {
        icon: ClipboardList,
        route: '/leaves',
        description: 'Track and approve leave requests',
    },
    TimesheetManagement: {
        icon: Clock,
        route: '/timesheets',
        description: 'Monitor time entries and approvals',
    },
    Payroll: {
        icon: DollarSign,
        route: '/payrolls',
        description: 'Process payroll and manage compensation',
    },
    ProjectManagement: {
        icon: Briefcase,
        route: '/projects',
        description: 'Manage projects, tasks and milestones',
    },
    RentalManagement: {
        icon: Calendar,
        route: '/rentals',
        description: 'Track equipment rentals and availability',
    },
    EquipmentManagement: {
        icon: Truck,
        route: '/equipment',
        description: 'Manage equipment inventory and maintenance',
    },
    Settings: {
        icon: Settings,
        route: '/settings',
        description: 'Configure system preferences and options',
    },
    Notifications: {
        icon: Bell,
        route: '/notifications',
        description: 'Manage system and user notifications',
    },
    Reporting: {
        icon: BarChart,
        route: '/reports',
        description: 'Generate and view business reports',
    },
    MobileBridge: {
        icon: Smartphone,
        route: '/mobile-bridge',
        description: 'Mobile app integration and connectivity',
    },
    Localization: {
        icon: Globe,
        route: '/localization',
        description: 'Manage languages and localizations',
    },
    CustomerManagement: {
        icon: Users,
        route: '/customers',
        description: 'Manage customer accounts and data',
    },
    AuditCompliance: {
        icon: FolderCheck,
        route: '/audit',
        description: 'Track compliance and system audits',
    },
    API: {
        icon: FileDigit,
        route: '/api',
        description: 'API integrations and management',
    },
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

const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

const ResponsiveGridLayout = WidthProvider(Responsive);

function getSavedLayout(key: string, fallback: Layout[]) {
    if (typeof window === 'undefined') return fallback;
    try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
    } catch {}
    return fallback;
}

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

    // Parallax state for animated background
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    // Layout state for drag-and-drop (persisted)
    const [layout, setLayout] = useState<Layout[]>(() =>
        getSavedLayout('dashboard-layout', [
            { i: 'employee', x: 0, y: 0, w: 1, h: 2 },
            { i: 'rental', x: 1, y: 0, w: 1, h: 2 },
            { i: 'vacation', x: 2, y: 0, w: 1, h: 2 },
            { i: 'payroll', x: 3, y: 0, w: 1, h: 2 },
            { i: 'equipment', x: 4, y: 0, w: 1, h: 2 },
        ]),
    );
    const [layoutLower, setLayoutLower] = useState<Layout[]>(() =>
        getSavedLayout('dashboard-layout-lower', [
            { i: 'analytics', x: 0, y: 0, w: 1, h: 2 },
            { i: 'audit', x: 1, y: 0, w: 1, h: 2 },
            { i: 'project', x: 2, y: 0, w: 1, h: 2 },
            { i: 'customer', x: 3, y: 0, w: 1, h: 2 },
            { i: 'timeline', x: 4, y: 0, w: 1, h: 2 },
        ]),
    );
    const [layoutBottom, setLayoutBottom] = useState<Layout[]>(() =>
        getSavedLayout('dashboard-layout-bottom', [
            { i: 'activity', x: 0, y: 0, w: 1, h: 2 },
            { i: 'team', x: 1, y: 0, w: 1, h: 2 },
            { i: 'recentProjects', x: 2, y: 0, w: 1, h: 2 },
            { i: 'calendar', x: 3, y: 0, w: 1, h: 2 },
            { i: 'files', x: 4, y: 0, w: 1, h: 2 },
            { i: 'kanban', x: 5, y: 0, w: 1, h: 2 },
        ]),
    );

    // Persist layouts
    useEffect(() => {
        localStorage.setItem('dashboard-layout', JSON.stringify(layout));
    }, [layout]);
    useEffect(() => {
        localStorage.setItem('dashboard-layout-lower', JSON.stringify(layoutLower));
    }, [layoutLower]);
    useEffect(() => {
        localStorage.setItem('dashboard-layout-bottom', JSON.stringify(layoutBottom));
    }, [layoutBottom]);

    // Widget visibility state (persisted)
    const allWidgetIds = widgetRegistry.map((w) => w.id);
    const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
        if (typeof window === 'undefined') return allWidgetIds;
        try {
            const saved = localStorage.getItem('dashboard-visible-widgets');
            if (saved) return JSON.parse(saved);
        } catch {}
        return allWidgetIds;
    });
    useEffect(() => {
        localStorage.setItem('dashboard-visible-widgets', JSON.stringify(visibleWidgets));
    }, [visibleWidgets]);

    // Add Widget modal
    const [addWidgetOpen, setAddWidgetOpen] = useState(false);
    const hiddenWidgets = widgetRegistry.filter((w) => !visibleWidgets.includes(w.id));

    // Remove widget handler
    function handleRemoveWidget(id: string) {
        setVisibleWidgets((w) => w.filter((wid) => wid !== id));
    }

    // Add widget handler
    function handleAddWidget(id: string) {
        setVisibleWidgets((w) => [...w, id]);
        setAddWidgetOpen(false);
    }

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
                    cards = Object.entries(moduleMap).map(([module, mapInfo]) => ({
                        name: module.replace(/([A-Z])/g, ' $1').trim(),
                        icon: mapInfo.icon,
                        route: mapInfo.route,
                        description: mapInfo.description,
                    }));
                } else {
                    const response = await fetch('/modules_statuses.json');
                    const data = (await response.json()) as ModuleStatus;
                    cards = Object.entries(data)
                        .filter(([module, enabled]) => enabled)
                        .map(([module, _]) => {
                            const mapInfo = moduleMap[module] || {
                                icon: Folder,
                                route: `/modules/${module.toLowerCase()}`,
                                description: `${module.replace(/([A-Z])/g, ' $1').trim()} module`,
                            };
                            return {
                                name: module.replace(/([A-Z])/g, ' $1').trim(),
                                icon: mapInfo.icon,
                                route: mapInfo.route,
                                description: mapInfo.description,
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
            .then((res) => res.json())
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
        fetch('/api/v1/rentals/analytics', { credentials: 'include' })
            .then((res) => res.json())
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
            .then((res) => res.json())
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
        fetch('/api/v1/equipment', { credentials: 'include' })
            .then((res) => res.json())
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
        // fetch('/api/files/recent', { credentials: 'include' })
        //     .then(res => res.json())
        //     .then((result) => {
        //         const files = result.data || [];
        //         setFiles(files.map((file: any) => ({
        //             id: String(file.id),
        //             name: file.name,
        //             uploader: file.uploader || 'Unknown',
        //             date: file.created_at || file.date,
        //             type: file.type || 'other',
        //             url: file.url,
        //         })));
        //         setLoadingFiles(false);
        //     })
        //     .catch(() => setLoadingFiles(false));
        // Calendar
        fetch('/api/calendar/events', { credentials: 'include' })
            .then((res) => res.json())
            .then((result) => {
                const events = result.data || [];
                setCalendarEvents(
                    events.map((event: any) => ({
                        id: String(event.id),
                        date: event.date,
                        title: event.title,
                        description: event.description,
                        type: event.type || 'meeting',
                    })),
                );
                setLoadingCalendar(false);
            })
            .catch(() => setLoadingCalendar(false));
        // Timeline
        fetch('/api/timeline', { credentials: 'include' })
            .then((res) => res.json())
            .then((result) => {
                const events = result.data || [];
                setTimelineEvents(
                    events.map((event: any) => ({
                        id: String(event.id),
                        time: event.date || event.time,
                        title: event.event || event.title,
                        description: event.description,
                        type: event.type || 'event',
                    })),
                );
                setLoadingTimeline(false);
            })
            .catch(() => setLoadingTimeline(false));
        // Kanban
        fetch('/api/kanban', { credentials: 'include' })
            .then((res) => res.json())
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

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            setParallax({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <AppLayout title="Dashboard" breadcrumbs={breadcrumbs}>
            {/* Animated SVG Blob Background with Parallax */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1440 900"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                >
                    <defs>
                        <radialGradient id="bg1" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(45)">
                            <stop offset="0%" stopColor="#00eaff" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="bg2" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(120)">
                            <stop offset="0%" stopColor="#ff00ea" stopOpacity="0.13" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="900" cy="200" rx="600" ry="300" fill="url(#bg1)" />
                    <ellipse cx="400" cy="700" rx="500" ry="250" fill="url(#bg2)" />
                </svg>
            </div>
            {/* Branded Header */}
            <div className="mx-6 mt-6 mb-2 flex items-center gap-3 rounded-md bg-primary p-4 text-primary-foreground shadow-sm">
                <AppLogo />
                <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>
                    {import.meta.env.VITE_APP_NAME || 'Dashboard'}
                </span>
            </div>
            {/* Top: Stats, Dual Clock, and Chart */}
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-5">
                {loadingWidgets
                    ? Array.from({ length: 4 }).map((_, idx) => (
                          <GlassCard key={idx} className="animate-pulse">
                              <span className="text-[1.1rem] font-bold" style={{ color: 'var(--accent)' }}>
                                  <StatsCard icon={<BarChart className="h-5 w-5 text-muted-foreground" />} label="---" value="--" trend="" />
                              </span>
                          </GlassCard>
                      ))
                    : stats.map((stat, idx) => (
                          <GlassCard key={idx}>
                              <span className="text-[1.1rem] font-bold" style={{ color: 'var(--accent)' }}>
                                  <StatsCard {...stat} />
                              </span>
                          </GlassCard>
                      ))}
                <GlassCard>
                    <DualClockWidget />
                </GlassCard>
            </div>
            <div className="grid grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2 lg:grid-cols-2">
                <GlassCard>
                    <ChartWidget title="Project Progress" description="Overview of project completion" />
                </GlassCard>
            </div>
            {/* Main widgets grid: all widgets same fixed size, responsive grid, no overlap, no horizontal scroll */}
            <div className="grid grid-cols-1 gap-3 px-6 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleWidgets.map((id) => (
                    <div key={id} className="h-30 w-full">
                        {(() => {
                            switch (id) {
                                case 'employee':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <EmployeeWidget {...employees} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'rental':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <RentalWidget {...rentals} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'vacation':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <VacationWidget {...vacations} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'payroll':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <PayrollWidget {...payrolls} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'equipment':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <EquipmentWidget {...equipment} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'analytics':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <AnalyticsWidget {...analytics} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'audit':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <AuditWidget {...audits} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'project':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <ProjectWidget {...projectsWidget} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'customer':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <CustomerWidget {...customers} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'timeline':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <TimelineWidget
                                                events={timelineEvents}
                                                className={loadingTimeline ? 'animate-pulse' : ''}
                                                onRemove={() => handleRemoveWidget(id)}
                                            />
                                        </GlassCard>
                                    );
                                case 'activity':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <ActivityFeed activities={loadingWidgets ? [] : activities} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'team':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <TeamWidget members={loadingWidgets ? [] : team} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'recentProjects':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <RecentProjects projects={loadingWidgets ? [] : projects} onRemove={() => handleRemoveWidget(id)} />
                                        </GlassCard>
                                    );
                                case 'calendar':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <CalendarWidget
                                                events={calendarEvents}
                                                className={loadingCalendar ? 'animate-pulse' : ''}
                                                onRemove={() => handleRemoveWidget(id)}
                                            />
                                        </GlassCard>
                                    );
                                case 'files':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <FilesWidget
                                                files={files}
                                                className={loadingFiles ? 'animate-pulse' : ''}
                                                onRemove={() => handleRemoveWidget(id)}
                                            />
                                        </GlassCard>
                                    );
                                case 'kanban':
                                    return (
                                        <GlassCard onRemove={() => handleRemoveWidget(id)} className="h-full w-full overflow-hidden">
                                            <KanbanWidget
                                                tasks={kanbanTasks}
                                                className={loadingKanban ? 'animate-pulse' : ''}
                                                onRemove={() => handleRemoveWidget(id)}
                                            />
                                        </GlassCard>
                                    );
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                ))}
            </div>
            {/* Add Widget Button */}
            <button
                className="fixed top-6 right-8 z-30 rounded-full bg-accent px-4 py-2 font-bold text-white shadow-lg transition hover:bg-accent/80"
                onClick={() => setAddWidgetOpen(true)}
            >
                + Add Widget
            </button>
            {/* Add Widget Modal (simple conditional render for guaranteed close) */}
            {addWidgetOpen && (
                <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ pointerEvents: 'auto' }}>
                    <div className="min-w-[320px] rounded-2xl bg-white p-6 shadow-2xl dark:bg-black">
                        <h2 className="mb-4 text-lg font-bold">Add Widget</h2>
                        <div className="flex flex-col gap-2">
                            {hiddenWidgets.length === 0 && <div className="text-muted-foreground">All widgets are visible.</div>}
                            {hiddenWidgets.map((w) => (
                                <button
                                    key={w.id}
                                    className="rounded px-3 py-2 text-left font-medium hover:bg-accent/10"
                                    onClick={() => handleAddWidget(w.id)}
                                >
                                    {w.id.charAt(0).toUpperCase() + w.id.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button className="mt-4 rounded bg-gray-200 px-4 py-2 dark:bg-gray-800" onClick={() => setAddWidgetOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

// NOTE: If you want to use a registry for dynamic dashboards in the future, use it only for ordering/metadata, and render each widget with the correct props explicitly, or use a type-safe discriminated union pattern.
