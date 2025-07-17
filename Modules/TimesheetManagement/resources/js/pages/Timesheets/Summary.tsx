import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';
import { toast } from 'sonner';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format, subMonths } from 'date-fns';
import {
    ArrowLeft,
    BarChart as BarChartIcon,
    Briefcase as BriefcaseIcon,
    Clock as ClockIcon,
    Download as DownloadIcon,
    FileText as FileTextIcon,
    Users as UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
}

interface Project {
    id: number;
    name: string;
}

interface EmployeeStat {
    employee_id: number;
    employee: Employee;
    total_hours: number;
    total_overtime: number;
    total_timesheets: number;
}

interface ProjectStat {
    project_id: number | null;
    project: Project | null;
    total_hours: number;
    percentage: number;
}

interface StatusStat {
    status: string;
    count: number;
    percentage: number;
}

interface TimesheetSummary {
    month: string;
    year: number;
    total_hours: number;
    total_overtime: number;
    total_timesheets: number;
    employee_stats: EmployeeStat[];
    project_stats: ProjectStat[];
    status_stats: StatusStat[];
}

interface Props {
    summary: TimesheetSummary;
    employees: Employee[];
    projects: Project[];
}

export default function TimesheetSummary({ summary, employees = [], projects = [] }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    // Create current date from summary data or fallback to current date
    const currentDate = summary && summary.month && summary.year
        ? new Date(summary.year, new Date(Date.parse(summary.month + ' 1, ' + summary.year)).getMonth(), 1)
        : new Date();

    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

    const reloadWithMonth = (date: Date) => {
        const monthParam = format(date, 'yyyy-MM');
        router.get(route('timesheets.summary'), { month: monthParam }, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        toast.success(t('export_started', 'Export Started'));
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        switch (statusLower) {
            case 'approved':
            case 'manager_approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{t('status_approved', 'Approved')}</Badge>;
            case 'foreman_approved':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{t('status_foreman_approved', 'Foreman Approved')}</Badge>;
            case 'incharge_approved':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">{t('status_incharge_approved', 'Incharge Approved')}</Badge>;
            case 'checking_approved':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">{t('status_checking_approved', 'Checking Approved')}</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{t('status_submitted', 'Submitted')}</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{t('status_rejected', 'Rejected')}</Badge>;
            case 'draft':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{t('status_draft', 'Draft')}</Badge>;
            default:
                return <Badge variant="outline">{status || t('status_unknown', 'Unknown')}</Badge>;
        }
    };

    const hasData = summary && (
        summary.total_timesheets > 0 ||
        (summary.employee_stats && summary.employee_stats.length > 0) ||
        (summary.project_stats && summary.project_stats.length > 0) ||
        (summary.status_stats && summary.status_stats.length > 0)
    );
    const displayMonth = summary?.month || format(selectedDate, 'MMMM');
    const displayYear = summary?.year || selectedDate.getFullYear();

    return (
        <AppLayout>
            <Head title={t('ttl_monthly_timesheet_summary', 'Monthly Timesheet Summary')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Back Button */}
                <div className="mb-2">
                    <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                        <a href={route('timesheets.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            {t('btn_back', 'Back')}
                        </a>
                    </Button>
                </div>

                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center space-x-2">
                        <BarChartIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{t('monthly_summary', 'Monthly Summary')}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={format(selectedDate, 'yyyy-MM')}
                            onValueChange={(value) => {
                                const [year, month] = value.split('-').map(Number);
                                const newDate = new Date(year, month - 1, 1);
                                setSelectedDate(newDate);
                                reloadWithMonth(newDate);
                            }}
                        >
                            <SelectTrigger className="w-full min-w-[140px] sm:w-auto">
                                <SelectValue placeholder={format(selectedDate, 'MMMM yyyy')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => {
                                    const date = subMonths(new Date(), i);
                                    return (
                                        <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                                            {format(date, 'MMMM yyyy')}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={handleExport}>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            {t('btn_export', 'Export')}
                        </Button>
                    </div>
                </div>

                {hasData ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('total_hours', 'Total Hours')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <ClockIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{summary.total_hours || 0}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('including_overtime_hours', 'Including {{count}} overtime hours', { count: summary.total_overtime || 0 })}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('total_employees', 'Total Employees')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <UsersIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{summary.employee_stats?.length || 0}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('total_timesheets_count', '{{count}} timesheets submitted', { count: summary.total_timesheets || 0 })}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('period', 'Period')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <BarChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{displayMonth} {displayYear}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Employee and Project Stats */}
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Employee Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <UsersIcon className="mr-2 h-5 w-5" />
                                        {t('employee_summary', 'Employee Summary')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('hours_worked_by_employee', 'Hours worked by each employee')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {summary?.employee_stats && Array.isArray(summary.employee_stats) && summary.employee_stats.length > 0 ? (
                                        <div className="rounded-md border">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 font-medium">{t('employee', 'Employee')}</th>
                                                        <th className="text-right p-3 font-medium">{t('hours', 'Hours')}</th>
                                                        <th className="text-right p-3 font-medium">{t('overtime', 'Overtime')}</th>
                                                        <th className="text-right p-3 font-medium">{t('timesheets', 'Timesheets')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {summary.employee_stats.map((stat, index) => (
                                                        <tr key={stat.employee_id || index} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 font-medium">
                                                                {stat.employee?.first_name || ''} {stat.employee?.last_name || ''}
                                                            </td>
                                                            <td className="p-3 text-right">{stat.total_hours || 0}</td>
                                                            <td className="p-3 text-right">{stat.total_overtime || 0}</td>
                                                            <td className="p-3 text-right">{stat.total_timesheets || 0}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-2">
                                                {t('no_employee_data', 'No employee data available')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {summary?.total_timesheets === 0
                                                    ? t('no_timesheets_submitted', 'No timesheets have been submitted for this period.')
                                                    : t('data_loading_issue', 'There may be an issue loading the data.')
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Project Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BriefcaseIcon className="mr-2 h-5 w-5" />
                                        {t('project_distribution', 'Project Distribution')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('hours_distribution_by_project', 'Hours distribution by project')}
                                    </CardDescription>
                                </CardHeader>
                                                                <CardContent>
                                    {summary?.project_stats && Array.isArray(summary.project_stats) && summary.project_stats.length > 0 ? (
                                        <div className="space-y-4">
                                            {summary.project_stats.map((stat, index) => (
                                                <div key={stat.project_id || index} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">
                                                            {stat.project?.name || t('no_project', 'No Project')}
                                                        </span>
                                                        <span>
                                                            {stat.total_hours || 0} {t('hrs', 'hrs')} ({stat.percentage || 0}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 w-full rounded-full bg-muted">
                                                        <div
                                                            className="h-2.5 rounded-full bg-primary"
                                                            style={{ width: `${Math.min(stat.percentage || 0, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-2">
                                                {t('no_project_data', 'No project data available')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {summary?.total_timesheets === 0
                                                    ? t('no_timesheets_submitted', 'No timesheets have been submitted for this period.')
                                                    : t('data_loading_issue', 'There may be an issue loading the data.')
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status Overview */}
                        {summary?.status_stats && Array.isArray(summary.status_stats) && summary.status_stats.length > 0 && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileTextIcon className="mr-2 h-5 w-5" />
                                        {t('status_overview', 'Status Overview')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('timesheet_status_distribution', 'Timesheet status distribution')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {summary.status_stats.map((stat, index) => (
                                            <Card key={stat.status || index} className="border-none shadow-none">
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="mb-2">{getStatusBadge(stat.status)}</div>
                                                        <div className="text-2xl font-bold">{stat.count || 0}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {stat.percentage || 0}% {t('of_total', 'of total')}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    /* No Data State */
                    <div className="flex h-96 flex-col items-center justify-center">
                        <BarChartIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-xl font-semibold">
                            {t('no_timesheet_data', 'No timesheet data available for this month.')}
                        </h2>
                        <p className="mb-4 text-muted-foreground text-center">
                            {t('try_another_month', 'Try selecting a different month or ensure timesheets have been submitted.')}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
