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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    useToast,
} from '@/Core';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format, subMonths } from 'date-fns';
import {
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

interface TimesheetSummary {
    month: string;
    year: number;
    total_hours: number;
    total_overtime: number;
    total_timesheets: number;
    employee_stats: Array<{
        employee_id: number;
        employee: Employee;
        total_hours: number;
        total_overtime: number;
        total_timesheets: number;
    }>;
    project_stats: Array<{
        project_id: number;
        project: Project | null;
        total_hours: number;
        percentage: number;
    }>;
    status_stats: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
}

interface Props {
    summary: TimesheetSummary;
    employees: Employee[];
    projects: Project[];
}

export default function TimesheetSummary({ summary, employees = [], projects = [] }: Props) {
    const { t } = useTranslation('TimesheetManagement');
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(
        summary && summary.month && summary.year
            ? new Date(`${summary.year}-${String(new Date(Date.parse(summary.month + ' 1, ' + summary.year)).getMonth() + 1).padStart(2, '0')}-01`)
            : new Date(),
    );

    const reloadWithMonth = (date: Date) => {
        const monthParam = format(date, 'yyyy-MM');
        router.get((route as any)('timesheets.summary'), { month: monthParam }, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        toast({ description: t('export_started', 'Export Started') });
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'manager_approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
            case 'foreman_approved':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Foreman Approved</Badge>;
            case 'incharge_approved':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Incharge Approved</Badge>;
            case 'checking_approved':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Checking Approved</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Submitted</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
            case 'draft':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
            default:
                return <Badge variant="outline">{status || 'Unknown'}</Badge>;
        }
    };

    const hasData = summary && summary.total_timesheets > 0;

    return (
        <AppLayout>
            <Head title={t('ttl_monthly_timesheet_summary')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center space-x-2">
                        <BarChartIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{t('monthly_summary')}</h1>
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
                            Export
                        </Button>
                    </div>
                </div>
                {hasData ? (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('total_hours')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <ClockIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{summary.total_hours}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('including_overtime', { count: summary.total_overtime })}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('ttl_total_employees')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <UsersIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{summary.employee_stats.length}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('submitted_timesheets', { count: summary.total_timesheets })}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{t('month')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <BarChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                                        <div className="text-2xl font-bold">{format(selectedDate, 'MMMM yyyy')}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <UsersIcon className="mr-2 h-5 w-5" />
                                        {t('employee_summary', 'Employee Summary')}
                                    </CardTitle>
                                    <CardDescription>{t('hours_worked_by_each_employee', 'Hours worked by each employee')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('employee', 'Employee')}</TableHead>
                                                    <TableHead className="text-right">{t('hours', 'Hours')}</TableHead>
                                                    <TableHead className="text-right">{t('overtime', 'Overtime')}</TableHead>
                                                    <TableHead className="text-right">{t('timesheets', 'Timesheets')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {summary.employee_stats.map((stat) => (
                                                    <TableRow key={stat.employee_id}>
                                                        <TableCell className="font-medium">
                                                            {stat.employee.first_name} {stat.employee.last_name}
                                                        </TableCell>
                                                        <TableCell className="text-right">{stat.total_hours}</TableCell>
                                                        <TableCell className="text-right">{stat.total_overtime}</TableCell>
                                                        <TableCell className="text-right">{stat.total_timesheets}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BriefcaseIcon className="mr-2 h-5 w-5" />
                                        {t('project_distribution', 'Project Distribution')}
                                    </CardTitle>
                                    <CardDescription>{t('hours_distribution_by_project', 'Hours distribution by project')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {summary.project_stats.map((stat) => (
                                            <div key={stat.project_id} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">
                                                        {stat.project && stat.project.name ? stat.project.name : 'No Project'}
                                                    </span>
                                                    <span>
                                                        {stat.total_hours} hrs ({stat.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full rounded-full bg-muted">
                                                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${stat.percentage}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileTextIcon className="mr-2 h-5 w-5" />
                                    {t('status_overview', 'Status Overview')}
                                </CardTitle>
                                <CardDescription>{t('timesheet_status_distribution', 'Timesheet status distribution')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    {summary.status_stats.map((stat) => (
                                        <Card key={stat.status} className="border-none shadow-none">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="mb-2">{getStatusBadge(stat.status)}</div>
                                                    <div className="text-2xl font-bold">{stat.count}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {stat.percentage}% {t('of_total', 'of total')}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="flex h-96 flex-col items-center justify-center">
                        <BarChartIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-xl font-semibold">{t('no_timesheet_data', 'No timesheet data available for this month.')}</h2>
                        <p className="mb-4 text-muted-foreground">
                            {t('try_another_month', 'Try selecting a different month or ensure timesheets have been submitted.')}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
