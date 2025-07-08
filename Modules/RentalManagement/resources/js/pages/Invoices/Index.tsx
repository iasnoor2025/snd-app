import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@/Core/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const handleDownload = (id: number) => {
    // TODO: Implement download logic
    toast.info('Download not implemented yet');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map(inv => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoice_number}</TableCell>
              <TableCell>{inv.customer?.company_name}</TableCell>
              <TableCell>{inv.issue_date}</TableCell>
              <TableCell>{inv.status}</TableCell>
              <TableCell>{inv.total_amount}</TableCell>
              <TableCell>
                <Link href={`/invoices/${inv.id}`} className="mr-2">
                  <Button size="sm">View</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleDownload(inv.id)}>
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

export default InvoicesIndex;
