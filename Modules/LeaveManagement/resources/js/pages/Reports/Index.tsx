import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Badge } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { CalendarIcon, DownloadIcon, FilterIcon, TrendingUpIcon, UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, BarChart3Icon } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/Core";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from "@/Core";
import { Calendar } from "@/Core";
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

// Temporary inline permission hook
const usePermission = () => {
    return {
        can: (permission: string) => true, // Simplified for now
    };
};

interface Employee {
    value: number;
    label: string;
}

interface Department {
    value: number;
    label: string;
}

interface LeaveType {
    value: number;
    label: string;
}

interface SummaryData {
    total_requests: number;
    approved_requests: number;
    pending_requests: number;
    rejected_requests: number;
    total_days: number;
    by_leave_type: Array<{
        leave_type: string;
        count: number;
        total_days: number;
    }>;
    by_status: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    monthly_trend: Array<{
        period: string;
        requests: number;
        days: number;
    }>;
}

interface DetailedData {
    leaves: {
        data: Array<{
            id: number;
            employee: {
                id: number;
                name: string;
                employee_id: string;
                department: string;
            };
            leave_type: {
                id: number;
                name: string;
                color: string;
            };
            start_date: string;
            end_date: string;
            total_days: number;
            status: string;
            reason: string;
            applied_at: string;
            approved_at?: string;
            approver?: {
                name: string;
                employee_id: string;
            };
        }>;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface BalanceData {
    employees: Array<{
        id: number;
        name: string;
        employee_id: string;
        department: string;
        balances: Array<{
            leave_type: string;
            allocated: number;
            used: number;
            remaining: number;
            carried_forward: number;
        }>;
        total_allocated: number;
        total_used: number;
        total_remaining: number;
    }>;
}

interface TrendsData {
    monthly_trend: Array<{
        period: string;
        requests: number;
        days: number;
    }>;
    yearly_comparison: {
        current_year: {
            year: number;
            requests: number;
            days: number;
        };
        previous_year: {
            year: number;
            requests: number;
            days: number;
        };
    };
    seasonal_analysis: Array<{
        season: string;
        requests: number;
    }>;
    peak_periods: Array<{
        month: string;
        requests: number;
    }>;
}

interface DepartmentData {
    departments: Array<{
        name: string;
        total_requests: number;
        approved_requests: number;
        approval_rate: number;
        total_days: number;
        by_leave_type: Array<{
            leave_type: string;
            requests: number;
            days: number;
        }>;
    }>;
}

interface PageProps {
    filters: {
        date_from: string;
        date_to: string;
        employee_id?: number;
        department_id?: number;
        leave_type_id?: number;
        status?: string;
        report_type: string;
    };
    data: SummaryData | DetailedData | BalanceData | TrendsData | DepartmentData;
    employees: Employee[];
    departments: Department[];
    leaveTypes: LeaveType[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function ReportsIndex() {
  const { t } = useTranslation('leave');

    const { 
        filters = { 
            date_from: '', 
            date_to: '', 
            report_type: 'summary' 
        }, 
        data = null, 
        employees = [], 
        departments = [], 
        leaveTypes = [] 
    } = usePage<PageProps>().props;
    const { can } = usePermission();

    const [localFilters, setLocalFilters] = useState(filters);
    const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
        const date = new Date(filters.date_from);
        return isNaN(date.getTime()) ? undefined : date;
    });
    const [dateTo, setDateTo] = useState<Date | undefined>(() => {
        const date = new Date(filters.date_to);
        return isNaN(date.getTime()) ? undefined : date;
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleFilterChange = (key: string, value: string | number | undefined) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        const params = {
            ...localFilters,
            date_from: dateFrom && !isNaN(dateFrom.getTime()) ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            date_to: dateTo && !isNaN(dateTo.getTime()) ? format(dateTo, 'yyyy-MM-dd') : undefined,
        };

        router.get(route('leaves.reports.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultFilters = {
            date_from: format(firstDayOfMonth, 'yyyy-MM-dd'),
            date_to: format(now, 'yyyy-MM-dd'),
            report_type: 'summary',
        };
        setLocalFilters(defaultFilters);
        setDateFrom(firstDayOfMonth);
        setDateTo(now);

        router.get(route('leaves.reports.index'), defaultFilters);
    };

    const exportReport = async (format: string) => {
        if (!can('leave-reports.export')) {
            toast.error('You do not have permission to export reports.');
            return;
        }

        setIsExporting(true);
        try {
            const params = {
                ...localFilters,
                date_from: dateFrom && !isNaN(dateFrom.getTime()) ? format(dateFrom, 'yyyy-MM-dd') : undefined,
                date_to: dateTo && !isNaN(dateTo.getTime()) ? format(dateTo, 'yyyy-MM-dd') : undefined,
                format,
            };

            window.location.href = route('leaves.reports.export', params);
            toast.success('Report export started. Download will begin shortly.');
        } catch (error) {
            toast.error('Failed to export report. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const renderSummaryReport = (summaryData: SummaryData) => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('th_total_requests')}</CardTitle>
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.total_requests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{summaryData.approved_requests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{summaryData.pending_requests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summaryData.rejected_requests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('th_total_days')}</CardTitle>
                        <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.total_days}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_leave_type_distribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={summaryData.by_leave_type || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="leave_type"
                                >
                                    {summaryData.by_leave_type?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_status_distribution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={summaryData.by_status || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('ttl_monthly_trend')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={summaryData.monthly_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
                            <Line type="monotone" dataKey="days" stroke="#82ca9d" name="Days" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );

    const renderDetailedReport = (detailedData: DetailedData) => (
        <Card>
            <CardHeader>
                <CardTitle>{t('ttl_detailed_leave_requests')}</CardTitle>
                <CardDescription>
                    Showing {detailedData.pagination?.total || 0} total requests
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>{t('lbl_leave_type')}</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead>Approver</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {detailedData.leaves?.data?.map((leave) => (
                            <TableRow key={leave.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{leave.employee.name}</div>
                                        <div className="text-sm text-muted-foreground">{leave.employee.employee_id}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{leave.employee.department}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        style={{ backgroundColor: leave.leave_type.color + '20', borderColor: leave.leave_type.color }}
                                    >
                                        {leave.leave_type.name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{formatDateMedium(leave.start_date)}</div>
                                        <div className="text-muted-foreground">to {formatDateMedium(leave.end_date)}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{leave.total_days}</TableCell>
                                <TableCell>
                                    <Badge className={statusColors[leave.status as keyof typeof statusColors]}>
                                        {leave.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{leave.applied_at}</TableCell>
                                <TableCell>
                                    {leave.approver ? (
                                        <div className="text-sm">
                                            <div>{leave.approver.name}</div>
                                            <div className="text-muted-foreground">{leave.approver.employee_id}</div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const renderBalanceReport = (balanceData: BalanceData) => (
        <Card>
            <CardHeader>
                <CardTitle>{t('ttl_leave_balance_report')}</CardTitle>
                <CardDescription>
                    Current leave balances for all employees
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>{t('lbl_leave_type')}</TableHead>
                            <TableHead>Allocated</TableHead>
                            <TableHead>Used</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead>{t('th_carried_forward')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {balanceData.employees?.map((employee) =>
                            employee.balances?.map((balance, index) => (
                                <TableRow key={`${employee.id}-${index}`}>
                                    {index === 0 && (
                                        <TableCell rowSpan={employee.balances.length}>
                                            <div>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
                                            </div>
                                        </TableCell>
                                    )}
                                    {index === 0 && (
                                        <TableCell rowSpan={employee.balances.length}>{employee.department}</TableCell>
                                    )}
                                    <TableCell>{balance.leave_type}</TableCell>
                                    <TableCell>{balance.allocated}</TableCell>
                                    <TableCell>{balance.used}</TableCell>
                                    <TableCell>{balance.remaining}</TableCell>
                                    <TableCell>{balance.carried_forward}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const renderTrendsReport = (trendsData: TrendsData) => (
        <div className="space-y-6">
            {/* Yearly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{trendsData.yearly_comparison.current_year.year} (Current)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Requests:</span>
                                <span className="font-bold">{trendsData.yearly_comparison.current_year.requests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Days:</span>
                                <span className="font-bold">{trendsData.yearly_comparison.current_year.days}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{trendsData.yearly_comparison.previous_year.year} (Previous)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Requests:</span>
                                <span className="font-bold">{trendsData.yearly_comparison.previous_year.requests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Days:</span>
                                <span className="font-bold">{trendsData.yearly_comparison.previous_year.days}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('ttl_monthly_trend')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendsData.monthly_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
                            <Line type="monotone" dataKey="days" stroke="#82ca9d" name="Days" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Seasonal Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('ttl_seasonal_analysis')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trendsData.seasonal_analysis}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="season" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="requests" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );

    const renderDepartmentReport = (departmentData: DepartmentData) => (
        <Card>
            <CardHeader>
                <CardTitle>{t('ttl_department_report')}</CardTitle>
                <CardDescription>
                    Leave statistics by department
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>{t('th_total_requests')}</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead>{t('th_approval_rate')}</TableHead>
                            <TableHead>{t('th_total_days')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departmentData.departments?.map((dept) => (
                            <TableRow key={dept.name}>
                                <TableCell className="font-medium">{dept.name}</TableCell>
                                <TableCell>{dept.total_requests}</TableCell>
                                <TableCell>{dept.approved_requests}</TableCell>
                                <TableCell>
                                    <Badge variant={dept.approval_rate >= 80 ? 'default' : dept.approval_rate >= 60 ? 'secondary' : 'destructive'}>
                                        {dept.approval_rate}%
                                    </Badge>
                                </TableCell>
                                <TableCell>{dept.total_days}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const renderReportContent = () => {
        if (!data) {
            return (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="text-center space-y-4">
                            <FilterIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div>
                                <h3 className="text-lg font-medium">No Data Available</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please select filters and click "Apply Filters" to generate a report.
                                </p>
                            </div>
                            <Button onClick={applyFilters} className="mt-4">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        switch (filters.report_type) {
            case 'detailed':
                return renderDetailedReport(data as DetailedData);
            case 'balance':
                return renderBalanceReport(data as BalanceData);
            case 'trends':
                return renderTrendsReport(data as TrendsData);
            case 'department':
                return renderDepartmentReport(data as DepartmentData);
            case 'summary':
            default:
                return renderSummaryReport(data as SummaryData);
        }
    };

    return (
        <AppLayout title="Leave Reports">
            <Head title={t('leave_reports')} />

            <div className="space-y-6">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('leaves.requests.index')}>Leave Management</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Reports</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('leave_reports')}</h1>
                        <p className="text-muted-foreground">{t('comprehensive_leave_analytics_and_insights')}</p>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/reports')}>
                        <BarChart3Icon className="mr-2 h-4 w-4" />
                        Main Reports Dashboard
                    </Button>
                    <div className="flex gap-2">
                        {can('leave-reports.export') && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => exportReport('xlsx')}
                                    disabled={isExporting}
                                >
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => exportReport('csv')}
                                    disabled={isExporting}
                                >
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FilterIcon className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Report Type */}
                            <div className="space-y-2">
                                <Label htmlFor="report_type">{t('lbl_report_type')}</Label>
                                <Select
                                    value={localFilters.report_type}
                                    onValueChange={(value) => handleFilterChange('report_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('ph_select_report_type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="summary">Summary</SelectItem>
                                        <SelectItem value="detailed">Detailed</SelectItem>
                                        <SelectItem value="balance">Balance</SelectItem>
                                        <SelectItem value="trends">Trends</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <Label>{t('lbl_date_from')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom && !isNaN(dateFrom.getTime()) ? format(dateFrom, "PPP") : <span>{t('project:pick_a_date')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={setDateFrom}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <Label>{t('lbl_date_to')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateTo && "text-muted-foreground"
                                            )}
                                        >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo && !isNaN(dateTo.getTime()) ? format(dateTo, "PPP") : <span>{t('project:pick_a_date')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={setDateTo}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Employee */}
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee</Label>
                                <Select
                                    value={localFilters.employee_id?.toString() || 'all'}
                                    onValueChange={(value) => handleFilterChange('employee_id', value === 'all' ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_employees_2')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_employees_2')}</SelectItem>
                                        {employees?.map((employee) => (
                                            <SelectItem key={employee.value} value={employee.value.toString()}>
                                                {employee.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department</Label>
                                <Select
                                    value={localFilters.department_id?.toString() || 'all'}
                                    onValueChange={(value) => handleFilterChange('department_id', value === 'all' ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_departments')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_departments')}</SelectItem>
                                        {departments?.map((department) => (
                                            <SelectItem key={department.value} value={department.value.toString()}>
                                                {department.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Leave Type */}
                            <div className="space-y-2">
                                <Label htmlFor="leave_type_id">{t('lbl_leave_type')}</Label>
                                <Select
                                    value={localFilters.leave_type_id?.toString() || 'all'}
                                    onValueChange={(value) => handleFilterChange('leave_type_id', value === 'all' ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_leave_types')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_leave_types')}</SelectItem>
                                        {leaveTypes?.map((leaveType) => (
                                            <SelectItem key={leaveType.value} value={leaveType.value.toString()}>
                                                {leaveType.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={localFilters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_statuses_2')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_statuses_2')}</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Content */}
                {renderReportContent()}
            </div>
        </AppLayout>
    );
}














