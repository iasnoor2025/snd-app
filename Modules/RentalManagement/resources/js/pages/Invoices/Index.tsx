

import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@/Core/components/ui';

interface Invoice {
    id: number;
    invoice_number: string;
    customer: { company_name: string };
    issue_date: string;
    status: string;
    total_amount: string;
}

interface PageProps {
    invoices: Invoice[];
}

const InvoicesIndex: React.FC<PageProps> = ({ invoices }) => {
    const { t } = useTranslation(['common', 'rentals']);

    const handleDownload = (id: number) => {
        // TODO: Implement download logic
        toast.info(t('common:download_not_implemented'));
    };

    return (
        <div className="p-6">
            <Head title={t('rentals:invoices')} />
            <h1 className="mb-4 text-2xl font-bold">{t('rentals:invoices')}</h1>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('rentals:invoice_number')}</TableCell>
                        <TableCell>{t('rentals:customer')}</TableCell>
                        <TableCell>{t('rentals:issue_date')}</TableCell>
                        <TableCell>{t('common:status')}</TableCell>
                        <TableCell>{t('rentals:total')}</TableCell>
                        <TableCell>{t('common:actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>{inv.invoice_number}</TableCell>
                            <TableCell>{inv.customer?.company_name}</TableCell>
                            <TableCell>{inv.issue_date}</TableCell>
                            <TableCell>{inv.status}</TableCell>
                            <TableCell>{inv.total_amount}</TableCell>
                            <TableCell>
                                <Link href={`/invoices/${inv.id}`} className="mr-2">
                                    <Button size="sm">{t('common:view')}</Button>
                                </Link>
                                <Button size="sm" onClick={() => handleDownload(inv.id)}>
                                    {t('common:download')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InvoicesIndex;
