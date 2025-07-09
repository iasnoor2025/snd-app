import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import type { PageProps, Customer } from '../../types/index.d';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { Badge } from "@/Core";
import { route } from 'ziggy-js';
import { toast } from 'sonner';
// Placeholder for permission and reusable button components
// import { Permission } from "@/Core";
// import { CreateButton } from "@/Core";
// import { CrudButtons } from "@/Core";

interface Props extends PageProps {
  customers: {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    [key: string]: any;
  };
}

const Index: React.FC<Props> = ({ customers }) => {
  const { t } = useTranslation('customer');

  const breadcrumbs = [
    { title: t('nav_dashboard'), href: '/dashboard' },
    { title: t('ttl_customers'), href: route('customers.index') },
  ];

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState<number>(Number(new URLSearchParams(window.location.search).get('per_page')) || 10);
  const safeCustomers = Array.isArray(customers.data) ? customers.data : [];

  // Unique cities for filter dropdown
  const cities = Array.from(new Set(safeCustomers.map(c => c.city).filter(Boolean)));

  // Filtered customers (filtering now handled on backend, so just use safeCustomers)
  const filteredCustomers = safeCustomers;

  const getStatusBadge = (status: string) => {

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{t(`status_${status}`)}</Badge>;
  };

  const handleSync = async () => {
    try {
      const res = await fetch('/api/customers/sync-erpnext', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Customers synced from ERPNext successfully');
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to sync customers from ERPNext');
      }
    } catch (e) {
      toast.error('Failed to sync customers from ERPNext');
    }
  };

  return (
    <AppLayout title={t('ttl_customers')} breadcrumbs={breadcrumbs}>
      <Head title={t('ttl_customers')} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{t('ttl_customers')}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSync} variant="outline">
                {t('Sync from ERPNext')}
              </Button>
              {/* <Permission permission="customers.create"> */}
                {/* <CreateButton resourceType="customers" text="Add Customer" /> */}
                <Button asChild>
                  <Link href={route('customers.create')}>{t('ttl_create_customer')}</Link>
                </Button>
              {/* </Permission> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder={t('ph_search_customers')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8"
              />
              <select className="w-full border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="all">{t('all_statuses')}</option>
                <option value="active">{t('status_active')}</option>
                <option value="inactive">{t('status_inactive')}</option>
              </select>
              <select className="w-full border rounded px-2 py-1" value={city} onChange={e => setCity(e.target.value)}>
                <option value="all">{t('all_cities')}</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="perPage" className="font-medium">{t('Rows per page')}:</label>
              <select
                id="perPage"
                className="border rounded px-2 py-1"
                value={perPage}
                onChange={e => {
                  const value = Number(e.target.value);
                  setPerPage(value);
                  const params = new URLSearchParams(window.location.search);
                  params.set('per_page', value.toString());
                  window.location.href = `${window.location.pathname}?${params.toString()}`;
                }}
              >
                {[10, 25, 50, 100].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-center py-8">{t('msg_loading')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('lbl_name')}</TableHead>
                    <TableHead>{t('lbl_contact_person')}</TableHead>
                    <TableHead>{t('lbl_email')}</TableHead>
                    <TableHead>{t('lbl_phone')}</TableHead>
                    <TableHead>{t('lbl_city')}</TableHead>
                    <TableHead>{t('lbl_status')}</TableHead>
                    <TableHead>{t('lbl_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.contact_person}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        {/* <CrudButtons resourceType="customers" id={customer.id} /> */}
                        <Button asChild size="sm" variant="secondary" className="mr-2">
                          <Link href={route('customers.show', customer.id)}>{t('btn_show')}</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={route('customers.edit', customer.id)}>{t('btn_edit')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <Button
                asChild
                size="sm"
                variant="outline"
                disabled={!customers.prev_page_url}
              >
                <Link href={customers.prev_page_url || '#'}>{t('Previous')}</Link>
              </Button>
              <span>
                {t('Page')} {customers.current_page} {t('of')} {customers.last_page}
              </span>
              <Button
                asChild
                size="sm"
                variant="outline"
                disabled={!customers.next_page_url}
              >
                <Link href={customers.next_page_url || '#'}>{t('Next')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;














