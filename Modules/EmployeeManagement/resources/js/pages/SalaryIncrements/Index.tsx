import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search, Plus, Eye, Edit, Check, X, Calendar } from 'lucide-react';
import { AppLayout } from '@/Core';
import { PageProps } from '@/types';
import SalaryHistory from '../Employees/SalaryHistory';

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
  const { t } = useTranslation('employees');

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [employeeFilter, setEmployeeFilter] = useState(filters.employee_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.increment_type || 'all');

    const handleSearch = () => {
        router.get(route('salary-increments.index'), {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            employee_id: employeeFilter === 'all' ? '' : employeeFilter,
            increment_type: typeFilter === 'all' ? '' : typeFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setEmployeeFilter('all');
        setTypeFilter('all');
        router.get(route('salary-increments.index'));
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            applied: 'bg-blue-100 text-blue-800',
        };
        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle null, undefined, or NaN values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
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
        { title: 'Salary Increments', href: route('salary-increments.index') }
    ];

    return (
        <AppLayout
            title={t('salary_increments')}
            breadcrumbs={breadcrumbs}
            requiredPermission="salary-increments.view"
        >
            <Head title={t('salary_increments')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header with Action Button */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{t('salary_increments')}</h1>
                        <Link href={route('salary-increments.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('new_increment')}
                            </Button>
                        </Link>
                    </div>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_total_increments')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.total_increments}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_pending_approval')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{statistics.pending_increments}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_total_increment_amount')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(statistics.total_increment_amount)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('ttl_salary_annual_total')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(projectedCost)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('filters')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <Input
                                        placeholder={t('ph_search_employees')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
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
                                </div>
                                <div>
                                    <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                                        <SelectTrigger>
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
                                </div>
                                <div>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger>
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
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Search className="h-4 w-4 mr-2" />
                                        {t('search')}
                                    </Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        {t('clear')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Increments Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('salary_increments')}</CardTitle>
                            <CardDescription>
                                {t('manage_salary_increments')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('employee')}</TableHead>
                                        <TableHead>{t('department')}</TableHead>
                                        <TableHead>{t('current_salary')}</TableHead>
                                        <TableHead>{t('new_salary')}</TableHead>
                                        <TableHead>{t('increase')}</TableHead>
                                        <TableHead>{t('type')}</TableHead>
                                        <TableHead>{t('lbl_effective_date')}</TableHead>
                                        <TableHead>{t('status')}</TableHead>
                                        <TableHead>{t('th_requested_by')}</TableHead>
                                        <TableHead>{t('actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {increments.data.map((increment) => {
                                        const increaseAmount = increment.new_total_salary - increment.current_total_salary;
                                        const increasePercentage = ((increaseAmount / increment.current_total_salary) * 100).toFixed(1);

                                        return (
                                            <TableRow key={increment.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {increment.employee.first_name} {increment.employee.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {increment.employee.employee_id}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{increment.employee.department?.name || 'N/A'}</TableCell>
                                                <TableCell>{formatCurrency(increment.current_total_salary)}</TableCell>
                                                <TableCell>{formatCurrency(increment.new_total_salary)}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-green-600">
                                                            +{formatCurrency(increaseAmount)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            +{increasePercentage}%
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {increment.increment_type.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(increment.effective_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(increment.status)}</TableCell>
                                                <TableCell>{increment.requested_by.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
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
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {increments.total > increments.per_page && (
                                <div className="mt-6">
                                    <Pagination
                                        currentPage={increments.current_page}
                                        totalPages={increments.last_page}
                                        onPageChange={(page) => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('page', page.toString());
                                            router.get(url.pathname + url.search);
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
















