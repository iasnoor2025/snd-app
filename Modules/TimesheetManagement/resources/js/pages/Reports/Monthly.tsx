import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
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
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
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

  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(filters?.month ? new Date(filters.month + '-01') : new Date());

  const reloadWithMonth = (date: Date) => {
    const monthParam = format(date, 'yyyy-MM');
    router.get((route as any)('timesheets.monthly'), { month: monthParam }, { preserveState: true, replace: true });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const firstDayOfMonth = startOfMonth(date);
      setSelectedDate(firstDayOfMonth);
      reloadWithMonth(firstDayOfMonth);
    }
  };

  const handlePreviousMonth = () => {
    const previousMonth = subMonths(selectedDate, 1);
    setSelectedDate(previousMonth);
    reloadWithMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    setSelectedDate(nextMonth);
    reloadWithMonth(nextMonth);
  };

  const handleExport = () => {
    toast({ description: t('export_started', 'Export Started') });
  };

  return (
    <AppLayout title={t('monthly_timesheets')} requiredPermission="timesheets.view">
      <Head title={t('monthly_timesheets')} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('monthly_timesheets')}</h1>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={format(selectedDate, 'yyyy-MM')}
              onValueChange={(value) => {
                const [year, month] = value.split('-').map(Number);
                const newDate = new Date(year, month - 1, 1);
                setSelectedDate(newDate);
                reloadWithMonth(newDate);
              }}
            >
              <SelectTrigger className="w-full sm:w-auto min-w-[140px]">
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
            <a href={(route as any)('timesheets.index')} className="inline-flex items-center text-sm text-primary hover:underline ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('btn_back', 'Back To Timesheets')}
            </a>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_monthly_view')}</CardTitle>
            <CardDescription>
              View and manage timesheets for the entire month with overtime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('lbl_employee_column', 'Employee')}</TableHead>
                  <TableHead>{t('lbl_total_days', 'Total Days')}</TableHead>
                  <TableHead>{t('lbl_total_hours', 'Total Hours')}</TableHead>
                  <TableHead>{t('lbl_total_overtime', 'Total Overtime')}</TableHead>
                  <TableHead>{t('lbl_projects', 'Projects')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {t('no_timesheet_data', 'No timesheet data available for this month.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.map((emp, idx) => (
                    <TableRow key={emp.employee.id || idx}>
                      <TableCell>{emp.employee.name}</TableCell>
                      <TableCell>{emp.total_days}</TableCell>
                      <TableCell>{emp.total_hours}</TableCell>
                      <TableCell>{emp.total_overtime}</TableCell>
                      <TableCell>
                        {emp.projects && emp.projects.length > 0 ? (
                          <ul className="list-disc ml-4">
                            {emp.projects.map((proj, pidx) => (
                              <li key={proj.id || pidx}>
                                {proj.name}: {proj.hours}h / {proj.overtime} OT
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground">{t('no_projects', 'No Projects')}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
