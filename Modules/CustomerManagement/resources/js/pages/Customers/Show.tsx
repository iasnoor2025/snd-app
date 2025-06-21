import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import type { PageProps, Customer } from '../../types/index.d';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { route } from 'ziggy-js';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Customers', href: route('customers.index') },
  { title: 'Show', href: '#' },
];

interface Props extends PageProps {
  customer: Customer;
}

const ShowCustomer: React.FC<Props> = ({ customer }) => {
  const { t } = useTranslation('customer');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <AppLayout title={t('ttl_customer_details')} breadcrumbs={breadcrumbs}>
      <Head title={t('ttl_customer_details')} />
      <div className="flex justify-center mt-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>{t('ttl_customer_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4"><strong>{t('name')}:</strong> {customer.name}</div>
            <div className="mb-4"><strong>{t('lbl_contact_person')}:</strong> {customer.contact_person}</div>
            <div className="mb-4"><strong>{t('email')}:</strong> {customer.email}</div>
            <div className="mb-4"><strong>{t('phone')}:</strong> {customer.phone}</div>
            <div className="mb-4"><strong>Address:</strong> {customer.address}</div>
            <div className="mb-4"><strong>City:</strong> {customer.city}</div>
            <div className="mb-4"><strong>State:</strong> {customer.state}</div>
            <div className="mb-4"><strong>Postal Code:</strong> {customer.postal_code}</div>
            <div className="mb-4"><strong>Zip:</strong> {customer.zip}</div>
            <div className="mb-4"><strong>Country:</strong> {customer.country}</div>
            <div className="mb-4"><strong>Website:</strong> {customer.website && <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{customer.website}</a>}</div>
            <div className="mb-4"><strong>{t('tax_id')}:</strong> {customer.tax_id}</div>
            <div className="mb-4"><strong>Tax Number:</strong> {customer.tax_number}</div>
            <div className="mb-4"><strong>Credit Limit:</strong> {customer.credit_limit ? `$${customer.credit_limit.toLocaleString()}` : 'N/A'}</div>
            <div className="mb-4"><strong>Is Active:</strong> {customer.is_active ? 'Yes' : 'No'}</div>
            <div className="mb-4"><strong>{t('payment_terms')}:</strong> {customer.payment_terms}</div>
            <div className="mb-4"><strong>{t('status')}:</strong> {getStatusBadge(customer.status)}</div>
            <div className="mb-4"><strong>{t('notes')}:</strong> {customer.notes}</div>
            <div className="mb-4"><strong>User ID:</strong> {customer.user_id}</div>
            <div className="mb-4"><strong>Created At:</strong> {customer.created_at}</div>
            <div className="mb-4"><strong>Updated At:</strong> {customer.updated_at}</div>
            <div className="flex gap-2 mt-6">
              <Button asChild variant="secondary">
                <Link href={route('customers.edit', customer.id)}>Edit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={route('customers.index')}>Back</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShowCustomer;














