
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/Core/Components/ui';

interface Invoice {
    id: number;
    invoice_number: string;
    pdf_url?: string;
}

interface PageProps {
    invoice: Invoice;
}

const DownloadInvoice: React.FC<PageProps> = ({ invoice }) => {
    const handleDownload = () => {
        if (invoice.pdf_url) {
            window.open(invoice.pdf_url, '_blank');
        } else {
            toast.error('PDF not available');
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">Download Invoice #{invoice.invoice_number}</h1>
            <Button onClick={handleDownload}>Download PDF</Button>
        </div>
    );
};

export default DownloadInvoice;
