import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    ToastService,
} from '@/Core';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Ellipsis, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Timesheet {
    id: number;
    employee_id: number;
    date: string;
    clock_in: string;
    clock_out: string;
    break_start: string | null;
    break_end: string | null;
    regular_hours: number;
    overtime_hours: number;
    total_hours: number;
    status: string;
    notes: string | null;
    project_id: number | null;
    project?: {
        id: number;
        name: string;
    };
}

interface TimesheetListProps {
    employeeId: number;
    onAddNew?: () => void;
    onEdit?: (timesheetId: number) => void;
}

export const TimesheetList: React.FC<TimesheetListProps> = ({ employeeId, onAddNew, onEdit }) => {
    const { t } = useTranslation('employees');
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const initialStart = new Date(currentYear, currentMonth, 1);
    const initialEnd = new Date(currentYear, currentMonth + 1, 0);
    const [startDate, setStartDate] = useState(format(initialStart, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(initialEnd, 'yyyy-MM-dd'));
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = [
        { value: 0, label: t('month_january') },
        { value: 1, label: t('month_february') },
        { value: 2, label: t('month_march') },
        { value: 3, label: t('month_april') },
        { value: 4, label: t('month_may') },
        { value: 5, label: t('month_june') },
        { value: 6, label: t('month_july') },
        { value: 7, label: t('month_august') },
        { value: 8, label: t('month_september') },
        { value: 9, label: t('month_october') },
        { value: 10, label: t('month_november') },
        { value: 11, label: t('month_december') },
    ];
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setSelectedMonth(newMonth);
        updateDateRange(newMonth, selectedYear);
    };
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setSelectedYear(newYear);
        updateDateRange(selectedMonth, newYear);
    };
    function updateDateRange(month: number, year: number) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
    }

    const fetchTimesheets = async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        try {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            const response = await axios.get(
                `/api/v1/employees/${employeeId}/timesheets?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
            );
            setTimesheets((response.data.timesheets || []).filter((t: any) => t.regular_hours > 0 || t.overtime_hours > 0 || t.status !== undefined));
        } catch (error) {
            const err = error as any;
            if (err?.response?.status === 404) {
                setTimesheets([]);
            } else {
                console.error('Error fetching timesheets:', error);
                ToastService.error(t('msg_failed_load_timesheets'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTimesheets();
    }, [employeeId, startDate, endDate]);

    const deleteTimesheet = async (timesheetId: number) => {
        if (!confirm(t('msg_confirm_delete_timesheet'))) {
            return;
        }

        try {
            await axios.delete(`/employees/${employeeId}/timesheets/${timesheetId}`);
            ToastService.success(t('msg_timesheet_deleted'));
            fetchTimesheets();
        } catch (error) {
            console.error('Error deleting timesheet:', error);
            ToastService.error(t('msg_failed_delete_timesheet'));
        }
    };

    const formatDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return '-';
        try {
            return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
        } catch (error) {
            return dateTimeStr;
        }
    };

    function formatHours(hours: any) {
        const num = Number(hours);
        if (isNaN(num) || hours === undefined || hours === null) return '0.00';
        return num.toFixed(2);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">{t('status_approved')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">{t('status_pending')}</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500">{t('status_rejected')}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('timesheets_title')}</CardTitle>
                <div className="flex space-x-2">
                    <div className="flex items-center gap-2">
                        <select value={selectedMonth} onChange={handleMonthChange} className="rounded-md border border-input bg-background px-2 py-1">
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select value={selectedYear} onChange={handleYearChange} className="rounded-md border border-input bg-background px-2 py-1">
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                    {onAddNew && (
                        <Button onClick={onAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('btn_add_timesheet')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : timesheets.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">{t('no_timesheets_found')}</div>
                ) : (
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('th_date')}</TableHead>
                                    <TableHead>{t('th_clock_in')}</TableHead>
                                    <TableHead>{t('th_clock_out')}</TableHead>
                                    <TableHead>{t('th_break')}</TableHead>
                                    <TableHead>{t('th_regular_hours')}</TableHead>
                                    <TableHead>{t('th_overtime')}</TableHead>
                                    <TableHead>{t('th_total')}</TableHead>
                                    <TableHead>{t('th_project')}</TableHead>
                                    <TableHead>{t('th_status')}</TableHead>
                                    <TableHead className="text-right">{t('th_actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timesheets.map((timesheet) => (
                                    <TableRow key={timesheet.id}>
                                        <TableCell>{timesheet.date ? format(new Date(timesheet.date), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell>{formatDateTime(timesheet.clock_in)}</TableCell>
                                        <TableCell>{formatDateTime(timesheet.clock_out)}</TableCell>
                                        <TableCell>
                                            {timesheet.break_start && timesheet.break_end
                                                ? `${format(parseISO(timesheet.break_start), 'h:mm a')} - ${format(
                                                      parseISO(timesheet.break_end),
                                                      'h:mm a',
                                                  )}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{formatHours(timesheet.regular_hours)}</TableCell>
                                        <TableCell>{formatHours(timesheet.overtime_hours)}</TableCell>
                                        <TableCell>{formatHours(timesheet.total_hours)}</TableCell>
                                        <TableCell>{timesheet.project ? timesheet.project.name : '-'}</TableCell>
                                        <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">{t('open_menu')}</span>
                                                        <Ellipsis className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit && onEdit(timesheet.id)}
                                                        disabled={timesheet.status === 'approved'}
                                                    >
                                                        {t('btn_edit')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteTimesheet(timesheet.id)}
                                                        disabled={timesheet.status === 'approved'}
                                                        className="text-red-600"
                                                    >
                                                        {t('btn_delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
