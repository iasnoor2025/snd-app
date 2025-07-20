import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Pagination,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Check, Edit, Eye, Plus, Search, X, TrendingUp, User, CalendarDays, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    department: {
        name: string;
    };
    position: {
        title: string;
    };
}

interface SalaryIncrement {
    id: number;
    employee: Employee;
    increment_type: string;
    increment_percentage?: number;
    increment_amount?: number;
    current_total_salary: number;
    new_total_salary: number;
    effective_date: string;
    status: 'pending' | 'approved' | 'rejected' | 'applied';
    reason: string;
    requested_by: {
        name: string;
    };
    created_at: string;
}

interface Statistics {
    total_increments: number;
    pending_increments: number;
    approved_increments: number;
    rejected_increments: number;
    applied_increments: number;
    total_increment_amount: number;
    average_increment_percentage: number;
}

interface Props extends PageProps {
    increments: {
        data: SalaryIncrement[];
        links: any[];
        meta: any;
    };
    statistics: Statistics;
    projectedCost: number;
    filters: {
        search?: string;
        status?: string;
        employee_id?: string;
        increment_type?: string;
    };
    employees: Employee[];
}

export default function Index({ increments, statistics, projectedCost, filters, employees }: Props) {
    const { t } = useTranslation('employee');

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [employeeFilter, setEmployeeFilter] = useState(filters.employee_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.increment_type || 'all');
    const [perPage, setPerPage] = useState(increments.meta?.per_page || 15);

    const handleSearch = debounce((value: string) => {
        const normalizedValue = !value || value === 'all' ? '' : value;
        setSearchTerm(normalizedValue);
        router.get(
            route('salary-increments.index'),
            {
                search: normalizedValue,
                status: statusFilter === 'all' ? '' : statusFilter,
                employee_id: employeeFilter === 'all' ? '' : employeeFilter,
                increment_type: typeFilter === 'all' ? '' : typeFilter,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);

    const handleFilter = (type: string, value: string) => {
        const normalizedValue = value === 'all' ? '' : value;
        let newStatus = statusFilter;
        let newEmployee = employeeFilter;
        let newType = typeFilter;

        switch (type) {
            case 'status':
                setStatusFilter(value);
                newStatus = value;
                break;
            case 'employee':
                setEmployeeFilter(value);
                newEmployee = value;
                break;
            case 'type':
                setTypeFilter(value);
                newType = value;
                break;
        }

        router.get(
            route('salary-increments.index'),
            {
                search: searchTerm === 'all' ? '' : searchTerm,
                status: newStatus === 'all' ? '' : newStatus,
                employee_id: newEmployee === 'all' ? '' : newEmployee,
                increment_type: newType === 'all' ? '' : newType,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        router.get(
            route('salary-increments.index'),
            {
                search: searchTerm === 'all' ? '' : searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                employee_id: employeeFilter === 'all' ? '' : employeeFilter,
                increment_type: typeFilter === 'all' ? '' : typeFilter,
                per_page: Number(value),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setEmployeeFilter('all');
        setTypeFilter('all');
        router.get(route('salary-increments.index'));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
            pending: 'outline',
            approved: 'default',
            rejected: 'destructive',
            applied: 'secondary',
        };

        const labels: Record<string, string> = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            applied: 'Applied',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const formatCurrency = (amount: number | null | undefined) => {
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleApprove = (incrementId: number) => {
        router.post(route('salary-increments.approve', incrementId));
    };

    const handleReject = (incrementId: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(route('salary-increments.reject', incrementId), {
                rejection_reason: reason,
            });
        }
    };

    const handleApply = (incrementId: number) => {
        if (confirm('Are you sure you want to apply this salary increment? This action cannot be undone.')) {
            router.post(route('salary-increments.apply', incrementId));
        }
    };

    const breadcrumbs = [
        { title: 'Employee Management', href: '/employee-management' },
        { title: 'Salary Increments', href: route('salary-increments.index') },
    ];

    return (
        <AppLayout title={t('salary_increments')} breadcrumbs={breadcrumbs} requiredPermission="salary-increments.view">
            <Head title={t('salary_increments')} />

            <div className="py-12">
                <div className="sm:px-6 lg:px-8">
                    {/* Header with Action Button */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">{t('salary_increments')}</h1>
                        <Link href={route('salary-increments.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('new_increment')}
                            </Button>
                        </Link>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_total_increments')}</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.total_increments}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_pending_approval')}</CardTitle>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{statistics.pending_increments}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_total_increment_amount')}</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.total_increment_amount)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_salary_annual_total')}</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{formatCurrency(projectedCost)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('filters')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <Input
                                        placeholder={t('ph_search_employees')}
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => handleFilter('status', value)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t('opt_all_statuses')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                                        <SelectItem value="pending">{t('pending')}</SelectItem>
                                        <SelectItem value="approved">{t('approved')}</SelectItem>
                                        <SelectItem value="rejected">{t('rejected')}</SelectItem>
                                        <SelectItem value="applied">{t('applied')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={employeeFilter} onValueChange={(value) => handleFilter('employee', value)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t('opt_all_employees')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_employees')}</SelectItem>
                                        {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                                {employee.first_name} {employee.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={(value) => handleFilter('type', value)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t('opt_all_types')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_types')}</SelectItem>
                                        <SelectItem value="percentage">{t('percentage')}</SelectItem>
                                        <SelectItem value="fixed_amount">{t('lbl_fixed_amount')}</SelectItem>
                                        <SelectItem value="promotion">{t('promotion')}</SelectItem>
                                        <SelectItem value="annual_review">{t('opt_annual_review')}</SelectItem>
                                        <SelectItem value="performance">{t('performance')}</SelectItem>
                                        <SelectItem value="market_adjustment">{t('opt_market_adjustment')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={clearFilters}>
                                    {t('clear')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Increments Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('salary_increments')}</CardTitle>
                            <CardDescription>{t('manage_salary_increments')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department & Position
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Salary Information
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Increment Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status & Request
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {increments.data.map((increment) => {
                                            const increaseAmount = increment.new_total_salary - increment.current_total_salary;
                                            const increasePercentage = ((increaseAmount / increment.current_total_salary) * 100).toFixed(1);

                                            return (
                                                <tr key={increment.id} className="align-top">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-medium">
                                                                {increment.employee.first_name} {increment.employee.last_name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                <User className="mr-1 inline-block h-3 w-3" />
                                                                {increment.employee.employee_id}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-sm">
                                                                {increment.employee.department?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {increment.employee.position?.title || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center text-sm">
                                                                <DollarSign className="mr-1 inline-block h-3 w-3" />
                                                                <span className="font-medium">{formatCurrency(increment.current_total_salary)}</span>
                                                                <span className="ml-1 text-xs text-muted-foreground">/month</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Current Total
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center text-sm">
                                                                <TrendingUp className="mr-1 inline-block h-3 w-3" />
                                                                <span className="font-medium text-green-600">+{formatCurrency(increaseAmount)}</span>
                                                                <span className="ml-1 text-xs text-muted-foreground">(+{increasePercentage}%)</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                New: {formatCurrency(increment.new_total_salary)}
                                                            </div>
                                                            <Badge variant="outline" className="w-fit text-xs">
                                                                {increment.increment_type.replace('_', ' ').toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <div>{getStatusBadge(increment.status)}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                <CalendarDays className="mr-1 inline-block h-3 w-3" />
                                                                {formatDate(increment.effective_date)}
                                                            </div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="line-clamp-1 cursor-help text-xs text-muted-foreground">
                                                                            {increment.requested_by.name}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Requested by: {increment.requested_by.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={route('salary-increments.show', increment.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {increment.status === 'pending' && (
                                                                <>
                                                                    <Link href={route('salary-increments.edit', increment.id)}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleApprove(increment.id)}
                                                                        className="text-green-600 hover:text-green-700"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleReject(increment.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {increment.status === 'approved' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApply(increment.id)}
                                                                    className="text-blue-600 hover:text-blue-700"
                                                                >
                                                                    <Calendar className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {increments.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-4 text-center">
                                                    No salary increments found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Enhanced Pagination */}
                            <div className="mt-6 border-t pt-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {increments.meta?.from || 1} to {increments.meta?.to || increments.data.length} of{' '}
                                            {increments.meta?.total || increments.data.length} results
                                            <div className="mt-1 text-xs opacity-60">
                                                Page {increments.meta?.current_page || 1} of {increments.meta?.last_page || 1}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                                            {/* Per Page Selector */}
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">Show:</span>
                                                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="10">10</SelectItem>
                                                        <SelectItem value="15">15</SelectItem>
                                                        <SelectItem value="25">25</SelectItem>
                                                        <SelectItem value="50">50</SelectItem>
                                                        <SelectItem value="100">100</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Pagination */}
                                            <Pagination
                                                currentPage={increments.meta?.current_page || 1}
                                                totalPages={increments.meta?.last_page || 1}
                                                onPageChange={(page) => {
                                                    const url = new URL(window.location.href);
                                                    url.searchParams.set('page', page.toString());
                                                    router.get(url.pathname + url.search);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
