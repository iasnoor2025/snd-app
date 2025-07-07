import React from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      <h1 className="text-2xl font-bold mb-4">Download Invoice #{invoice.invoice_number}</h1>
      <Button onClick={handleDownload}>Download PDF</Button>
    </div>
  );
};

export default DownloadInvoice;
