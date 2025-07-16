import { Badge } from '@/Core/components/ui/badge';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Input } from '@/Core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core/components/ui/table';
import AppLayout from '@/Core/layouts/AppLayout';
import type { PageProps } from '@/Core/types';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
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
                        <div className="mt-4 flex items-center justify-between">
                            <Button asChild size="sm" variant="outline" disabled={!equipment.links.prev}>
                                <a href={equipment.links.prev || '#'}>{t('Previous')}</a>
                            </Button>
                            <span>
                                {t('Page')} {equipment.meta?.current_page || 1} {t('of')} {equipment.meta?.last_page || 1}
                            </span>
                            <Button asChild size="sm" variant="outline" disabled={!equipment.links.next}>
                                <a href={equipment.links.next || '#'}>{t('Next')}</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
