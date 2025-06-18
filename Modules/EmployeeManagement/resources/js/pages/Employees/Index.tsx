import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '../../types/index';
import AdminLayout from '../../layouts/AdminLayout';
import { Employee, Position } from '../../types/models';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, LoaderCircle, BriefcaseBusiness, Banknote, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';
import CreateButton from '@/components/shared/CreateButton';
import CrudButtons from '@/components/shared/CrudButtons';
import Permission from '@/components/Permission';
import { debounce } from 'lodash';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTranslation } from '@/utils/translation';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Employees', href: '/employees' },
];

interface Props extends PageProps {
  employees: {
    data: Employee[];
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
  filters: {
    search: string;
    status: string;
    department: string;
    position: string;
  };
  departments: Array<{ id: number; name: string }>;
  positions: Array<{ id: number; name: string }>;
  auth: any;
}

export default function Index({ auth, employees, filters, departments, positions }: Props) {
  const { t } = useTranslation('employees');

  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [department, setDepartment] = useState(filters.department || 'all');
  const [position, setPosition] = useState(filters.position || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = usePermission();

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    router.get(
      '/employees',
      { search: value, status, department, position },
      { preserveState: true, preserveScroll: true }
    );
  }, 300);

  const handleFilter = (type: string, value: string) => {
    const normalizedValue = value === 'all' ? '' : value;
    switch (type) {
      case 'status':
        setStatus(value);
        break;
      case 'department':
        setDepartment(value);
        break;
      case 'position':
        setPosition(value);
        break;
    }
    router.get(
      '/employees',
      {
        search,
        status: type === 'status' ? normalizedValue : (status === 'all' ? '' : status),
        department: type === 'department' ? normalizedValue : (department === 'all' ? '' : department),
        position: type === 'position' ? normalizedValue : (position === 'all' ? '' : position),
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline',
      terminated: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getAssignmentBadge = (assignment: Employee['current_assignment']) => {
    if (!assignment) return <Badge variant="outline">Unassigned</Badge>;

    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      project: 'default',
      rental: 'secondary',
      leave: 'outline',
    };

    return (
      <Badge variant={variants[assignment.type] || 'default'}>
        {assignment.type.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'dd MMM yyyy');
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout title={t('ttl_employees')} breadcrumbs={breadcrumbs} requiredPermission="employees.view">
      <Head title={t('ttl_employees')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Employees</CardTitle>
            <div className="flex items-center space-x-2">
              <Permission permission="employees.create">
                <CreateButton
                  resourceType="employees"
                  buttonVariant="default"
                  text="Add Employee"
                />
              </Permission>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('ph_search_employees')}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => handleFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('ph_filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">{t('on_leave')}</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={department}
                onValueChange={(value) => handleFilter('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('ph_filter_by_department')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('opt_all_departments')}</SelectItem>
                  {departments?.map((dept) => dept && (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {typeof dept.name === 'string' ? dept.name : JSON.stringify(dept.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={position}
                onValueChange={(value) => handleFilter('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('ph_filter_by_position')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('opt_all_positions')}</SelectItem>
                  {positions?.map((pos) => pos && (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {typeof pos.name === 'string' ? pos.name : JSON.stringify(pos.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status & Position</TableHead>
                    <TableHead>{t('current_assignment')}</TableHead>
                    <TableHead>{t('th_salary_info')}</TableHead>
                    <TableHead>{t('th_contact_details')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.data.map((employee) => (
                    <TableRow key={employee.id} className="align-top">
                      <TableCell className="min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {employee.first_name} {employee.middle_name} {employee.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {employee.employee_id || employee.file_number}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="inline-block w-3 h-3 mr-1" />
                            Hired: {formatDate(employee.hire_date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <div>
                            {getStatusBadge(employee.status)}
                          </div>
                          <div className="text-sm">
                            <BriefcaseBusiness className="inline-block w-3 h-3 mr-1" />
                            {typeof employee.position === 'string' ? employee.position : getTranslation(employee.position?.name) || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Dept: {typeof employee.department === 'string' ? employee.department : getTranslation(employee.department?.name) || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex flex-col gap-1">
                          {getAssignmentBadge(employee.current_assignment)}
                          {employee.current_assignment ? (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-sm line-clamp-1 cursor-help">{employee.current_assignment.name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{employee.current_assignment.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="inline-block w-3 h-3 mr-1" />
                                <span className="line-clamp-1">
                                  {employee.current_assignment.location || employee.current_location || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {employee.current_assignment.start_date && (
                                  <span>
                                    {formatDate(employee.current_assignment.start_date)}
                                    {employee.current_assignment.end_date && (
                                      <> - {formatDate(employee.current_assignment.end_date)}</>
                                    )}
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t('no_current_assignment')}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm">
                            <Banknote className="inline-block w-3 h-3 mr-1" />
                            <span className="font-medium">
                              {formatCurrency(employee.basic_salary)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              /month
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Hourly: {formatCurrency(employee.hourly_rate)}
                          </div>
                          {employee.advance_payment && employee.advance_payment > 0 && (
                            <Badge variant="destructive" className="w-fit text-xs mt-1">
                              Advance: {formatCurrency(employee.advance_payment)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${employee.email}`} className="text-sm hover:underline">
                            {employee.email}
                          </a>
                          <a href={`tel:${employee.phone}`} className="text-sm hover:underline">
                            {employee.phone}
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {employee.nationality}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <CrudButtons
                          resourceType="employees"
                          resourceId={employee.id}
                          resourceName={`${employee.first_name} ${employee.last_name}`}
                          className="justify-end"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No employees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {employees?.meta?.total > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {employees.meta.from} to {employees.meta.to} of {employees.meta.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!employees.links.prev}
                    onClick={() => router.get(employees.links.prev!)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!employees.links.next}
                    onClick={() => router.get(employees.links.next!)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
