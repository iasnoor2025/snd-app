import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/Components/ui/card';
import { Button } from '@/../../Modules/Core/resources/js/Components/ui/button';
import { Input } from '@/../../Modules/Core/resources/js/Components/ui/input';
import { Label } from '@/../../Modules/Core/resources/js/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/../../Modules/Core/resources/js/Components/ui/select';
import { Badge } from '@/../../Modules/Core/resources/js/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/../../Modules/Core/resources/js/Components/ui/table';
import { Pagination } from '@/../../Modules/Core/resources/js/Components/ui/pagination';
import { Plus, Search, Filter, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceBenchmark {
    id: number;
    equipment_type: string;
    model: string;
    manufacturer: string;
    metric_name: string;
    expected_min_value: number;
    expected_max_value: number;
    optimal_value: number;
    unit_of_measure: string;
    is_active: boolean;
    created_at: string;
}

interface Props extends PageProps {
    performanceBenchmarks: {
        data: PerformanceBenchmark[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        equipment_type?: string;
        model?: string;
        manufacturer?: string;
        metric_name?: string;
        is_active?: boolean;
        per_page?: string;
    };
    hasRecords: boolean;
}

export default function PerformanceBenchmarksIndex({ performanceBenchmarks, filters, hasRecords }: Props) {
    const [selectedBenchmarks, setSelectedBenchmarks] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);

    // Debug: Log performance benchmarks data when it changes
    useEffect(() => {
        console.log('Performance benchmarks data updated:', performanceBenchmarks);
        console.log('Performance benchmarks meta:', performanceBenchmarks?.meta);
        console.log('Per page value:', performanceBenchmarks?.per_page);
    }, [performanceBenchmarks]);

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('performance-benchmarks.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleBulkDelete = async () => {
        if (selectedBenchmarks.length === 0) {
            toast.error('Please select benchmarks to delete');
            return;
        }

        setBulkDeleteProcessing(true);
        try {
            await router.delete(route('performance-benchmarks.destroy'), {
                data: { ids: selectedBenchmarks },
                onSuccess: () => {
                    toast.success('Benchmarks deleted successfully');
                    setSelectedBenchmarks([]);
                    setShowBulkDeleteModal(false);
                },
                onError: () => {
                    toast.error('Failed to delete benchmarks');
                },
            });
        } finally {
            setBulkDeleteProcessing(false);
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default">Active</Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        );
    };

    return (
        <>
            <Head title="Performance Benchmarks" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Performance Benchmarks</h1>
                        <p className="text-muted-foreground">
                            Manage equipment performance benchmarks and standards
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.get(route('performance-benchmarks.bulk-store'))}>
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Import
                        </Button>
                        <Button onClick={() => router.get(route('performance-benchmarks.create'))}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Benchmark
                        </Button>
                    </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="equipment_type">Equipment Type</Label>
                                <Input
                                    placeholder="Filter by equipment type"
                                    value={filters.equipment_type || ''}
                                    onChange={(e) => handleFilter('equipment_type', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    placeholder="Filter by model"
                                    value={filters.model || ''}
                                    onChange={(e) => handleFilter('model', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                <Input
                                    placeholder="Filter by manufacturer"
                                    value={filters.manufacturer || ''}
                                    onChange={(e) => handleFilter('manufacturer', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metric_name">Metric</Label>
                                <Input
                                    placeholder="Filter by metric name"
                                    value={filters.metric_name || ''}
                                    onChange={(e) => handleFilter('metric_name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status</Label>
                                <Select
                                    value={filters.is_active?.toString() || ''}
                                    onValueChange={(value) => handleFilter('is_active', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <CardTitle>Performance Benchmarks</CardTitle>
                                    <CardDescription>
                                        Showing {performanceBenchmarks.from} to {performanceBenchmarks.to} of{' '}
                                        {performanceBenchmarks.total} results
                                        {performanceBenchmarks.last_page > 1 && (
                                            <div className="mt-1 text-xs opacity-60">
                                                Page {performanceBenchmarks.current_page} of {performanceBenchmarks.last_page}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="per_page">Show:</Label>
                                    <Select
                                        value={performanceBenchmarks?.per_page?.toString() || "10"}
                                        onValueChange={(value) => {
                                            console.log('Changing per_page to:', value);
                                            router.get(
                                                route('performance-benchmarks.index'),
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
                                        <TableHead>Equipment Type</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Manufacturer</TableHead>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Expected Range</TableHead>
                                        <TableHead>Optimal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {performanceBenchmarks.data.map((benchmark) => (
                                        <TableRow key={benchmark.id}>
                                            <TableCell className="font-medium">
                                                {benchmark.equipment_type}
                                            </TableCell>
                                            <TableCell>{benchmark.model || '-'}</TableCell>
                                            <TableCell>{benchmark.manufacturer || '-'}</TableCell>
                                            <TableCell>{benchmark.metric_name}</TableCell>
                                            <TableCell>
                                                {benchmark.expected_min_value} - {benchmark.expected_max_value} {benchmark.unit_of_measure}
                                            </TableCell>
                                            <TableCell>
                                                {benchmark.optimal_value ? `${benchmark.optimal_value} ${benchmark.unit_of_measure}` : '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(benchmark.is_active)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('performance-benchmarks.show', benchmark.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(route('performance-benchmarks.edit', benchmark.id))}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this benchmark?')) {
                                                                router.delete(route('performance-benchmarks.destroy', benchmark.id));
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
                            {performanceBenchmarks.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    disabled={performanceBenchmarks.current_page === 1}
                                                    onClick={() => {
                                                        const currentPage = performanceBenchmarks.current_page || 1;
                                                        if (currentPage > 1) {
                                                            router.get(
                                                                route('performance-benchmarks.index'),
                                                                {
                                                                    page: currentPage - 1,
                                                                    per_page: performanceBenchmarks.per_page || 10,
                                                                    ...filters,
                                                                },
                                                                { preserveState: true }
                                                            );
                                                        }
                                                    }}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(5, performanceBenchmarks.last_page || 1) }, (_, i) => {
                                                let pageNumber;
                                                const lastPage = performanceBenchmarks.last_page || 1;
                                                const currentPage = performanceBenchmarks.current_page || 1;

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
                                                                    route('performance-benchmarks.index'),
                                                                    {
                                                                        page: pageNumber,
                                                                        per_page: performanceBenchmarks.per_page || 10,
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
                                                        !performanceBenchmarks.current_page ||
                                                        !performanceBenchmarks.last_page ||
                                                        performanceBenchmarks.current_page >= performanceBenchmarks.last_page
                                                    }
                                                    onClick={() => {
                                                        const currentPage = performanceBenchmarks.current_page || 1;
                                                        const lastPage = performanceBenchmarks.last_page || 1;
                                                        if (currentPage < lastPage) {
                                                            router.get(
                                                                route('performance-benchmarks.index'),
                                                                {
                                                                    page: currentPage + 1,
                                                                    per_page: performanceBenchmarks.per_page || 10,
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
                                <h3 className="text-lg font-semibold mb-2">No performance benchmarks found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating a new performance benchmark.
                                </p>
                                <Button onClick={() => router.get(route('performance-benchmarks.create'))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Benchmark
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
