import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import PaymentTracker from '../../../Components/rentals/PaymentTracker';
// import PaymentListing from '@/Modules/Core/resources/js/components/payments/PaymentListing';
import { formatCurrency } from '@/Modules/Core/resources/js/utils/format';
import { AdminLayout } from '@/Modules/Core/resources/js';
// Placeholder usePermission hook
const usePermission = () => ({ hasPermission: () => true });
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/Modules/Core/resources/js/components/ui/tabs';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: number;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  reference: string;
  notes?: string;
  receipt_path?: string;
  created_by: {
    id: number;
    name: string;
  };
}

interface Rental {
  id: number;
  rental_number?: string;
  total_amount: number;
  deposit_amount?: number;
  payment_terms_days?: number;
  payment_due_date?: string;
  status: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;
  payment_status: 'paid' | 'partial' | 'overdue';
  customer?: {
    id: number;
    company_name: string;
  };
}

interface Props {
  rental: Rental;
  payments: Payment[];
}

export default function Index({ rental, payments }: Props) {
  const { t } = useTranslation('rental');


  const { hasPermission } = usePermission();
  const canCreateRentalpayments = hasPermission('rental-payments.create');
const [activeTab, setActiveTab] = useState<string>('tracker');

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rentals', href: route('rentals.index') },
    { title: `Rental #${rental.rental_number || rental.id}`, href: route('rentals.show', rental.id) },
    { title: 'Payments', href: route('rentals.payments.index', rental.id) }
  ];

  const handleAddPayment = async (payment: Omit<Payment, 'id' | 'created_by'>) => {
    try {
      const formData = new FormData();
      Object.entries(payment).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await fetch(`/rentals/${rental.id}/payments`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      window.location.reload();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment. Please try again.');
    }
  };

  const handleSendReminder = async () => {
    try {
      const response = await fetch(`/rentals/${rental.id}/payments/reminder`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Payment reminder sent successfully');
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send payment reminder');
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const response = await fetch(`/rentals/${rental.id}/payments/invoice`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.invoice_url) {
          window.open(data.invoice_url, '_blank');
        } else {
          toast.success('Invoice generated successfully');
        }
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  return (
    <AdminLayout title={t('payment_management')} breadcrumbs={breadcrumbs}>
      <Head title={t('payment_management')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('rentals.show', rental.id)}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{t('payment_management')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={route('payments.index')}>
                View All Payments
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Payment Management for Rental #{rental.rental_number || rental.id}</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use <strong>{t('add_payment')}</strong> to record new payments received from customers</li>
                    <li>Total rental amount: <strong>{formatCurrency(rental.total_amount)}</strong></li>
                    <li>Rental status: <strong>{rental.status}</strong></li>
                    {rental.customer && (
                      <li>customer: <strong>{rental.customer.company_name}</strong></li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={val => setActiveTab(val)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracker">{t('dashboard_view')}</TabsTrigger>
              <TabsTrigger value="list">{t('detailed_list')}</TabsTrigger>
            </TabsList>
            <TabsContent value="tracker" className="mt-4">
              <PaymentTracker
                rental={rental}
                payments={payments}
                onAddPayment={handleAddPayment}
                onSendReminder={handleSendReminder}
                onGenerateInvoice={handleGenerateInvoice}
              />
            </TabsContent>
            {/* <TabsContent value="list" className="mt-4">
              <PaymentListing
                rental={rental}
                payments={payments}
              />
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}















