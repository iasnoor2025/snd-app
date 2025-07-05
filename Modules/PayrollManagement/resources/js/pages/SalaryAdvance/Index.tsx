import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from "@/Core/types";
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import { Badge } from "@/Core";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Core";
import { Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
}

interface SalaryAdvance {
    id: number;
    employee: Employee;
    amount: number;
    advance_date: string;
    deduction_start_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'deducted';
    approved_at?: string;
    created_at: string;
}

interface Props extends PageProps {
    salaryAdvances: {
        data: SalaryAdvance[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
        employee_id?: number;
    };
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Salary Advances',
        href: '/salary-advances',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { variant: 'secondary' as const, label: 'Pending' },
        approved: { variant: 'default' as const, label: 'Approved' },
        rejected: { variant: 'destructive' as const, label: 'Rejected' },
        deducted: { variant: 'outline' as const, label: 'Deducted' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function Index({ auth, salaryAdvances, filters }: Props) {
  const { t } = useTranslation('payroll');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/salary-advances', {
            status: selectedStatus || undefined,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('');
        router.get('/salary-advances');
    };

    return (
        <AppLayout
            title={t('salary_advances')}
            breadcrumbs={breadcrumbs}
            requiredPermission="salary-advances.view"
        >
            <Head title={t('salary_advances')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('salary_advances')}</h1>
                        <p className="text-muted-foreground">
                            Manage salary advance requests and approvals
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/salary-advances/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('employee:ttl_request_advance')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder={t('ph_search_by_employee_name_or_reason')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="status">Status</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_statuses_1')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">{t('opt_all_statuses_1')}</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="deducted">Deducted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Salary Advances Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_salary_advance_requests')}</CardTitle>
                        <CardDescription>
                            {salaryAdvances.meta.total} total requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {salaryAdvances.data.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>{t('advance_date')}</TableHead>
                                            <TableHead>{t('deduction_start')}</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Requested</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salaryAdvances.data.map((advance) => (
                                            <TableRow key={advance.id}>
                                                <TableCell className="font-medium">
                                                    {advance.employee.first_name} {advance.employee.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    ${advance.amount}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(advance.advance_date), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(advance.deduction_start_date), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(advance.status)}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {advance.reason}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(advance.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/salary-advances/${advance.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">{t('no_salary_advances_found')}</h3>
                                    <p className="text-muted-foreground">
                                        No salary advance requests match your current filters.
                                    </p>
                                    <Button className="mt-4" asChild>
                                        <Link href="/salary-advances/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('employee:ttl_request_advance')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}














