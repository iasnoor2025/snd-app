import React from 'react';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/Core/layouts/AppLayout';
import { Button } from '@/Core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Core/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Core/components/ui/table';
import { Badge } from '@/Core/components/ui/badge';
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
  erpInvoice?: any;
}

export default function Show({ invoice, documents, erpInvoice }: ShowProps) {
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
    <AppLayout>
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

        {/* ERPNext Invoice Info */}
        {erpInvoice && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ERPNext Invoice</CardTitle>
              <CardDescription>ERPNext invoice details synced for this rental</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">ERPNext Invoice #:</p>
                  <p>{erpInvoice.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <p>{erpInvoice.status || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">Posting Date:</p>
                  <p>{erpInvoice.posting_date || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">Due Date:</p>
                  <p>{erpInvoice.due_date || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">Grand Total:</p>
                  <p>{erpInvoice.grand_total || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">Outstanding Amount:</p>
                  <p>{erpInvoice.outstanding_amount || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('invoice_details')}</CardTitle>
            <CardDescription>{t('invoice_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">{t('invoice_number')}:</p>
                <p>{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="font-semibold">{t('issue_date')}:</p>
                <p>{invoice.issue_date && !isNaN(Date.parse(invoice.issue_date)) ? format(new Date(invoice.issue_date), 'MM/dd/yyyy') : '-'}</p>
              </div>
              <div>
                <p className="font-semibold">{t('due_date')}:</p>
                <p>{invoice.due_date && !isNaN(Date.parse(invoice.due_date)) ? format(new Date(invoice.due_date), 'MM/dd/yyyy') : '-'}</p>
              </div>
              <div>
                <p className="font-semibold">{t('status')}:</p>
                <Badge className={getStatusColor(invoice.status)}>{t(invoice.status)}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">{t('customer')}:</p>
                <p>{invoice.customer.company_name}</p>
              </div>
              <div>
                <p className="font-semibold">{t('contact_person')}:</p>
                <p>{invoice.customer.contact_name}</p>
              </div>
              <div>
                <p className="font-semibold">{t('email')}:</p>
                <p>{invoice.customer.email}</p>
              </div>
              <div>
                <p className="font-semibold">{t('phone')}:</p>
                <p>{invoice.customer.phone}</p>
              </div>
              <div>
                <p className="font-semibold">{t('address')}:</p>
                <p>{invoice.customer.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">{t('subtotal')}:</p>
                <p>{formatCurrency(invoice.subtotal)}</p>
              </div>
              <div>
                <p className="font-semibold">{t('discount_amount')}:</p>
                <p>{formatCurrency(invoice.discount_amount)}</p>
              </div>
              <div>
                <p className="font-semibold">{t('tax_amount')}:</p>
                <p>{formatCurrency(invoice.tax_amount)}</p>
              </div>
              <div>
                <p className="font-semibold">{t('total_amount')}:</p>
                <p>{formatCurrency(invoice.total_amount)}</p>
              </div>
              <div>
                <p className="font-semibold">{t('paid_amount')}:</p>
                <p>{formatCurrency(invoice.paid_amount)}</p>
              </div>
              <div>
                <p className="font-semibold">{t('balance')}:</p>
                <p>{formatCurrency(invoice.balance)}</p>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-4">
                <p className="font-semibold">{t('notes')}:</p>
                <p>{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('invoice_items')}</CardTitle>
            <CardDescription>{t('invoice_items_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('unit_price')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {documents.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('documents')}</CardTitle>
              <CardDescription>{t('documents_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('file_name')}</TableHead>
                    <TableHead>{t('size')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>{doc.file_name}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          {t('view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
