import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Loan {
    id: number;
    employee: {
        id: number;
        name: string;
        employee_id: string;
    };
    amount: number;
    interest_rate: number;
    term_months: number;
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    repaid_amount: number;
    created_at: string;
    approved_at?: string;
    end_date?: string;
}

interface Employee {
    id: number;
    name: string;
    employee_id: string;
}

interface Props extends PageProps {
    loans: {
        data: Loan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    employees: Employee[];
    filters: {
        employee_id?: number;
        status?: string;
        amount_min?: number;
        amount_max?: number;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    hasRecords: boolean;
}

export default function LoansIndex({ loans, employees, filters, hasRecords }: Props) {
    const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Debug: Log loans data when it changes
    useEffect(() => {
        console.log('Loans data updated:', loans);
        console.log('Loans meta:', loans?.meta);
        console.log('Per page value:', loans?.per_page);
    }, [loans]);

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('loans.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedLoans.length === 0) {
            toast.error('Please select loans to delete');
            return;
        }

        setBulkDeleteProcessing(true);
        try {
            await router.delete(route('loans.destroy'), {
                data: { ids: selectedLoans },
                onSuccess: () => {
                    toast.success('Loans deleted successfully');
                    setSelectedLoans([]);
                    setShowBulkDeleteModal(false);
                },
                onError: () => {
                    toast.error('Failed to delete loans');
                },
            });
        } finally {
            setBulkDeleteProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: 'secondary', text: 'Pending' },
            approved: { variant: 'default', text: 'Approved' },
            rejected: { variant: 'destructive', text: 'Rejected' },
            closed: { variant: 'outline', text: 'Closed' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge variant={config.variant as any}>{config.text}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const calculateRemainingBalance = (loan: Loan) => {
        return loan.amount - loan.repaid_amount;
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <>
            <Head title="Loans" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
                        <p className="text-muted-foreground">
                            Manage employee loans and repayments
                        </p>
                    </div>
                    <Button onClick={() => router.get(route('loans.create'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Loan
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
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee">Employee</Label>
                                <Select
                                    value={filters.employee_id?.toString() || ''}
                                    onValueChange={(value) => handleFilter('employee_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Employees</SelectItem>
                                        {filteredEmployees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                                {employee.name} ({employee.employee_id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={filters.status || ''}
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount_min">Min Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="Min amount"
                                    value={filters.amount_min || ''}
                                    onChange={(e) => handleFilter('amount_min', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount_max">Max Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="Max amount"
                                    value={filters.amount_max || ''}
                                    onChange={(e) => handleFilter('amount_max', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilter('date_from', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilter('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {hasRecords ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Loans</CardTitle>
                                    <CardDescription>
                                        Showing {loans.from} to {loans.to} of{' '}
                                        {loans.total} results
                                        {loans.last_page > 1 && (
                                            <div className="mt-1 text-xs opacity-60">
                                                Page {loans.current_page} of {loans.last_page}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="per_page">Show:</Label>
                                    <Select
                                        value={loans?.per_page?.toString() || "10"}
                                        onValueChange={(value) => {
                                            console.log('Changing per_page to:', value);
                                            router.get(
                                                route('loans.index'),
                                                { ...filters, per_page: value },
                                                { preserveState: true, replace: true }
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Interest Rate</TableHead>
                                        <TableHead>Term</TableHead>
                                        <TableHead>Repaid</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.data.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{loan.employee.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {loan.employee.employee_id}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(loan.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {loan.interest_rate}%
                                            </TableCell>
                                            <TableCell>
                                                {loan.term_months} months
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(loan.repaid_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {formatCurrency(calculateRemainingBalance(loan))}
                                                </span>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('loans.show', loan.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('loans.edit', loan.id))}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this loan?')) {
                                                                router.delete(route('loans.destroy', loan.id));
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {loans.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    disabled={loans.current_page === 1}
                                                    onClick={() => {
                                                        const currentPage = loans.current_page || 1;
                                                        if (currentPage > 1) {
                                                            router.get(
                                                                route('loans.index'),
                                                                {
                                                                    page: currentPage - 1,
                                                                    per_page: loans.per_page || 10,
                                                                    ...filters,
                                                                },
                                                                { preserveState: true }
                                                            );
                                                        }
                                                    }}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(5, loans.last_page || 1) }, (_, i) => {
                                                let pageNumber;
                                                const lastPage = loans.last_page || 1;
                                                const currentPage = loans.current_page || 1;

                                                if (lastPage <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= lastPage - 2) {
                                                    pageNumber = lastPage - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }

                                                return (
                                                    <PaginationItem key={pageNumber}>
                                                        <PaginationLink
                                                            isActive={pageNumber === currentPage}
                                                            onClick={() => {
                                                                router.get(
                                                                    route('loans.index'),
                                                                    {
                                                                        page: pageNumber,
                                                                        per_page: loans.per_page || 10,
                                                                        ...filters,
                                                                    },
                                                                    { preserveState: true }
                                                                );
                                                            }}
                                                        >
                                                            {pageNumber}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    disabled={
                                                        !loans.current_page ||
                                                        !loans.last_page ||
                                                        loans.current_page >= loans.last_page
                                                    }
                                                    onClick={() => {
                                                        const currentPage = loans.current_page || 1;
                                                        const lastPage = loans.last_page || 1;
                                                        if (currentPage < lastPage) {
                                                            router.get(
                                                                route('loans.index'),
                                                                {
                                                                    page: currentPage + 1,
                                                                    per_page: loans.per_page || 10,
                                                                    ...filters,
                                                                },
                                                                { preserveState: true }
                                                            );
                                                        }
                                                    }}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                                    <DollarSign className="h-12 w-12" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No loans found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating a new loan application.
                                </p>
                                <Button onClick={() => router.get(route('loans.create'))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Loan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
