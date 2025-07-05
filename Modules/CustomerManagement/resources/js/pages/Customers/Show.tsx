import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import type { PageProps, Customer } from '../../types/index.d';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { route } from 'ziggy-js';
import { Mail, Phone, Globe, User, Building2, BadgeDollarSign, Calendar, Info, UserCheck, UserX } from 'lucide-react';
import { formatDateTime } from '@/Core/utils/dateFormatter';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Customers', href: route('customers.index') },
  { title: 'Show', href: '#' },
];

interface Props extends PageProps {
  customer: Customer;
  attachments?: any[];
  rentals?: any;
  invoices?: any;
  payments?: any;
  user?: any;
  translations?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  countries?: any[];
}

const ShowCustomer: React.FC<Props> = ({ customer, attachments = [], rentals = {}, invoices = {}, payments = {}, user = {}, translations = {}, created_at, updated_at, deleted_at, countries = [] }) => {
  const { t } = useTranslation('customer');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'} className="text-xs px-2 py-1">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <AppLayout title={t('ttl_customer_details')} breadcrumbs={breadcrumbs}>
      <Head title={t('ttl_customer_details')} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="w-full shadow-lg bg-muted/50 border border-muted-foreground/10">
          {/* Header Section */}
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-muted-foreground/10 bg-white/80 px-8 py-10">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{customer.name}</span>
                  {getStatusBadge(customer.status)}
                </div>
                <div className="mt-1 text-muted-foreground text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {customer.contact_person || <span className="text-muted-foreground">-</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button asChild variant="secondary">
                <Link href={route('customers.edit', customer.id)}>{t('edit')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={route('customers.index')}>{t('back')}</Link>
              </Button>
            </div>
          </CardHeader>

          {/* Info Sections */}
          <CardContent className="py-12 px-4 md:px-12 lg:px-24">
            {/* Contact & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Info className="w-5 h-5" />{t('contact_information')}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('email')}:</span>
                  <span>{customer.email || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('phone')}:</span>
                  <span>{customer.phone || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('website')}:</span>
                  {customer.website ? (
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{customer.website}</a>
                  ) : <span className="text-muted-foreground">-</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('address')}:</span>
                  <span>{customer.address || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('city')}:</span>
                  <span>{customer.city || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('state')}:</span>
                  <span>{customer.state || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('postal_code')}:</span>
                  <span>{customer.postal_code || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('country')}:</span>
                  <span>{customer.country || <span className="text-muted-foreground">-</span>}</span>
                </div>
              </div>
              {/* Financial & Other Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><BadgeDollarSign className="w-5 h-5" />{t('financial_information')}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <BadgeDollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('credit_limit')}:</span>
                  <span>{customer.credit_limit ? `$${customer.credit_limit}` : <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('tax_id')}:</span>
                  <span>{customer.tax_id || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('tax_number')}:</span>
                  <span>{customer.tax_number || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('payment_terms')}:</span>
                  <span>{customer.payment_terms || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('is_active')}:</span>
                  {customer.is_active ? (
                    <Badge variant="default" className="text-xs px-2 py-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> {t('active')}</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs px-2 py-1 flex items-center gap-1"><UserX className="w-3 h-3" /> {t('inactive')}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{t('notes')}:</span>
                  <span>{customer.notes || <span className="text-muted-foreground">-</span>}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">User ID:</span>
                  <span>{customer.user_id || <span className="text-muted-foreground">-</span>}</span>
                </div>
              </div>
            </div>
            {/* Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-muted-foreground/10 pt-8 mt-8">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t('created_at')}:</span>
                <span>{formatDateTime(customer.created_at) || <span className="text-muted-foreground">-</span>}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t('updated_at')}:</span>
                <span>{formatDateTime(customer.updated_at) || <span className="text-muted-foreground">-</span>}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShowCustomer;
