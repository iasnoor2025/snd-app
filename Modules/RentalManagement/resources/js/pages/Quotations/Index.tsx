import { Button } from '@/Core/components/ui/button';
import { DataTable } from '@/Core/components/ui/data-table';
import AppLayout from '@/Core/layouts/AppLayout';
import React from 'react';
import { Eye, Download } from 'lucide-react';
import { Badge } from '@/Core/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Core/components/ui/select';
import { useState } from 'react';

interface Quotation {
    id: number;
    quotation_number: string;
    customer: { company_name: string };
    issue_date: string;
    status: string;
    total_amount: string;
}

interface PageProps {
    quotations: Quotation[];
}

const QuotationsIndex: React.FC<PageProps> = ({ quotations }) => {
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const paginatedQuotations = quotations.slice((currentPage - 1) * perPage, currentPage * perPage);
    const totalPages = Math.ceil(quotations.length / perPage);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            approved: 'default',
            pending: 'secondary',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status] || 'outline'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const handleDownload = (id: number) => {
        window.open(`/quotations/${id}/pdf`, '_blank');
    };

    return (
        <AppLayout title="Quotations" breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Quotations' }]}>
            <div className="p-6">
                <div className="overflow-x-auto rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Quotation #</th>
                                <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Issue Date</th>
                                <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                                <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {paginatedQuotations.length > 0 ? (
                                paginatedQuotations.map((row) => (
                                    <tr key={row.id} className="align-top">
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{row.quotation_number}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm">{row.customer?.company_name}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm">{row.issue_date}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm">{getStatusBadge(row.status)}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm">{row.total_amount}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <a href={`/quotations/${row.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                    </a>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(row.id)}>
                                                <Download className="h-4 w-4" />
                    </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center">No quotations found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                {quotations.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, quotations.length)} of {quotations.length} results
                                <div className="mt-1 text-xs opacity-60">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                {/* Per Page Selector */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">Show:</span>
                                    <Select value={perPage.toString()} onValueChange={(v) => {
                                        setPerPage(Number(v));
                                        setCurrentPage(1);
                                    }}>
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
                                {/* Page Navigation */}
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    >
                                        Previous
                                    </Button>
                                    {totalPages > 1 && (
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNumber;
                                                if (totalPages <= 5) {
                                                    pageNumber = i + 1;
                                                } else {
                                                    if (currentPage <= 3) {
                                                        pageNumber = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNumber = totalPages - 4 + i;
                                                    } else {
                                                        pageNumber = currentPage - 2 + i;
                                                    }
                                                }
    return (
                                                    <Button
                                                        key={pageNumber}
                                                        variant={pageNumber === currentPage ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => setCurrentPage(pageNumber)}
                                                    >
                                                        {pageNumber}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
        </AppLayout>
    );
};

(QuotationsIndex as any).layout = (page: React.ReactNode) => (
    <AppLayout title="Quotations" breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Quotations' }]}>
        {page}
    </AppLayout>
);

export default QuotationsIndex;
