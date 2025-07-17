import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, Download as DownloadIcon, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    file_number?: string;
}

interface Project {
    id: number;
    name: string;
}

interface ProjectSummary {
    id: number | null;
    name: string;
    hours: number;
    overtime: number;
}

interface EmployeeSummary {
    employee: {
        id: number | null;
        name: string;
        file_number?: string;
    };
    total_days: number;
    total_hours: number;
    total_overtime: number;
    projects: ProjectSummary[];
}

interface MonthlyTimesheet {
    employee_id: number;
    employee: Employee;
    month: string;
    year: number;
    days: {
        date: string;
        hours: number;
        overtime_hours: number;
        status: string;
    }[];
    total_hours: number;
    total_overtime: number;
    absent_days?: number;
    absent_hours?: number;
}

interface Props extends PageProps {
    timesheets: MonthlyTimesheet[];
    employees: Employee[];
    summary: EmployeeSummary[];
    filters: {
        month: string;
        employee_id?: number;
    };
}

export default function MonthlyTimesheets({ auth, timesheets = [], employees = [], summary = [], filters }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    const [selectedDate, setSelectedDate] = useState<Date>(filters?.month ? new Date(filters.month + '-01') : new Date());
    const [selectedEmployee, setSelectedEmployee] = useState<string>(filters?.employee_id ? String(filters.employee_id) : 'all');
    const [search, setSearch] = useState<string>('');

    // Filtered summary based on search and employee
    const filteredSummary = summary.filter((emp) => {
        const matchesEmployee = selectedEmployee === 'all' || emp.employee.id === Number(selectedEmployee);
        const matchesSearch =
            !search ||
            emp.employee.name.toLowerCase().includes(search.toLowerCase()) ||
            (emp.employee.file_number && emp.employee.file_number.toLowerCase().includes(search.toLowerCase()));
        return matchesEmployee && matchesSearch;
    });

    const reloadWithFilters = (date: Date, employeeId: string = selectedEmployee) => {
        const monthParam = format(date, 'yyyy-MM');
        const params: any = { month: monthParam };
        if (employeeId !== 'all') params.employee_id = Number(employeeId);
        router.get((route as any)('timesheets.monthly'), params, { preserveState: true, replace: true });
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const firstDayOfMonth = startOfMonth(date);
            setSelectedDate(firstDayOfMonth);
            reloadWithFilters(firstDayOfMonth);
        }
    };

    const handlePreviousMonth = () => {
        const previousMonth = subMonths(selectedDate, 1);
        setSelectedDate(previousMonth);
        reloadWithFilters(previousMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = addMonths(selectedDate, 1);
        setSelectedDate(nextMonth);
        reloadWithFilters(nextMonth);
    };

    const handleExport = () => {
        toast.info(t('export_started', 'Export Started'));
    };

    return (
        <AppLayout title={t('monthly_timesheets')} requiredPermission="timesheets.view">
            <Head title={t('monthly_timesheets')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{t('monthly_timesheets')}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={format(selectedDate, 'yyyy-MM')}
                            onValueChange={(value) => {
                                const [year, month] = value.split('-').map(Number);
                                const newDate = new Date(year, month - 1, 1);
                                setSelectedDate(newDate);
                                reloadWithFilters(newDate);
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
                        <a href={(route as any)('timesheets.index')} className="ml-2 inline-flex items-center text-sm text-primary hover:underline">
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            {t('btn_back', 'Back To Timesheets')}
                        </a>
                    </div>
                </div>
                {/* Filter and Search Section */}
                <div className="mb-4 flex flex-col items-center gap-2 md:flex-row">
                    <Select
                        value={selectedEmployee}
                        onValueChange={(val) => {
                            setSelectedEmployee(val);
                            reloadWithFilters(selectedDate, val);
                        }}
                    >
                        <SelectTrigger className="w-full md:w-56">
                            <SelectValue placeholder={t('filter_by_employee', 'Filter by Employee')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_employees', 'All Employees')}</SelectItem>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                    {emp.first_name} {emp.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-full md:w-64">
                        <Input
                            type="text"
                            placeholder={t('search_employee', 'Search employee...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        <SearchIcon className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_monthly_view')}</CardTitle>
                        <CardDescription>View and manage timesheets for the entire month with overtime</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('file_number', 'File No.')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lbl_employee_column', 'Employee')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lbl_total_days', 'Total Days')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lbl_total_hours', 'Total Hours')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lbl_total_overtime', 'Total Overtime')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lbl_projects', 'Projects')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSummary.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {t('no_timesheet_data', 'No timesheet data available for this month.')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummary.map((emp, idx) => (
                                        <tr key={emp.employee.id || idx}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{emp.employee.file_number || ''}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.employee.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.total_days}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.total_hours}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.total_overtime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {emp.projects && emp.projects.length > 0 ? (
                                                    <ul className="ml-4 list-disc">
                                                        {emp.projects.map((proj, pidx) => (
                                                            <li key={proj.id || pidx}>
                                                                {proj.name}: {proj.hours}h / {proj.overtime} OT
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-gray-500">{t('no_projects', 'No Projects')}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                                                    <a
                                                        href={(route as any)('timesheets.pay-slip', {
                                                            employee: emp.employee.id,
                                                            month: format(selectedDate, 'yyyy-MM'),
                                                        })}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {t('btn_view_payslip', 'View Payslip')}
                                                    </a>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
