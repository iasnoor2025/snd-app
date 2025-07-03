import EmployeeWidget from './EmployeeWidget';
import RentalWidget from './RentalWidget';
import VacationWidget from './VacationWidget';
import PayrollWidget from './PayrollWidget';
import EquipmentWidget from './EquipmentWidget';
import AnalyticsWidget from './AnalyticsWidget';
import AuditWidget from './AuditWidget';
import ProjectWidget from './ProjectWidget';
import CustomerWidget from './CustomerWidget';
import TimelineWidget from './TimelineWidget';
import ActivityFeed from './ActivityFeed';
import TeamWidget from './TeamWidget';
import RecentProjects from './RecentProjects';
import CalendarWidget from './CalendarWidget';
import FilesWidget from './FilesWidget';
import KanbanWidget from './KanbanWidget';
import ChartWidget from './ChartWidget';
import StatsCard from './StatsCard';
import DualClockWidget from './DualClockWidget';

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
