import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Modules/Core/resources/js/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Modules/Core/resources/js/components/ui/dropdown-menu';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Calendar } from '@/Modules/Core/resources/js/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Modules/Core/resources/js/components/ui/popover';
import { Calendar as CalendarIcon, Ellipsis, Plus } from 'lucide-react';

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
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );

  const fetchTimesheets = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const response = await axios.get(
        `/employees/${employeeId}/timesheets?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
      );
      setTimesheets(response.data.timesheets);
    } catch (error) {
      const err = error as any;
      if (err?.response?.status === 404) {
        setTimesheets([]);
      } else {
        console.error('Error fetching timesheets:', error);
        toast('Failed to load timesheets');
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
      toast({
        title: 'Success',
        description: 'Timesheet deleted successfully',
      })
      fetchTimesheets();
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      toast('Failed to delete timesheet');
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
  const { t } = useTranslation('employee');

    if (!dateTimeStr) return '-';
    try {
      return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateTimeStr;
    }
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

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
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 pl-3 pr-3 text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span>to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 pl-3 pr-3 text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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

















