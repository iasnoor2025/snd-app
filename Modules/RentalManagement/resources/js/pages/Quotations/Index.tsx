import { Button } from '@/Core/components/ui/button';
import { DataTable } from '@/Core/components/ui/data-table';
import AppLayout from '@/Core/layouts/AppLayout';
import React from 'react';

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
    const handleDownload = (id: number) => {
        window.open(`/quotations/${id}/pdf`, '_blank');
    };

    const columns = [
        {
            header: 'Quotation #',
            accessorKey: 'quotation_number',
        },
        {
            header: 'Customer',
            accessorKey: 'customer',
            cell: (row: Quotation) => row.customer?.company_name || '',
        },
        {
            header: 'Issue Date',
            accessorKey: 'issue_date',
        },
        {
            header: 'Status',
            accessorKey: 'status',
        },
        {
            header: 'Total',
            accessorKey: 'total_amount',
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: (row: Quotation) => (
                <div className="flex gap-2">
                    <a href={`/quotations/${row.id}`} className="mr-2">
                        <Button size="sm">View</Button>
                    </a>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(row.id)}>
                        Download
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <DataTable data={quotations} columns={columns as any} />
        </div>
    );
};

(QuotationsIndex as any).layout = (page: React.ReactNode) => (
    <AppLayout title="Quotations" breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Quotations' }]}>
        {page}
    </AppLayout>
);

export default QuotationsIndex;
