import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/Core/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AppLayout from '@/Core/layouts/AppLayout';

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quotations</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quotation #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map(q => (
            <TableRow key={q.id}>
              <TableCell>{q.quotation_number}</TableCell>
              <TableCell>{q.customer?.company_name}</TableCell>
              <TableCell>{q.issue_date}</TableCell>
              <TableCell>{q.status}</TableCell>
              <TableCell>{q.total_amount}</TableCell>
              <TableCell>
                <Link href={`/quotations/${q.id}`} className="mr-2">
                  <Button size="sm">View</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleDownload(q.id)}>
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

QuotationsIndex.layout = (page: React.ReactNode) => <AppLayout title="Quotations">{page}</AppLayout>;

export default QuotationsIndex;
