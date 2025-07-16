import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Types
import { PageProps } from '@/Core/types';
import { Errors } from '@inertiajs/core';

// Layouts & Hooks
import { AppLayout, usePermission } from '@/Core';

// UI Components
import {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DataTable,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';

// Shared Components
import { CreateButton } from '@/Core';

// Icons
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { CalendarClock, Eye, FileSpreadsheet, Pencil, RefreshCw, Search, Trash, X } from 'lucide-react';

// Types
interface RentalItem {
    id: number;
    equipment_id: number;
    equipment_name: string;
    rate: number;
    rate_type: string;
    days: number;
}

interface Rental {
    id: number;
    rental_number: string;
    customer_name: string;
    customer_email: string;
    start_date: string;
    expected_end_date: string;
    actual_end_date?: string;
    status: string;
    has_operators: boolean;
    total_amount: number;
    rental_items?: RentalItem[];
}

interface Props extends PageProps {
    rentals?: {
        data: Rental[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rentals', href: '/rentals' },
];

export default function Index({ auth, rentals, filters = {} }: Props) {
    const { t } = useTranslation('rental');

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const safeRentals = Array.isArray(rentals?.data) ? rentals.data : [];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
            pending: 'outline',
        };
        return <Badge variant={variants[status] || 'outline'}>{t(`status_${status}`)}</Badge>;
    };

    const filteredRentals = safeRentals.filter((rental) => {
        const matchesSearch =
            !search ||
            rental.rental_number?.toLowerCase().includes(search.toLowerCase()) ||
            rental.customer_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || rental.status === status;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout title={t('ttl_rentals')} breadcrumbs={breadcrumbs}>
            <Head title={t('ttl_rentals')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('ttl_rentals')}</CardTitle>
                        <div className="flex gap-2">
                            <Button asChild>
                                <Link href={route('rentals.create')}>{t('ttl_create_rental')}</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                                placeholder={t('ph_search_rentals')}
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
                                    <SelectItem value="completed">{t('status_completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('status_cancelled')}</SelectItem>
                                    <SelectItem value="pending">{t('status_pending')}</SelectItem>
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
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th>{t('rental_number')}</th>
                                        <th>{t('customer')}</th>
                                        <th>{t('start_date')}</th>
                                        <th>{t('end_date')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('total_amount')}</th>
                                        <th className="text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRentals.length > 0 ? (
                                        filteredRentals.slice(0, perPage).map((rental) => (
                                            <tr key={rental.id}>
                                                <td>{rental.rental_number}</td>
                                                <td>{rental.customer_name}</td>
                                                <td>{rental.start_date}</td>
                                                <td>{rental.expected_end_date}</td>
                                                <td>{getStatusBadge(rental.status)}</td>
                                                <td>{rental.total_amount}</td>
                                                <td className="text-right">
                                                    <Button asChild size="sm" variant="secondary" className="mr-2">
                                                        <Link href={route('rentals.show', rental.id)}>{t('btn_show')}</Link>
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={route('rentals.edit', rental.id)}>{t('btn_edit')}</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-4 text-center">
                                                {t('no_rentals_found', 'No rentals found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="mt-4 flex items-center justify-between">
                            <Button asChild size="sm" variant="outline" disabled={!rentals?.current_page || rentals.current_page === 1}>
                                <Link href={route('rentals.index', { page: (rentals?.current_page || 1) - 1 })}>{t('Previous')}</Link>
                            </Button>
                            <span>
                                {t('Page')} {rentals?.current_page || 1} {t('of')} {rentals?.last_page || 1}
                            </span>
                            <Button asChild size="sm" variant="outline" disabled={!rentals?.current_page || rentals.current_page === rentals?.last_page}>
                                <Link href={route('rentals.index', { page: (rentals?.current_page || 1) + 1 })}>{t('Next')}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
