import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Download,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  User
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/format";

// Placeholder types
type PageProps = any;
type Employee = any;
type Rental = any;
type Payment = any;
type BreadcrumbItem = { title: string; href: string };

interface Props extends PageProps {
  auth: any;
  rental: Rental;
  payment: Payment;
  employees: Employee[];
}

export default function Show({ auth, payment }: Props) {
  const { t } = useTranslation('rental');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rentals', href: route('rentals.index') },
    { title: `Rental #${payment.rental.rental_number || payment.rental.id}`, href: route('rentals.show', payment.rental.id) },
    { title: 'Payments', href: route('rentals.payments.index', payment.rental.id) },
    { title: `Payment #${payment.id}`, href: route('rentals.payments.show', [payment.rental.id, payment.id]) }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout title={t('payment_details')} breadcrumbs={breadcrumbs}>
      <Head title={`Payment #${payment.id}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('rentals.payments.index', payment.rental.id)}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{t('payment_details')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {payment.receipt_path && (
              <Button variant="outline" size="sm" asChild>
                <Link href={route('payments.receipt', payment.id)} target="_blank" rel="noopener noreferrer">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={route('payments.receipt', payment.id)} download>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('ttl_payment_information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-lg font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(payment.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Method</span>
                <span className="font-medium">{payment.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Reference</span>
                <span className="font-medium">{payment.reference || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium">{format(new Date(payment.date), "MMM dd, yyyy")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('rental_information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('lbl_rental_id')}</span>
                <Link href={route('rentals.show', payment.rental.id)} className="font-medium text-blue-600 hover:underline">
                  #{payment.rental.rental_number || payment.rental.id}
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('th_total_amount')}</span>
                <span className="font-medium">{formatCurrency(payment.rental.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('due_date')}</span>
                <span className="font-medium">
                  {payment.rental.payment_due_date
                    ? format(new Date(payment.rental.payment_due_date), "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant="outline">{payment.rental.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('ttl_additional_information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('created_by')}</span>
                <span className="font-medium">{payment.created_by.name}</span>
              </div>
              {payment.notes && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500 block mb-2">Notes</span>
                  <p className="text-sm">{payment.notes}</p>
                </div>
              )}
              {payment.receipt_path && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">{t('receipt_image')}</h3>
                  <div className="border rounded-md p-2">
                    <img
                      src={`/storage/${payment.receipt_path}`}
                      alt={t('payment_receipt')}
                      className="max-h-64 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}














