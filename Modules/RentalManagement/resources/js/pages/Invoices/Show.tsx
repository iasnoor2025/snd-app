import React from 'react';
import { Head } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';
import MainLayout from '@/Layouts/MainLayout';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Download, Printer, Send } from 'lucide-react';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Customer {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  rental_id: number | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  notes: string;
  customer: Customer;
  items: InvoiceItem[];
}

interface Document {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
}

interface ShowProps {
  invoice: Invoice;
  documents: Document[];
}

export default function Show({ invoice, documents }: ShowProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent':
        return 'bg-blue-200 text-blue-800';
      case 'paid':
        return 'bg-green-200 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-200 text-yellow-800';
      case 'overdue':
        return 'bg-red-200 text-red-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <MainLayout>
      <Head title={`${t('invoice')} ${invoice.invoice_number}`} />

      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('invoice')} #{invoice.invoice_number}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/invoices/${invoice.id}/pdf`, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              {t('print')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => Inertia.post(`/invoices/${invoice.id}/email`)}
            >
              <Send className="w-4 h-4 mr-2" />
              {t('send')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => Inertia.visit(`/invoices/${invoice.id}/edit`)}
            >
              {t('edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>{t('invoice_details')}</CardTitle>
              <CardDescription>{t('invoice_information')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('invoice_number')}</p>
                  <p>{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('status')}</p>
                  <Badge className={getStatusColor(invoice.status)}>
                    {t(invoice.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('issue_date')}</p>
                  <p>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('due_date')}</p>
                  <p>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customer')}</CardTitle>
              <CardDescription>{t('customer_information')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.customer.company_name}</p>
              <p>{invoice.customer.contact_name}</p>
              <p>{invoice.customer.email}</p>
              <p>{invoice.customer.phone}</p>
              <p className="whitespace-pre-line">{invoice.customer.address}</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('invoice_items')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead className="text-right">{t('quantity')}</TableHead>
                  <TableHead className="text-right">{t('unit_price')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">{t('subtotal')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.subtotal)}</TableCell>
                </TableRow>
                {invoice.discount_amount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">{t('discount')}</TableCell>
                    <TableCell className="text-right">-{formatCurrency(invoice.discount_amount)}</TableCell>
                  </TableRow>
                )}
                {invoice.tax_amount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">{t('tax')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.tax_amount)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">{t('total')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                </TableRow>
                {invoice.paid_amount > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">{t('paid_amount')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.paid_amount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">{t('balance')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.balance)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('documents')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <span>{doc.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download')}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => Inertia.visit('/invoices')}
          >
            {t('back_to_invoices')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
