import React from "react";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import { cn } from "@/Core";
import { router } from "@inertiajs/react";

// ShadCN UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";

// Icons
import {
  Download,
  Eye,
  FilePlus,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  is_overdue: boolean;
  is_paid: boolean;
  created_at: string;
}

interface InvoicesCardProps {
  invoices: {
    data: Invoice[];
    total: number;
    total_amount: number;
    total_paid: number;
    total_outstanding: number;
    has_overdue: boolean;
  };
  rental: any;
  canCreateInvoice?: boolean;
  className?: string;
}

export default function InvoicesCard({
  invoices,
  rental,
  canCreateInvoice = false,
  className = ""
}: InvoicesCardProps) {
  const { t } = useTranslation('rental');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.is_paid) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    }

    if (invoice.is_overdue) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const handleCreateInvoice = () => {
    router.post(route('rentals.create-invoice', rental.id));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>{t('invoice_details_for_this_rental')}</CardDescription>
          </div>
          {canCreateInvoice && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateInvoice}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {invoices.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">{t('no_invoices_created_yet')}</p>
            {canCreateInvoice && (
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateInvoice}
                className="mt-2"
              >
                <FilePlus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    {invoice.created_at
                      ? format(new Date(invoice.created_at), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{getStatusBadge(invoice)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <a href={route('invoices.show', invoice.id)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <a href={route('invoices.download', invoice.id)}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {invoices.data.length > 0 && (
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">Total Amount:</div>
              <div className="text-right">{formatCurrency(invoices.total_amount)}</div>
              <div className="font-medium">Total Paid:</div>
              <div className="text-right text-green-600">{formatCurrency(invoices.total_paid)}</div>
              <div className="font-medium">Outstanding:</div>
              <div className="text-right text-red-600">{formatCurrency(invoices.total_outstanding)}</div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}














