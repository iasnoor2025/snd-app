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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    ToastService,
} from '@/Core';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Ellipsis, Plus } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
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

    const handleMonthChange = (value: string) => {
        const newMonth = parseInt(value, 10);
        setSelectedMonth(newMonth);
        updateDateRange(newMonth, selectedYear);
        setCurrentPage(1); // Reset to first page when changing month
    };

    const handleYearChange = (value: string) => {
        const newYear = parseInt(value, 10);
        setSelectedYear(newYear);
        updateDateRange(selectedMonth, newYear);
        setCurrentPage(1); // Reset to first page when changing year
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
                `/api/v1/employees/${employeeId}/timesheets?start_date=${formattedStartDate}&end_date=${formattedEndDate}&page=${currentPage}&per_page=${perPage}`,
            );

            // Handle paginated response
            if (response.data.timesheets) {
                setTimesheets(response.data.timesheets || []);
                setTotalItems(response.data.total || 0);
            } else {
                setTimesheets([]);
                setTotalItems(0);
            }
        } catch (error) {
            const err = error as any;
            if (err?.response?.status === 404) {
                setTimesheets([]);
                setTotalItems(0);
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
    }, [employeeId, startDate, endDate, currentPage, perPage]);

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
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">{t('status_approved')}</Badge>;
            case 'pending':
                return <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">{t('status_pending')}</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">{t('status_rejected')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / perPage);
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);





    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('timesheets_title')}</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder={t('select_month')} />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value.toString()}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder={t('select_year')} />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    <>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_clock_in')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_clock_out')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_break')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_regular_hours')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_overtime')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_total')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_project')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_status')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('th_actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {timesheets.map((timesheet) => (
                                        <tr key={timesheet.id} className="align-top">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {timesheet.date ? format(new Date(timesheet.date), 'MMM d, yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {formatDateTime(timesheet.clock_in)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {formatDateTime(timesheet.clock_out)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {timesheet.break_start && timesheet.break_end
                                                    ? `${format(parseISO(timesheet.break_start), 'h:mm a')} - ${format(
                                                          parseISO(timesheet.break_end),
                                                          'h:mm a',
                                                      )}`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {formatHours(timesheet.regular_hours)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {formatHours(timesheet.overtime_hours)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {formatHours(timesheet.total_hours)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {timesheet.project ? timesheet.project.name : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(timesheet.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalItems > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        {t('showing_results', { start: startItem, end: endItem, total: totalItems })}
                                        <div className="mt-1 text-xs opacity-60">
                                            {t('page_of', { current: currentPage, total: totalPages })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">{t('rows_per_page')}:</span>
                                            <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                                <SelectTrigger className="w-[70px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[10, 25, 50, 100].map((value) => (
                                                        <SelectItem key={value} value={value.toString()}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            {getPageNumbers().map((page, index) => (
                                                <React.Fragment key={index}>
                                                    {page === '...' ? (
                                                        <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                                                    ) : (
                                                        <Button
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePageChange(page as number)}
                                                            className="min-w-[32px]"
                                                        >
                                                            {page}
                                                        </Button>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
