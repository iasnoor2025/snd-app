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
import { Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Permission } from '@/Core';

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
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Rental #</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Date</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                                        <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {filteredRentals.length > 0 ? (
                                        filteredRentals.slice(0, perPage).map((rental) => (
                                            <tr key={rental.id} className="align-top">
                                                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{rental.rental_number}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{rental.customer_name}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{rental.start_date}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{rental.expected_end_date}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{getStatusBadge(rental.status)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{rental.total_amount}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <a href={window.route('rentals.show', rental.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a href={window.route('rentals.edit', rental.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Permission permission="rentals.delete">
                                                        <a href={window.route('rentals.destroy', rental.id)} data-method="delete" data-confirm={t('delete_confirm', 'Are you sure you want to delete this rental?')}>
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
                                            <td colSpan={7} className="py-4 text-center">
                                                {t('no_rentals_found', 'No rentals found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {filteredRentals.length > 0 && rentals && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(rentals.current_page - 1) * rentals.per_page + 1} to {Math.min(rentals.current_page * rentals.per_page, rentals.total)} of {rentals.total} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {rentals.current_page} of {rentals.last_page}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={(v) => {
                                                setPerPage(Number(v));
                                                router.get(route('rentals.index'), { page: 1, perPage: Number(v), search, status }, { preserveState: true, replace: true });
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
                                                disabled={rentals.current_page === 1}
                                                onClick={() => router.get(route('rentals.index'), { page: rentals.current_page - 1, perPage, search, status }, { preserveState: true, replace: true })}
                                            >
                                                Previous
                                            </Button>
                                            {rentals.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, rentals.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        if (rentals.last_page <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (rentals.current_page <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (rentals.current_page >= rentals.last_page - 2) {
                                                                pageNumber = rentals.last_page - 4 + i;
                                                            } else {
                                                                pageNumber = rentals.current_page - 2 + i;
                                                            }
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === rentals.current_page ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => router.get(route('rentals.index'), { page: pageNumber, perPage, search, status }, { preserveState: true, replace: true })}
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
                                                disabled={rentals.current_page === rentals.last_page}
                                                onClick={() => router.get(route('rentals.index'), { page: rentals.current_page + 1, perPage, search, status }, { preserveState: true, replace: true })}
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
