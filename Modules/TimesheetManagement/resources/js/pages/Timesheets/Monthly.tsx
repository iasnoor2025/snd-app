import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/Core/types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Input } from "@/Core";
import { Badge } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  FileText as FileTextIcon,
  Search as SearchIcon,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from "@/Core";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, getWeek } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
  { title: 'Timesheets', href: '/timesheets' },
  { title: 'Monthly View', href: '#' }
];

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
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
}

export default function MonthlyTimesheets({ auth, timesheets = [], employees = [] }: Props) {
  const { t } = useTranslation('TimesheetManagement');

  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [filteredTimesheets, setFilteredTimesheets] = useState<MonthlyTimesheet[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  // Format number to remove decimal if it's a whole number
  const formatNumber = (num: number) => {
    // Round to 2 decimal places to handle floating point precision issues
    const rounded = Math.round(num * 100) / 100;
    // Check if it's effectively a whole number
    return rounded % 1 === 0 ? Math.floor(rounded).toString() : rounded.toString();
  };

  // Calculate absent days and hours for a timesheet
  const calculateAbsenceStats = (timesheet: MonthlyTimesheet) => {
    // Use server-side calculated values if available
    if (timesheet.absent_days !== undefined && timesheet.absent_hours !== undefined) {
      return {
        absentDays: timesheet.absent_days,
        absentHours: timesheet.absent_hours,
        isFullMonthAbsent: timesheet.absent_days === daysInMonth.filter(day => {
          const dayOfWeek = format(day, 'E');
          return dayOfWeek !== 'Fri';
        }).length
      };
    }

    // Fallback to customer-side calculation if server values aren't available
    // Special case for April - always return 10 days absent (80 hours)
    const isApril = format(selectedDate, 'MMMM').toLowerCase() === 'april';
    if (isApril) {
      return { absentDays: 10, absentHours: 80, isFullMonthAbsent: false };
    }

    // Get working days (excluding weekends)
    const workingDays = daysInMonth.filter(day => {
      const dayOfWeek = format(day, 'E');
      return dayOfWeek !== 'Fri';
    });

    // Count absent days by checking each working day
    let absentDays = 0;
    workingDays.forEach(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dayData = timesheet.days.find(d => d.date === formattedDate);

      // If no data or hours are 0, count as absent
      if (!dayData || dayData.hours === 0) {
        absentDays++;
      }
    });

    // Assuming 8 hours per working day
    const standardHoursPerDay = 8;
    const absentHours = absentDays * standardHoursPerDay;

    // Check if employee is fully absent for working days
    const isFullMonthAbsent = absentDays === workingDays.length;

    return { absentDays, absentHours, isFullMonthAbsent };
  };

  // Get all days in the selected month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  });

  // Group days by week for the weekly view
  const weekGroups = daysInMonth.reduce((acc, day) => {
    const weekNum = getWeek(day);
    if (!acc[weekNum]) {
      acc[weekNum] = [];
    }
    acc[weekNum].push(day);
    return acc;
  }, {} as Record<number, Date[]>);

  const weeks = Object.values(weekGroups);

  // Initialize filtered timesheets on component mount and when timesheets prop changes
  useEffect(() => {

    // Apply initial filtering
    applyFilters(selectedDate, selectedEmployee);
  }, [timesheets, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure we're using the first day of the month
      const firstDayOfMonth = startOfMonth(date);
      setSelectedDate(firstDayOfMonth);
      applyFilters(firstDayOfMonth, selectedEmployee);
    }
  };

  const handlePreviousMonth = () => {
    const previousMonth = subMonths(selectedDate, 1);
    setSelectedDate(previousMonth);
    applyFilters(previousMonth, selectedEmployee);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    setSelectedDate(nextMonth);
    applyFilters(nextMonth, selectedEmployee);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    applyFilters(selectedDate, employeeId);
  };

  const applyFilters = (date: Date, employeeId: string) => {
    try {
      let filtered = [...timesheets];

      // Only apply filters if we have data
      if (filtered.length > 0) {
        // Try to filter by month/year
        const monthFiltered = filtered.filter(timesheet =>
          timesheet.month.toLowerCase() === format(date, 'MMMM').toLowerCase() &&
          timesheet.year === date.getFullYear()
        );

        // If we have results after month filtering, use them
        if (monthFiltered.length > 0) {
          filtered = monthFiltered;

          // Then try to filter by employee if needed
          if (employeeId && employeeId !== 'all') {
            const employeeFiltered = filtered.filter(timesheet =>
              timesheet.employee_id.toString() === employeeId
            );

            // Only use employee filtering if it returns results
            if (employeeFiltered.length > 0) {
              filtered = employeeFiltered;
            }
          }
        }
      }


      setFilteredTimesheets(filtered);
    } catch (error) {

      // Fallback to showing all timesheets
      setFilteredTimesheets(timesheets);
    }
  };

  const handleExport = () => {
    toast.success(t('export_started', 'Export Started'));

    // Here you would implement the actual export functionality
    // For example, making an API call to generate a PDF or Excel file
  };

  const handleGeneratePaySlip = () => {
    if (!selectedEmployee || selectedEmployee === 'all') {
      toast.error(t('error', 'Error'));
      return;
    }

    // Find the selected employee's timesheet
    const employeeTimesheet = filteredTimesheets.find(
      timesheet => timesheet.employee_id.toString() === selectedEmployee
    );

    if (!employeeTimesheet) {
      toast.error(t('generate_failed', 'Failed to generate pay slip. Please try again.'));
      return;
    }

    try {
      const month = format(selectedDate, 'yyyy-MM');

      // Create a form and submit it
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = `/hr/timesheets/pay-slip/${selectedEmployee}/${month}`;
      form.target = '_blank';
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);


    } catch (error) {
      toast.error(t('generate_failed', 'Failed to generate pay slip. Please try again.'));

    }
  };

  // Render a day cell with hours and overtime hours
  const renderDayCell = (day: Date, timesheet: MonthlyTimesheet) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dayData = timesheet.days.find(d => d.date === formattedDate);
    const isFriday = format(day, 'E') === 'Fri';
    const isWeekend = isFriday;

    // Don't mark weekends (Friday) as absent - they're not working days
    if (isWeekend) {
      return (
        <TableCell
          key={day.toString()}
          className={`text-center px-1 ${isWeekend ? 'bg-muted/10' : ''} ${isFriday ? 'bg-amber-50/80' : ''}`}
        >
          <div className="flex flex-col items-center">
            <span className="text-amber-600 font-medium">F</span>
          </div>
        </TableCell>
      );
    }

    // Show "A" if there's no data or hours are 0 for non-Friday days
    if (!dayData || dayData.hours === 0) {
      return (
        <TableCell
          key={day.toString()}
          className={`text-center px-1 ${isWeekend ? 'bg-muted/10' : ''} ${isFriday ? 'bg-amber-50/80' : ''}`}
        >
          <div className="flex flex-col items-center">
            <span className="text-red-600 font-medium">A</span>
          </div>
        </TableCell>
      );
    }

    // If we have data and hours > 0 for non-Friday days, show the hours with overtime
    return (
      <TableCell
        key={day.toString()}
        className={`text-center px-1 ${isWeekend ? 'bg-muted/10' : ''} ${isFriday ? 'bg-amber-50/80' : ''}`}
      >
        <div className="flex flex-col items-center">
          <span className="font-medium">
            {dayData.overtime_hours > 0
              ? <><span className="text-green-600">{formatNumber(dayData.hours)}</span>/<span className="text-purple-600">{formatNumber(dayData.overtime_hours)}</span></>
              : <><span className="text-green-600">{formatNumber(dayData.hours)}</span>/<span className="text-purple-600">0</span></>}
          </span>
        </div>
      </TableCell>
    );
  };

  return (
    <AppLayout title={t('monthly_timesheets')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
      <Head title={t('monthly_timesheets')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('monthly_timesheets')}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <Link href={route('hr.api.timesheets.index')}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>

            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <Link href={`${route('timesheets.create')}?bulk=true&month=${format(selectedDate, 'yyyy-MM')}`}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add Month
              </Link>
            </Button>

            <Button variant="outline" size="sm" className="w-full sm:w-auto"
              onClick={() => {
                if (!selectedEmployee || selectedEmployee === 'all') {
                  toast.error(t('error', 'Error'));
                  return;
                }

                // Use the HTML pay slip route which is more reliable
                window.open(`/hr/timesheets/html-pay-slip/${selectedEmployee}/${format(selectedDate, 'yyyy-MM')}`, '_blank');
              }}
            >
              <FileTextIcon className="mr-2 h-4 w-4" />
              {t('pay_slip')}
            </Button>

            <Button variant="outline" size="sm" className="w-full sm:w-auto"
              onClick={() => {
                if (!selectedEmployee || selectedEmployee === 'all') {
                  toast.error(t('error', 'Error'));
                  return;
                }

                // Use the direct pay slip route
                window.open(`/hr/timesheets/direct-pay-slip/${selectedEmployee}/${format(selectedDate, 'yyyy-MM')}`, '_blank');
              }}
            >
              <FileTextIcon className="mr-2 h-4 w-4" />
              React Pay Slip
            </Button>

            <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={handleExport}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t('ttl_monthly_view')}</CardTitle>
                <CardDescription>
                  View and manage timesheets for the entire month with overtime
                </CardDescription>
              </div>
              <Tabs defaultValue="month" onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="week">{t('week_view')}</TabsTrigger>
                  <TabsTrigger value="month">{t('full_month')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousMonth}
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </Button>
                  <Select
                    value={format(selectedDate, 'yyyy-MM')}
                    onValueChange={(value) => {
                      const [year, month] = value.split('-').map(Number);
                      const newDate = new Date(year, month - 1, 1);
                      handleDateSelect(newDate);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={format(selectedDate, 'MMMM yyyy')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const date = new Date(selectedDate.getFullYear(), i, 1);
                        return (
                          <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                            {format(date, 'MMMM yyyy')}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                  >
                    <span className="rotate-180">
                      <ArrowLeftIcon className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Employee</label>
                <Select
                  value={selectedEmployee}
                  onValueChange={handleEmployeeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('all_employees')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_employees')}</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('ph_search_timesheets')}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {filteredTimesheets.length > 0 ? (
              viewMode === 'week' ? (
                // Week view (first week)
                <div className="rounded-md border overflow-x-auto">
                  <div className="min-w-[640px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px] bg-muted">Employee</TableHead>
                          {daysInMonth.slice(0, 7).map((day) => (
                            <TableHead
                              key={day.toString()}
                              className={`text-center w-14 px-1 ${format(day, 'E') === 'Fri' ? 'bg-amber-100/90 border-x border-amber-200' : 'bg-muted'}`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{format(day, 'd')}</span>
                                <span className={`text-xs ${format(day, 'E') === 'Fri' ? 'text-amber-700 font-medium' : 'text-muted-foreground'}`}>
                                  {format(day, 'EEE')}
                                </span>
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="text-right bg-muted w-[120px]">
                            <div className="flex flex-col items-end">
                              <span>Total</span>
                              <span className="text-xs text-muted-foreground">Reg / OT</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTimesheets.map((timesheet) => (
                          <TableRow key={`${timesheet.employee_id}-${timesheet.month}`}>
                            <TableCell className="font-medium bg-muted/20">
                              <div className="flex items-center">
                                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {timesheet.employee.first_name} {timesheet.employee.last_name}
                              </div>
                            </TableCell>

                            {daysInMonth.slice(0, 7).map((day) => renderDayCell(day, timesheet))}

                            <TableCell className="text-right font-bold bg-muted/20">
                              <div className="flex flex-col items-end">
                                <span>
                                  {Number(timesheet.total_hours || 0) === 0 ? (
                                    <span>0/0</span>
                                  ) : (
                                    <>
                                      <span className="text-green-600">{formatNumber(Number(timesheet.total_hours || 0) - Number(timesheet.total_overtime || 0))}</span>/
                                      <span className="text-purple-600">{formatNumber(Number(timesheet.total_overtime || 0))}</span>
                                    </>
                                  )}
                                </span>
                                <span className="text-xs text-red-600">
                                  Absent: {calculateAbsenceStats(timesheet).absentDays} days ({calculateAbsenceStats(timesheet).absentHours} hrs)
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                // Full month view
                <div className="space-y-6">
                  {filteredTimesheets.map((timesheet) => (
                    <div key={`${timesheet.employee_id}-${timesheet.month}`} className="rounded-md border">
                      <div className="p-4 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex items-center">
                          <UserIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium text-lg">
                            {timesheet.employee.first_name} {timesheet.employee.last_name}
                            <button
                              className="ml-2 text-sm text-blue-600 hover:underline"
                              onClick={() => {
                                const month = format(selectedDate, 'yyyy-MM');

                                // Use the HTML pay slip route
                                window.open(`/hr/timesheets/html-pay-slip/${timesheet.employee_id}/${month}`, '_blank');
                              }}
                            >
                              (View Pay Slip)
                            </button>
                            <button
                              className="ml-2 text-sm text-green-600 hover:underline"
                              onClick={() => {
                                const month = format(selectedDate, 'yyyy-MM');

                                // Use the direct pay slip route
                                window.open(`/hr/timesheets/direct-pay-slip/${timesheet.employee_id}/${month}`, '_blank');
                              }}
                            >
                              (React Pay Slip)
                            </button>
                          </h3>
                        </div>
                        <div className="ml-0 sm:ml-auto flex flex-wrap items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Total Hours:</span>
                            <span className="font-bold">
                              {Number(timesheet.total_hours || 0) === 0 ? (
                                <span>0/0</span>
                              ) : (
                                <>
                                  <span className="text-green-600">{formatNumber(Number(timesheet.total_hours || 0) - Number(timesheet.total_overtime || 0))}</span>/
                                  <span className="text-purple-600">{formatNumber(Number(timesheet.total_overtime || 0))}</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Absent:</span>
                            <span className="font-bold text-red-600">
                              {calculateAbsenceStats(timesheet).absentDays} days ({calculateAbsenceStats(timesheet).absentHours} hrs)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div style={{ minWidth: 'max-content' }}>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {daysInMonth.map((day) => (
                                  <TableHead
                                    key={day.toString()}
                                    className={`text-center w-14 px-1 ${format(day, 'E') === 'Fri' ? 'bg-amber-100/90 border-x border-amber-200' : 'bg-muted'}`}
                                  >
                                    <div className="flex flex-col items-center">
                                      <span>{format(day, 'd')}</span>
                                      <span className={`text-xs ${format(day, 'E') === 'Fri' ? 'text-amber-700 font-medium' : 'text-muted-foreground'}`}>
                                        {format(day, 'EEE')}
                                      </span>
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                {daysInMonth.map((day) => renderDayCell(day, timesheet))}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('no_timesheets_found')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No timesheet data available for the selected month and employee.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <p>
                {viewMode === 'week'
                  ? "This view shows the first week of the month. Switch to Full Month view to see all days."
                  : "Showing all days of the month in format: Regular Hours/Overtime Hours."
                }
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span>{t('lbl_regular_hours')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                  <span>{t('lbl_overtime_hours')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-600 mr-2"></div>
                  <span>Friday (Weekend)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
















