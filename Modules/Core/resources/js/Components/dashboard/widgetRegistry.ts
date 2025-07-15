import ActivityFeed from './ActivityFeed';
import AnalyticsWidget from './AnalyticsWidget';
import AuditWidget from './AuditWidget';
import CalendarWidget from './CalendarWidget';
import ChartWidget from './ChartWidget';
import CustomerWidget from './CustomerWidget';
import DualClockWidget from './DualClockWidget';
import EmployeeWidget from './EmployeeWidget';
import EquipmentWidget from './EquipmentWidget';
import FilesWidget from './FilesWidget';
import KanbanWidget from './KanbanWidget';
import PayrollWidget from './PayrollWidget';
import ProjectWidget from './ProjectWidget';
import RecentProjects from './RecentProjects';
import RentalWidget from './RentalWidget';
import StatsCard from './StatsCard';
import TeamWidget from './TeamWidget';
import TimelineWidget from './TimelineWidget';
import VacationWidget from './VacationWidget';

export const widgetRegistry = [
    { id: 'employee', component: EmployeeWidget },
    { id: 'rental', component: RentalWidget },
    { id: 'vacation', component: VacationWidget },
    { id: 'payroll', component: PayrollWidget },
    { id: 'equipment', component: EquipmentWidget },
    { id: 'analytics', component: AnalyticsWidget },
    { id: 'audit', component: AuditWidget },
    { id: 'project', component: ProjectWidget },
    { id: 'customer', component: CustomerWidget },
    { id: 'timeline', component: TimelineWidget },
    { id: 'activity', component: ActivityFeed },
    { id: 'team', component: TeamWidget },
    { id: 'recentProjects', component: RecentProjects },
    { id: 'calendar', component: CalendarWidget },
    { id: 'files', component: FilesWidget },
    { id: 'kanban', component: KanbanWidget },
    { id: 'chart', component: ChartWidget },
    { id: 'stats', component: StatsCard },
    { id: 'dualClock', component: DualClockWidget },
];
