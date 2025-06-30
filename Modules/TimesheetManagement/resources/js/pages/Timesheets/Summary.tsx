import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
// Placeholder types
type PageProps = any;
type BreadcrumbItem = any;
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
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  FileText as FileTextIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  BarChart as BarChartIcon,
  Clock as ClockIcon,
  User as UserIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
} from 'lucide-react';
import { useToast } from "@/Core";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Timesheets', href: '/timesheets' },
  { title: 'Monthly Summary', href: '#' }
];

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
  employee_stats: {
    employee_id: number;
    employee: Employee;
    total_hours: number;
    total_overtime: number;
    total_timesheets: number;
  }[];
  project_stats: {
    project_id: number;
    project: Project;
    total_hours: number;
    percentage: number;
  }[];
  status_stats: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

interface Props extends PageProps {
  summary: TimesheetSummary;
  employees: Employee[];
  projects: Project[];
}

export default function TimesheetSummary({ auth, summary, employees = [], projects = [] }: Props) {
  const { t } = useTranslation('TimesheetManagement');

  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Here you would fetch new data based on the selected date
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    // Here you would filter data based on the selected employee
    // Only filter if not "all"
    if (employeeId !== 'all') {
      // Filter logic here
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    // Here you would filter data based on the selected project
    // Only filter if not "all"
    if (projectId !== 'all') {
      // Filter logic here
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your monthly summary export is being prepared."
    });

    // Here you would implement the actual export functionality
    // For example, making an API call to generate a PDF or Excel file
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
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

  return (
    <AppLayout>
      <Head title={t('ttl_monthly_timesheet_summary')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChartIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('monthly_summary')}</h1>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={route('hr.api.timesheets.index')}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {t('back_to_timesheets')}
              </Link>
            </Button>

            <Button variant="default" onClick={handleExport}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('total_hours')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{summary.total_hours}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Including {summary.total_overtime} overtime hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_employees')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{summary.employee_stats.length}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted {summary.total_timesheets} timesheets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Month</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'MMMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5" />
                Employee Summary
              </CardTitle>
              <CardDescription>
                Hours worked by each employee
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <Select
                  value={selectedEmployee}
                  onValueChange={handleEmployeeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ph_filter_by_employee')} />
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Overtime</TableHead>
                      <TableHead className="text-right">Timesheets</TableHead>
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
                Project Distribution
              </CardTitle>
              <CardDescription>
                Hours distribution by project
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <Select
                  value={selectedProject}
                  onValueChange={handleProjectSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ph_filter_by_project')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('opt_all_projects')}</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {summary.project_stats.map((stat) => (
                  <div key={stat.project_id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{stat.project.name}</span>
                      <span>{stat.total_hours} hrs ({stat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" />
              Status Overview
            </CardTitle>
            <CardDescription>
              Timesheet status distribution
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {summary.status_stats.map((stat) => (
                <Card key={stat.status} className="border-none shadow-none">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">
                        {getStatusBadge(stat.status)}
                      </div>
                      <div className="text-2xl font-bold">{stat.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.percentage}% of total
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}














