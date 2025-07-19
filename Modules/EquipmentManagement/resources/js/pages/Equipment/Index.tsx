import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CreateButton,
    CrudButtons,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Search, LoaderCircle, MapPin, Wrench, DollarSign, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageProps } from '../../types/index';
import { Equipment } from '../../types/models';
import { router } from '@inertiajs/core';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Equipment', href: '/equipment' },
];

interface Props extends PageProps {
    equipment: {
        data: Equipment[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    categories: string[];
    statuses: Record<string, string>;
    filters?: Record<string, any>;
}

export default function Index({ equipment, categories = [], statuses = {}, filters = {} }: Props) {
    const { t } = useTranslation('equipment');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [category, setCategory] = useState(filters.category || 'all');
    const [perPage, setPerPage] = useState(equipment.meta?.per_page || 15);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDebugging, setIsDebugging] = useState(false);

    const safeEquipment = Array.isArray(equipment.data) ? equipment.data : [];
    const meta = equipment.meta || { current_page: 1, per_page: 15, last_page: 1, total: 0 };

    const handleSearch = debounce((value: string) => {
        const normalizedValue = !value || value === 'all' ? '' : value;
        setSearch(normalizedValue);
        router.get(
            '/equipment',
            {
                search: normalizedValue,
                status: status === 'all' ? '' : status,
                category: category === 'all' ? '' : category,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);

    const handleFilter = (type: string, value: string) => {
        const normalizedValue = value === 'all' ? '' : value;
        let newStatus = status;
        let newCategory = category;

        switch (type) {
            case 'status':
                setStatus(value);
                newStatus = value;
                break;
            case 'category':
                setCategory(value);
                newCategory = value;
                break;
        }

        router.get(
            '/equipment',
            {
                search: search === 'all' ? '' : search,
                status: newStatus === 'all' ? '' : newStatus,
                category: newCategory === 'all' ? '' : newCategory,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        router.get(
            '/equipment',
            {
                search: search === 'all' ? '' : search,
                status: status === 'all' ? '' : status,
                category: category === 'all' ? '' : category,
                per_page: Number(value),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
            available: 'default',
            rented: 'secondary',
            maintenance: 'outline',
            out_of_service: 'destructive',
        };

        const labels: Record<string, string> = {
            available: 'Available',
            rented: 'Rented',
            maintenance: 'Maintenance',
            out_of_service: 'Out of Service',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
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
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(data.message || 'Failed to sync equipment from ERPNext');
            }
        } catch (e) {
            console.error('Sync error:', e);
            toast.error('Failed to sync equipment from ERPNext. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDebug = async () => {
        if (isDebugging) return;

        setIsDebugging(true);
        try {
            const xsrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const res = await fetch('/api/v1/equipment/debug-erpnext', {
                method: 'GET',
                headers: xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {},
                credentials: 'same-origin',
            });

            const data = await res.json();

            if (res.ok) {
                console.log('ERPNext Debug Info:', data.debug_info);
                toast.success('ERPNext connection test completed. Check console for details.');
            } else {
                toast.error(data.message || 'Failed to test ERPNext connection');
            }
        } catch (e) {
            console.error('Debug error:', e);
            toast.error('Failed to test ERPNext connection. Please try again.');
        } finally {
            setIsDebugging(false);
        }
    };

    return (
        <AppLayout title={t('equipment')} breadcrumbs={breadcrumbs} requiredPermission="equipment.view">
            <Head title={t('equipment')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('equipment')}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <CreateButton
                                resourceType="equipment"
                                permission="equipment.create"
                                text={t('add_equipment')}
                            />
                            <Button onClick={handleSync} type="button" variant="default" disabled={isSyncing}>
                                {isSyncing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSyncing ? 'Syncing...' : t('sync_erpnext')}
                            </Button>
                            <Button
                                onClick={handleDebug}
                                type="button"
                                variant="outline"
                                disabled={isDebugging}
                            >
                                {isDebugging ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isDebugging ? 'Testing...' : t('debug_erpnext')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('ph_search_equipment')}
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(value) => handleFilter('status', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={category}
                                onValueChange={(value) => handleFilter('category', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('all_categories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_categories')}</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status & Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location & Assignment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pricing & Costs
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maintenance Info
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {safeEquipment.map((item) => (
                                        <tr key={item.id} className="align-top">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span>{item.door_number || item.id}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium">
                                                        {typeof item.name === 'string' ? item.name : (item.name?.en || 'N/A')}
                                                    </span>
                                                    <div className="text-sm">
                                                        <Wrench className="mr-1 inline-block h-3 w-3" />
                                                        {item.model || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Serial: {item.serial_number || 'N/A'}
                                                    </div>
                                                    {item.manufacturer && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.manufacturer}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div>{getStatusBadge(item.status)}</div>
                                                    <div className="text-sm">
                                                        {item.category || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm">
                                                        <MapPin className="mr-1 inline-block h-3 w-3" />
                                                        <span className="line-clamp-1">
                                                            {item.location?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Quantity: {item.quantity || 1}
                                                    </div>
                                                    {item.assigned_to && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Assigned to: {item.assigned_to}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm">
                                                        <DollarSign className="mr-1 inline-block h-3 w-3" />
                                                        <span className="font-medium">{formatCurrency(item.daily_rate)}</span>
                                                        <span className="ml-1 text-xs text-muted-foreground">/day</span>
                                                    </div>
                                                    {item.weekly_rate && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Weekly: {formatCurrency(item.weekly_rate)}
                                                        </div>
                                                    )}
                                                    {item.monthly_rate && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Monthly: {formatCurrency(item.monthly_rate)}
                                                        </div>
                                                    )}
                                                    {item.purchase_cost && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Purchase: {formatCurrency(item.purchase_cost)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    {item.last_maintenance_date && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Calendar className="mr-1 inline-block h-3 w-3" />
                                                            Last: {new Date(item.last_maintenance_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {item.next_maintenance_date && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Calendar className="mr-1 inline-block h-3 w-3" />
                                                            Next: {new Date(item.next_maintenance_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {item.current_operating_hours && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Hours: {item.current_operating_hours}
                                                        </div>
                                                    )}
                                                    {item.current_mileage && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Mileage: {item.current_mileage}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <CrudButtons
                                                    resourceType="equipment"
                                                    resourceId={item.id}
                                                    resourceName={typeof item.name === 'string' ? item.name : (item.name?.en || 'Equipment')}
                                                    className="justify-end"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {safeEquipment.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-4 text-center">
                                                {t('no_equipment_found', 'No equipment found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination - Always show if there are equipment items */}
                        {safeEquipment.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {meta.from || 1} to {meta.to || safeEquipment.length} of {meta.total || safeEquipment.length} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {meta.current_page || 1} of {meta.last_page || 1}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="15">15</SelectItem>
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
                                                disabled={!meta.current_page || meta.current_page === 1}
                                                onClick={() => {
                                                    const currentPage = meta.current_page || 1;
                                                    if (currentPage > 1) {
                                                        router.get(
                                                            '/equipment',
                                                            {
                                                                page: currentPage - 1,
                                                                per_page: perPage,
                                                                search: search === 'all' ? '' : search,
                                                                status: status === 'all' ? '' : status,
                                                                category: category === 'all' ? '' : category,
                                                            },
                                                            { preserveState: true, preserveScroll: true },
                                                        );
                                                    }
                                                }}
                                            >
                                                Previous
                                            </Button>

                                            {/* Page Numbers - show if we have pagination metadata */}
                                            {meta.last_page && meta.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        const lastPage = meta.last_page;
                                                        const currentPage = meta.current_page;

                                                        if (lastPage <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (currentPage <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (currentPage >= lastPage - 2) {
                                                                pageNumber = lastPage - 4 + i;
                                                            } else {
                                                                pageNumber = currentPage - 2 + i;
                                                            }
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === currentPage ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => {
                                                                    router.get(
                                                                        '/equipment',
                                                                        {
                                                                            page: pageNumber,
                                                                            per_page: perPage,
                                                                            search: search === 'all' ? '' : search,
                                                                            status: status === 'all' ? '' : status,
                                                                            category: category === 'all' ? '' : category,
                                                                        },
                                                                        { preserveState: true, preserveScroll: true },
                                                                    );
                                                                }}
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
                                                disabled={
                                                    !meta.current_page ||
                                                    !meta.last_page ||
                                                    meta.current_page >= meta.last_page
                                                }
                                                onClick={() => {
                                                    const currentPage = meta.current_page || 1;
                                                    const lastPage = meta.last_page || 1;
                                                    if (currentPage < lastPage) {
                                                        router.get(
                                                            '/equipment',
                                                            {
                                                                page: currentPage + 1,
                                                                per_page: perPage,
                                                                search: search === 'all' ? '' : search,
                                                                status: status === 'all' ? '' : status,
                                                                category: category === 'all' ? '' : category,
                                                            },
                                                            { preserveState: true, preserveScroll: true },
                                                        );
                                                    }
                                                }}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show message when no equipment found */}
                        {safeEquipment.length === 0 && (
                            <div className="mt-4 text-center text-sm text-muted-foreground">No equipment found matching your criteria.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
