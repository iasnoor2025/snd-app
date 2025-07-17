import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Permission,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    usePermission,
} from '@/Core';
import { type BreadcrumbItem } from '@/Core/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Eye, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Table } from '../../components/Common/Table';
import { CrudButtons } from '@/Core';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings' },
    { title: 'Roles', href: '/settings/roles' },
];

interface Role {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    permissions: Array<{
        id: number;
        name: string;
        display_name?: string;
    }>;
    users_count?: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
    auth: any;
}

export default function Index({ auth, roles }: Props) {
    const { t } = useTranslation(['roles', 'common']);
    const [search, setSearch] = useState('');
    const { hasPermission } = usePermission();
    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtering
    const filteredRoles = (roles || []).filter(
        (role) =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            (role.display_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (role.description?.toLowerCase() || '').includes(search.toLowerCase()),
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredRoles.length / perPage);
    const paginatedRoles = filteredRoles.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <AppLayout title={t('title')} breadcrumbs={breadcrumbs} requiredPermission="roles.view">
            <Head title={t('title')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <Shield className="h-6 w-6" />
                                {t('title')}
                            </CardTitle>
                            <CardDescription>{t('subtitle')}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Permission permission="roles.create">
                                <Button asChild>
                                    <Link href="/settings/roles/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('add_role')}
                                    </Link>
                                </Button>
                            </Permission>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('search_roles')} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-8" />
                            </div>
                            <Select value={perPage.toString()} onValueChange={v => { setPerPage(Number(v)); setCurrentPage(1); }}>
                                <SelectTrigger className="w-28">
                                    <SelectValue>{perPage} / page</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 15, 25, 50, 100].map(n => (
                                        <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('role_name')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('display_name')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permissions')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedRoles.map((role) => (
                                        <tr key={role.id} className="align-top">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Badge variant="outline">{role.name}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{role.display_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{role.description || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant="secondary">{role.permissions?.length || 0}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant="secondary">{role.users_count || 0}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <CrudButtons
                                                    resourceType="roles"
                                                    resourceId={role.id}
                                                    resourceName={role.name}
                                                    className="justify-end"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedRoles.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-4 text-center">
                                                {t('common:no_items', { items: t('common:roles').toLowerCase() })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {filteredRoles.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        {t('showing')} {(currentPage - 1) * perPage + 1} {t('to')} {Math.min(currentPage * perPage, filteredRoles.length)} {t('of')} {filteredRoles.length} {t('roles')}
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={v => { setPerPage(Number(v)); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[10, 15, 25, 50, 100].map(n => (
                                                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                                Previous
                                            </Button>
                                            <span className="text-xs">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
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
