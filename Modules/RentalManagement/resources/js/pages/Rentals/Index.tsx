import { AppLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import { Head, Link, router } from '@inertiajs/react';
import { Banknote, Car, Clock, MoreHorizontal, Plus, Search, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RentalsList } from '../../Components/rentals/RentalsList';

interface Props {
    rentals: {
        data: any[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    customers: any[];
    filters: {
        search?: string;
        status?: string;
        customer_id?: string;
        page?: number;
        per_page?: number;
    };
}

export default function Index({ rentals, customers, filters }: Props) {
    const { t } = useTranslation(['common', 'rentals', 'status']);

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [customerId, setCustomerId] = useState(filters.customer_id || 'all');
    const [page, setPage] = useState(filters.page || 1);
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    const breadcrumbs = [
        { title: t('common:dashboard'), href: route('dashboard') },
        { title: t('rentals:rentals'), href: route('rentals.index') },
    ];

    // Debounced search
    const updateFilters = useCallback(
        (newFilters: any) => {
            const params = new URLSearchParams();

            if (newFilters.search) params.set('search', newFilters.search);
            if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);
            if (newFilters.customer_id && newFilters.customer_id !== 'all') params.set('customer_id', newFilters.customer_id);
            if (newFilters.page && newFilters.page !== 1) params.set('page', newFilters.page.toString());
            if (newFilters.per_page && newFilters.per_page !== 10) params.set('per_page', newFilters.per_page.toString());

            const url = `${route('rentals.index')}?${params.toString()}`;
            router.visit(url, { preserveState: true, preserveScroll: true });
        },
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters({ search, status, customer_id: customerId, page: 1, per_page: perPage });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, status, customerId, perPage, updateFilters]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateFilters({ search, status, customer_id: customerId, page: newPage, per_page: perPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        setPage(1);
        updateFilters({ search, status, customer_id: customerId, page: 1, per_page: newPerPage });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { variant: 'default', className: 'bg-green-100 text-green-800' },
            pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
            completed: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
            cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
            overdue: { variant: 'destructive', className: 'bg-orange-100 text-orange-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <Badge variant={config.variant as any} className={config.className}>
                {t(`status:${status}`)}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(num || 0);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout title={t('rentals:rentals')} breadcrumbs={breadcrumbs}>
            <Head title={t('rentals:rentals')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('rentals:rentals')}</CardTitle>
                        <div className="flex gap-2">
                            <Button asChild>
                                <Link href={route('rentals.create')}>{t('rentals:create_rental')}</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                                placeholder={t('rentals:search_rentals')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('status:all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('status:all_statuses')}</SelectItem>
                                    <SelectItem value="active">{t('status:active')}</SelectItem>
                                    <SelectItem value="completed">{t('status:completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('status:cancelled')}</SelectItem>
                                    <SelectItem value="pending">{t('status:pending')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('common:rows_per_page')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((opt) => (
                                        <SelectItem key={opt} value={opt.toString()}>
                                            {opt} {t('common:rows_per_page')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <RentalsList
                            rentals={rentals.data}
                            customers={customers}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                            currentPage={rentals.current_page}
                            lastPage={rentals.last_page}
                            perPage={rentals.per_page}
                            total={rentals.total}
                            getStatusBadge={getStatusBadge}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
