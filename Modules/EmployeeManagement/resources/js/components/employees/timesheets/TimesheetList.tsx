import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { ToastService } from '@/Core';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Core";
import { Badge } from "@/Core";
import { Input } from "@/Core";
import { Calendar } from "@/Core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core";
import { Calendar as CalendarIcon, Ellipsis, Plus } from 'lucide-react';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

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

export const TimesheetList: React.FC<TimesheetListProps> = ({
  employeeId,
  onAddNew,
  onEdit,
}) => {
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
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { t } = useTranslation();

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
        `/api/v1/employees/${employeeId}/timesheets?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
      );
      setTimesheets((response.data.timesheets || []).filter((t: any) => (t.regular_hours > 0 || t.overtime_hours > 0 || t.status !== undefined)));
    } catch (error) {
      const err = error as any;
      if (err?.response?.status === 404) {
        setTimesheets([]);
      } else {
        console.error('Error fetching timesheets:', error);
        ToastService.error('Failed to load timesheets');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [employeeId, startDate, endDate]);

  const deleteTimesheet = async (timesheetId: number) => {
    if (!confirm('Are you sure you want to delete this timesheet?')) {
      return;
    }

    try {
      await axios.delete(`/employees/${employeeId}/timesheets/${timesheetId}`);
      ToastService.success('Timesheet deleted successfully');
      fetchTimesheets();
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      ToastService.error('Failed to delete timesheet');
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
        return <Badge className="bg-green-500">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timesheets</CardTitle>
        <div className="flex space-x-2">
          <div className="flex items-center gap-2">
            <select value={selectedMonth} onChange={handleMonthChange} className="rounded-md border border-input bg-background px-2 py-1">
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={handleYearChange} className="rounded-md border border-input bg-background px-2 py-1">
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No timesheets found for the selected period.
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>{t('th_clock_in')}</TableHead>
                  <TableHead>{t('th_clock_out')}</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>{t('regular_hours')}</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell>
                      {timesheet.date ? format(new Date(timesheet.date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>{formatDateTime(timesheet.clock_in)}</TableCell>
                    <TableCell>{formatDateTime(timesheet.clock_out)}</TableCell>
                    <TableCell>
                      {timesheet.break_start && timesheet.break_end
                        ? `${format(parseISO(timesheet.break_start), 'h:mm a')} - ${format(
                            parseISO(timesheet.break_end),
                            'h:mm a'
                          )}`
                        : '-'}
                    </TableCell>
                    <TableCell>{formatHours(timesheet.regular_hours)}</TableCell>
                    <TableCell>{formatHours(timesheet.overtime_hours)}</TableCell>
                    <TableCell>{formatHours(timesheet.total_hours)}</TableCell>
                    <TableCell>
                      {timesheet.project ? timesheet.project.name : '-'}
                    </TableCell>
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteTimesheet(timesheet.id)}
                            disabled={timesheet.status === 'approved'}
                            className="text-red-600"
                          >
                            Delete
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

















