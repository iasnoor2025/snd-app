import React from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Quotation {
  id: number;
  quotation_number: string;
  pdf_url?: string;
}

interface PageProps {
  quotation: Quotation;
}

const DownloadQuotation: React.FC<PageProps> = ({ quotation }) => {
  const handleDownload = () => {
    if (quotation.pdf_url) {
      window.open(quotation.pdf_url, '_blank');
    } else {
      toast.error('PDF not available');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Download Quotation #{quotation.quotation_number}</h1>
      <Button onClick={handleDownload}>Download PDF</Button>
    </div>
  );
};

export default DownloadQuotation;
