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
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import type { Customer, PageProps } from '../../types/index.d';

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
                                <Link href={route('customers.create')}>{t('ttl_create_customer')}</Link>
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
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                    <SelectItem value="active">{t('status_active')}</SelectItem>
                                    <SelectItem value="inactive">{t('status_inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={city} onValueChange={setCity}>
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
                            <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('Rows per page')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((opt) => (
                                        <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="overflow-x-auto rounded-md border">
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
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.slice(0, perPage).map((customer) => (
                                            <TableRow key={customer.id}>
                                                <TableCell>{customer.name}</TableCell>
                                                <TableCell>{customer.contact_person}</TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>{customer.phone}</TableCell>
                                                <TableCell>{customer.city}</TableCell>
                                                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                                                <TableCell>
                                                    <Button asChild size="sm" variant="secondary" className="mr-2">
                                                        <Link href={route('customers.show', customer.id)}>{t('btn_show')}</Link>
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={route('customers.edit', customer.id)}>{t('btn_edit')}</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-4 text-center">
                                                {t('no_customers_found', 'No customers found.')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="mt-4 flex items-center justify-between">
                            <Button asChild size="sm" variant="outline" disabled={!customers.prev_page_url}>
                                <Link href={customers.prev_page_url || '#'}>{t('Previous')}</Link>
                            </Button>
                            <span>
                                {t('Page')} {customers.current_page} {t('of')} {customers.last_page}
                            </span>
                            <Button asChild size="sm" variant="outline" disabled={!customers.next_page_url}>
                                <Link href={customers.next_page_url || '#'}>{t('Next')}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
