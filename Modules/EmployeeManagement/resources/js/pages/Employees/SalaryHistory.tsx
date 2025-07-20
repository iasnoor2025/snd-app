import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { ArrowLeft, Banknote, Calendar, DollarSign, Search, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/core';

interface SalaryRecord {
    id: number;
    salary_month: string;
    basic_salary: number;
    food_allowance: number;
    housing_allowance: number;
    transport_allowance: number;
    overtime_amount: number;
    deductions: number;
    net_salary: number;
    status: 'pending' | 'approved' | 'paid' | 'applied';
    paid_date?: string;
    notes?: string;
    requested_by?: {
        name: string;
    };
    approved_by?: {
        name: string;
    };
}

interface Props {
    employeeId: number;
    records?: SalaryRecord[];
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        employee_id: string;
        file_number: string;
    };
}

export default function SalaryHistory({ employeeId, records = [], employee }: Props) {
    const { t } = useTranslation('employee');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(15);

    const handleSearch = debounce((value: string) => {
        setSearchTerm(value);
        router.get(
            `/employees/${employeeId}/salary-history`,
            {
                search: value,
                status: statusFilter === 'all' ? '' : statusFilter,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);

    const handleFilter = (type: string, value: string) => {
        if (type === 'status') {
            setStatusFilter(value);
        }
        router.get(
            `/employees/${employeeId}/salary-history`,
            {
                search: searchTerm,
                status: value === 'all' ? '' : value,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const calculateTotal = (record: SalaryRecord) => {
        return (
            record.basic_salary +
            record.food_allowance +
            record.housing_allowance +
            record.transport_allowance +
            record.overtime_amount -
            record.deductions
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
            paid: 'default',
            approved: 'outline',
            applied: 'default',
            pending: 'secondary',
        };

        const labels: Record<string, string> = {
            paid: 'Paid',
            approved: 'Approved',
            applied: 'Applied',
            pending: 'Pending',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return '-';
        return format(new Date(date), 'dd MMM yyyy');
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee ? `${employee.first_name} ${employee.last_name}` : 'Employee', href: `/employees/${employeeId}` },
        { title: 'Salary History', href: '#' },
    ];

    return (
        <AppLayout title="Salary History" breadcrumbs={breadcrumbs} requiredPermission="employees.view">
            <Head title="Salary History" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('salary_history')}</h1>
                        {employee && (
                            <p className="text-muted-foreground">
                                {employee.first_name} {employee.last_name} • ID: {employee.employee_id} • File: {employee.file_number}
                            </p>
                        )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/employees/${employeeId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Employee
                        </a>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('filters')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Input
                                    placeholder={t('ph_search_records')}
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
                                    <SelectItem value="paid">{t('paid')}</SelectItem>
                                    <SelectItem value="approved">{t('approved')}</SelectItem>
                                    <SelectItem value="applied">{t('applied')}</SelectItem>
                                    <SelectItem value="pending">{t('pending')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Salary History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('salary_records')}</CardTitle>
                        <CardContent className="text-sm text-muted-foreground">
                            {records.length} {records.length === 1 ? 'record' : 'records'} found
                        </CardContent>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('effective_date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('basic_salary')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('allowances')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('overtime')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('deductions')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('total_salary')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('paid_date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('notes')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <tr key={record.id} className="align-top hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {format(new Date(record.salary_month), 'MMM yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <Banknote className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{formatCurrency(record.basic_salary)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Food:</span>
                                                        <span>{formatCurrency(record.food_allowance)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Housing:</span>
                                                        <span>{formatCurrency(record.housing_allowance)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Transport:</span>
                                                        <span>{formatCurrency(record.transport_allowance)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {formatCurrency(record.overtime_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center text-red-600">
                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                    {formatCurrency(record.deductions)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <Banknote className="mr-2 h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-600">
                                                        {formatCurrency(calculateTotal(record))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {record.paid_date ? formatDate(record.paid_date) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="max-w-xs">
                                                    {record.notes ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="line-clamp-2 cursor-help text-xs text-muted-foreground">
                                                                        {record.notes}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="max-w-xs">{record.notes}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Banknote className="h-8 w-8 text-muted-foreground/50" />
                                                    <p className="text-sm font-medium">{t('no_salary_records')}</p>
                                                    <p className="text-xs">{t('no_salary_records_description')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
