import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '../../../../../../resources/js/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../../../resources/js/components/ui/card';
import { Badge } from '../../../../../../resources/js/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../../resources/js/components/ui/table';
import {
  Progress,
} from '../../../../../../resources/js/components/ui/progress';
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  User as UserIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../../../resources/js/components/ui/breadcrumb';
import AdminLayout from '../../../../../EmployeeManagement/resources/js/layouts/AdminLayout';
import { format } from 'date-fns';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
}

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

interface BalanceDetail {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
  percentage: number;
  requests: LeaveRequest[];
}

interface PageProps {
  employee: Employee;
  balanceDetails: BalanceDetail[];
  currentYear: number;
}

const LeaveBalanceShow: React.FC = () => {
  const { employee, balanceDetails, currentYear } = usePage<PageProps>().props;

  const getStatusColor = (percentage: number) => {
  const { t } = useTranslation('leave');

    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalAllocated = balanceDetails.reduce((sum, detail) => sum + detail.allocated, 0);
  const totalUsed = balanceDetails.reduce((sum, detail) => sum + detail.used, 0);
  const totalRemaining = balanceDetails.reduce((sum, detail) => sum + detail.remaining, 0);
  const overallPercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <AdminLayout>
      <Head title={`Leave Balance - ${employee.first_name} ${employee.last_name}`} />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={route('leaves.balances.index')}>{t('leave_balances')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{employee.first_name} {employee.last_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('leaves.balances.index')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Balances
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-muted-foreground">
                Leave balance details for {currentYear}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Employee Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              {t('employee:employee_information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('lbl_employee_id')}</label>
                <p className="text-sm font-semibold">{employee.employee_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm font-semibold">{employee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Year</label>
                <p className="text-sm font-semibold">{currentYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_allocated')}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAllocated}</div>
              <p className="text-xs text-muted-foreground">
                Days allocated this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_used')}</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsed}</div>
              <p className="text-xs text-muted-foreground">
                Days used so far
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRemaining}</div>
              <p className="text-xs text-muted-foreground">
                Days remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_usage_rate')}</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Overall utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leave Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_leave_type_breakdown')}</CardTitle>
            <CardDescription>
              Detailed breakdown by leave type for {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {balanceDetails.map((detail) => (
                <div key={detail.type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">{detail.type} Leave</h3>
                    <Badge variant="outline">
                      {detail.used}/{detail.allocated} days
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('usage_progress')}</span>
                      <span className={getStatusColor(detail.percentage)}>
                        {detail.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={detail.percentage} className="h-3" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Allocated:</span>
                      <span className="ml-2 font-semibold">{detail.allocated} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <span className="ml-2 font-semibold">{detail.used} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="ml-2 font-semibold">{detail.remaining} days</span>
                    </div>
                  </div>

                  {detail.requests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">{t('recent_requests')}</h4>
                      <div className="space-y-2">
                        {detail.requests.slice(0, 3).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {formatDate(request.start_date)} - {formatDate(request.end_date)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {calculateDays(request.start_date, request.end_date)} days • {request.reason}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                        ))}
                        {detail.requests.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{detail.requests.length - 3} more requests
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>All Leave Requests ({currentYear})</CardTitle>
            <CardDescription>
              Complete history of approved leave requests for this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>{t('lbl_start_date')}</TableHead>
                    <TableHead>{t('end_date')}</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balanceDetails.flatMap(detail =>
                    detail.requests.map(request => ({
                      ...request,
                      type: detail.type
                    }))
                  ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium capitalize">
                        {request.type}
                      </TableCell>
                      <TableCell>{formatDate(request.start_date)}</TableCell>
                      <TableCell>{formatDate(request.end_date)}</TableCell>
                      <TableCell>
                        {calculateDays(request.start_date, request.end_date)} days
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {balanceDetails.every(detail => detail.requests.length === 0) && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leave requests found for {currentYear}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default LeaveBalanceShow;
