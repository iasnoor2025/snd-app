import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import type { Customer, PageProps } from '../../types/index.d';
import { Eye, Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Permission } from '@/Core';
import { router } from '@inertiajs/core';

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

export default function Index({ customers }: Props) {
    const { t } = useTranslation('customer');

    const breadcrumbs = [
        { title: t('nav_dashboard'), href: '/dashboard' },
        { title: t('ttl_customers'), href: route('customers.index') },
    ];

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [city, setCity] = useState('all');
    const [perPage, setPerPage] = useState<number>(Number(new URLSearchParams(window.location.search).get('per_page')) || 10);
    const safeCustomers = Array.isArray(customers.data) ? customers.data : [];
    const cities = Array.from(new Set(safeCustomers.map((c) => c.city).filter(Boolean)));

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

    // Filtering logic (simulate backend filtering for demo)
    const filteredCustomers = safeCustomers.filter((customer) => {
        const matchesSearch =
            !search ||
            customer.name?.toLowerCase().includes(search.toLowerCase()) ||
            customer.email?.toLowerCase().includes(search.toLowerCase()) ||
            customer.contact_person?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || customer.status === status;
        const matchesCity = city === 'all' || customer.city === city;
        return matchesSearch && matchesStatus && matchesCity;
    });

    return (
        <AppLayout title={t('ttl_customers')} breadcrumbs={breadcrumbs}>
            <Head title={t('ttl_customers')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('ttl_customers')}</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={handleSync} variant="outline">
                                {t('Sync from ERPNext')}
                            </Button>
                            <Button asChild>
                                <a href={route('customers.create')}>{t('ttl_create_customer')}</a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Input
                                placeholder={t('ph_search_customers')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                            <Select value={status || ''} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                    <SelectItem value="active">{t('status_active')}</SelectItem>
                                    <SelectItem value="inactive">{t('status_inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={city || ''} onValueChange={setCity}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_cities')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_cities')}</SelectItem>
                                    {cities.map((city) => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-6 rounded-md border overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer Name</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {safeCustomers.length > 0 ? (
                                        safeCustomers.map((customer: Customer) => (
                                            <tr key={customer.id} className="align-top">
                                                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{customer.name}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{customer.email}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{customer.phone}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{typeof customer.status === 'string' ? <Badge variant={customer.status === 'active' ? 'default' : 'outline'}>{customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}</Badge> : '—'}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <a href={window.route('customers.show', customer.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a href={window.route('customers.edit', customer.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Permission permission="customers.delete">
                                                        <a href={window.route('customers.destroy', customer.id)} data-method="delete" data-confirm={t('delete_confirm', 'Are you sure you want to delete this customer?')}>
                                                            <Button variant="destructive" size="icon" className="h-7 w-7">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </Permission>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-4 text-center">
                                                {t('no_customers_found', 'No customers found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {safeCustomers.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(customers.current_page - 1) * customers.per_page + 1} to {Math.min(customers.current_page * customers.per_page, customers.total)} of {customers.total} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {customers.current_page} of {customers.last_page}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={(v) => {
                                                setPerPage(Number(v));
                                                router.get(route('customers.index'), { page: 1, perPage: Number(v), search, status, city }, { preserveState: true, replace: true });
                                            }}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="25">25</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Page Navigation */}
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={customers.current_page === 1}
                                                onClick={() => router.get(route('customers.index'), { page: customers.current_page - 1, perPage, search, status, city }, { preserveState: true, replace: true })}
                                            >
                                                Previous
                                            </Button>
                                            {customers.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, customers.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        if (customers.last_page <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (customers.current_page <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (customers.current_page >= customers.last_page - 2) {
                                                                pageNumber = customers.last_page - 4 + i;
                                                            } else {
                                                                pageNumber = customers.current_page - 2 + i;
                                                            }
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === customers.current_page ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => router.get(route('customers.index'), { page: pageNumber, perPage, search, status, city }, { preserveState: true, replace: true })}
                                                            >
                                                                {pageNumber}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={customers.current_page === customers.last_page}
                                                onClick={() => router.get(route('customers.index'), { page: customers.current_page + 1, perPage, search, status, city }, { preserveState: true, replace: true })}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
