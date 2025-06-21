import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import type { PageProps, Customer } from '../../types/index.d';
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { route } from 'ziggy-js';
// Placeholder for permission and reusable button components
// import Permission from "@/components/Permission";
// import CreateButton from "@/components/shared/CreateButton";
// import CrudButtons from "@/components/shared/CrudButtons";

interface Props extends PageProps {
  customers: Customer[];
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
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Unique cities for filter dropdown
  const cities = Array.from(new Set(safeCustomers.map(c => c.city).filter(Boolean)));

  // Filtered customers
  const filteredCustomers = safeCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || c.status === status;
    const matchesCity = city === 'all' || c.city === city;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusBadge = (status: string) => {

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{t(`status_${status}`)}</Badge>;
  };

  return (
    <AppLayout title={t('ttl_customers')} breadcrumbs={breadcrumbs}>
      <Head title={t('ttl_customers')} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{t('ttl_customers')}</CardTitle>
            {/* <Permission permission="customers.create"> */}
              {/* <CreateButton resourceType="customers" text="Add Customer" /> */}
              <Button asChild>
                <Link href={route('customers.create')}>{t('ttl_create_customer')}</Link>
              </Button>
            {/* </Permission> */}
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Index;














