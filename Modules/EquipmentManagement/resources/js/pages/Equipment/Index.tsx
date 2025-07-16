import { Badge } from '@/Core/components/ui/badge';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Input } from '@/Core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core/components/ui/table';
import AppLayout from '@/Core/layouts/AppLayout';
import type { PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
// import { CreateButton } from '@/Core/components/ui/create-button';
// import { CrudButtons } from '@/Core/components/ui/crud-buttons';
import CreateButton from '@/Core/components/shared/CreateButton';
import CrudButtons from '@/Core/components/shared/CrudButtons';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Equipment, PaginatedData } from '../../types';

interface Props extends PageProps {
    equipment: PaginatedData<Equipment>;
    categories: string[];
    statuses: Record<string, string>;
    filters?: Record<string, any>;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Equipment', href: '/equipment' },
];

export default function Index({ equipment, categories = [], statuses = {}, filters = {} }: Props) {
    const { t } = useTranslation('equipment');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [category, setCategory] = useState(filters.category || 'all');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const safeEquipment = Array.isArray(equipment.data) ? equipment.data : [];
    const meta = equipment.meta || { current_page: 1, per_page: 10, last_page: 1, total: 0 };

    const getStatusBadge = (status: string) => {
        const label = t(status);
        switch (status.toLowerCase()) {
            case 'available':
                return <Badge variant="default">{label}</Badge>;
            case 'rented':
                return <Badge variant="secondary">{label}</Badge>;
            case 'maintenance':
                return <Badge variant="outline">{label}</Badge>;
            case 'out_of_service':
                return <Badge variant="destructive">{label}</Badge>;
            default:
                return <Badge variant="outline">{label}</Badge>;
        }
    };

    const filteredEquipment = safeEquipment.filter((item) => {
        const matchesSearch =
            !search ||
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.model?.toLowerCase().includes(search.toLowerCase()) ||
            item.serial_number?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || item.status === status;
        const matchesCategory = category === 'all' || item.category === category;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const handleSync = async () => {
        try {
            const xsrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            const res = await fetch('/api/v1/equipment/sync-erpnext', {
                method: 'POST',
                headers: xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {},
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Equipment synced from ERPNext successfully');
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to sync equipment from ERPNext');
            }
        } catch (e) {
            toast.error('Failed to sync equipment from ERPNext');
        }
    };

    return (
        <AppLayout title={t('equipment')} breadcrumbs={breadcrumbs} requiredPermission="equipment.view">
            <Head title={t('equipment')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('equipment')}</CardTitle>
                        <div className="flex gap-2">
                            <CreateButton
                                resourceType="equipment"
                                permission="equipment.create"
                                text={t('add_equipment')}
                            />
                            <Button onClick={handleSync} type="button" variant="default">
                                {t('sync_erpnext')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Input
                                placeholder={t('ph_search_equipment')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_categories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_categories')}</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
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
                                        <TableHead>{t('door_number')}</TableHead>
                                        <TableHead>{t('equipment_name')}</TableHead>
                                        <TableHead>{t('model')}</TableHead>
                                        <TableHead>{t('serial_number')}</TableHead>
                                        <TableHead>{t('category')}</TableHead>
                                        <TableHead>{t('status')}</TableHead>
                                        <TableHead>{t('daily_rate')}</TableHead>
                                        <TableHead className="w-[100px] text-right">{t('actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEquipment.length > 0 ? (
                                        filteredEquipment.slice(0, perPage).map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.door_number}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.model}</TableCell>
                                                <TableCell>{item.serial_number}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell>{item.daily_rate}</TableCell>
                                                <TableCell className="flex justify-end">
                                                    <CrudButtons
                                                        resourceType="equipment"
                                                        resourceId={item.id}
                                                        resourceName={item.name}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-4 text-center">
                                                {t('no_equipment_found', 'No equipment found.')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination Controls */}
                        {safeEquipment.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(meta.current_page - 1) * meta.per_page + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {meta.current_page} of {meta.last_page}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={(v) => {
                                                setPerPage(Number(v));
                                                router.get('/equipment', { page: 1, perPage: Number(v), search, status, category }, { preserveState: true, replace: true });
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
                                                disabled={meta.current_page === 1}
                                                onClick={() => router.get('/equipment', { page: meta.current_page - 1, perPage, search, status, category }, { preserveState: true, replace: true })}
                                            >
                                                Previous
                                            </Button>
                                            {meta.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        if (meta.last_page <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (meta.current_page <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (meta.current_page >= meta.last_page - 2) {
                                                                pageNumber = meta.last_page - 4 + i;
                                                            } else {
                                                                pageNumber = meta.current_page - 2 + i;
                                                            }
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === meta.current_page ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => router.get('/equipment', { page: pageNumber, perPage, search, status, category }, { preserveState: true, replace: true })}
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
                                                disabled={meta.current_page === meta.last_page}
                                                onClick={() => router.get('/equipment', { page: meta.current_page + 1, perPage, search, status, category }, { preserveState: true, replace: true })}
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
