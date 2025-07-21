import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { Label } from '@/../../Modules/Core/resources/js/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/../../Modules/Core/resources/js/components/ui/select';
import { Badge } from '@/../../Modules/Core/resources/js/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/../../Modules/Core/resources/js/components/ui/table';
import { Pagination } from '@/../../Modules/Core/resources/js/components/ui/pagination';
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceReview {
    id: number;
    employee: {
        id: number;
        name: string;
        employee_id: string;
    };
    reviewer: {
        id: number;
        name: string;
    };
    review_date: string;
    status: 'pending' | 'approved' | 'rejected';
    job_knowledge_rating: number;
    work_quality_rating: number;
    attendance_rating: number;
    communication_rating: number;
    teamwork_rating: number;
    initiative_rating: number;
    overall_rating: number;
    created_at: string;
}

interface Employee {
    id: number;
    name: string;
    employee_id: string;
}

interface Props extends PageProps {
    performanceReviews: {
        data: PerformanceReview[];
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
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    hasRecords: boolean;
}

export default function PerformanceReviewsIndex({ performanceReviews, employees, filters, hasRecords }: Props) {
    const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Debug: Log performance reviews data when it changes
    useEffect(() => {
        console.log('Performance reviews data updated:', performanceReviews);
        console.log('Performance reviews meta:', performanceReviews?.meta);
        console.log('Per page value:', performanceReviews?.per_page);
    }, [performanceReviews]);

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('performance-reviews.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedReviews.length === 0) {
            toast.error('Please select reviews to delete');
            return;
        }

        setBulkDeleteProcessing(true);
        try {
            await router.delete(route('performance-reviews.destroy'), {
                data: { ids: selectedReviews },
                onSuccess: () => {
                    toast.success('Reviews deleted successfully');
                    setSelectedReviews([]);
                    setShowBulkDeleteModal(false);
                },
                onError: () => {
                    toast.error('Failed to delete reviews');
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
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge variant={config.variant as any}>{config.text}</Badge>;
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <>
            <Head title="Performance Reviews" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
                        <p className="text-muted-foreground">
                            Manage and track employee performance reviews
                        </p>
                    </div>
                    <Button onClick={() => router.get(route('performance-reviews.create'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Review
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    </SelectContent>
                                </Select>
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
                                    <CardTitle>Performance Reviews</CardTitle>
                                    <CardDescription>
                                        Showing {performanceReviews.from} to {performanceReviews.to} of{' '}
                                        {performanceReviews.total} results
                                        {performanceReviews.last_page > 1 && (
                                            <div className="mt-1 text-xs opacity-60">
                                                Page {performanceReviews.current_page} of {performanceReviews.last_page}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="per_page">Show:</Label>
                                    <Select
                                        value={performanceReviews?.per_page?.toString() || "10"}
                                        onValueChange={(value) => {
                                            console.log('Changing per_page to:', value);
                                            router.get(
                                                route('performance-reviews.index'),
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
                                        <TableHead>Reviewer</TableHead>
                                        <TableHead>Review Date</TableHead>
                                        <TableHead>Overall Rating</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {performanceReviews.data.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{review.employee.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {review.employee.employee_id}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{review.reviewer.name}</TableCell>
                                            <TableCell>
                                                {new Date(review.review_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-medium ${getRatingColor(review.overall_rating)}`}>
                                                    {review.overall_rating.toFixed(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(review.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('performance-reviews.show', review.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('performance-reviews.edit', review.id))}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this review?')) {
                                                                router.delete(route('performance-reviews.destroy', review.id));
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
                            {performanceReviews.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    disabled={performanceReviews.current_page === 1}
                                                    onClick={() => {
                                                        const currentPage = performanceReviews.current_page || 1;
                                                        if (currentPage > 1) {
                                                            router.get(
                                                                route('performance-reviews.index'),
                                                                {
                                                                    page: currentPage - 1,
                                                                    per_page: performanceReviews.per_page || 10,
                                                                    ...filters,
                                                                },
                                                                { preserveState: true }
                                                            );
                                                        }
                                                    }}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(5, performanceReviews.last_page || 1) }, (_, i) => {
                                                let pageNumber;
                                                const lastPage = performanceReviews.last_page || 1;
                                                const currentPage = performanceReviews.current_page || 1;

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
                                                                    route('performance-reviews.index'),
                                                                    {
                                                                        page: pageNumber,
                                                                        per_page: performanceReviews.per_page || 10,
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
                                                        !performanceReviews.current_page ||
                                                        !performanceReviews.last_page ||
                                                        performanceReviews.current_page >= performanceReviews.last_page
                                                    }
                                                    onClick={() => {
                                                        const currentPage = performanceReviews.current_page || 1;
                                                        const lastPage = performanceReviews.last_page || 1;
                                                        if (currentPage < lastPage) {
                                                            router.get(
                                                                route('performance-reviews.index'),
                                                                {
                                                                    page: currentPage + 1,
                                                                    per_page: performanceReviews.per_page || 10,
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
                                    <Search className="h-12 w-12" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No performance reviews found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating a new performance review.
                                </p>
                                <Button onClick={() => router.get(route('performance-reviews.create'))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Review
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
