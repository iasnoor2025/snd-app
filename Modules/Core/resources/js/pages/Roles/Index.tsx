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
import { useEffect } from 'react';
import { Edit, Eye, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Table } from '../../components/Common/Table';

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

export default function Index() {
    const { t } = useTranslation(['roles', 'common']);
    const [search, setSearch] = useState('');
    const { hasPermission } = usePermission();
    const [perPage, setPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/roles', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setRoles(data.data || data.roles || []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            role.display_name?.toLowerCase().includes(search.toLowerCase()) ||
            role.description?.toLowerCase().includes(search.toLowerCase()),
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredRoles.length / perPage);
    const paginatedRoles = filteredRoles.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleDelete = (roleId: number, roleName: string) => {
        if (confirm(`${t('common:are_you_sure_delete', { item: 'role' })}: "${roleName}"?`)) {
            router.delete(`/settings/roles/${roleId}`, {
                onSuccess: () => {
                    toast.success(t('common:deleted_successfully', { item: 'role' }));
                },
                onError: (errors: any) => {
                    toast.error(errors.message || t('common:failed_to_delete', { item: 'role' }));
                },
            });
        }
    };

    const getPermissionsBadge = (permissions: Role['permissions']) => {
        const count = permissions.length;
        if (count === 0) return <Badge variant="outline">{t('common:no_items', { items: t('common:permissions').toLowerCase() })}</Badge>;
        return (
            <Badge variant="secondary">
                {count} {count === 1 ? t('permission_singular') : t('permission_count')}
            </Badge>
        );
    };

    const columns = [
        {
            key: 'name',
            header: t('role_name'),
            accessor: (role: Role) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{role.name}</Badge>
                </div>
            ),
        },
        {
            key: 'display_name',
            header: t('display_name'),
            accessor: (role: Role) => role.display_name || t('no_display_name'),
        },
        {
            key: 'description',
            header: t('description'),
            accessor: (role: Role) => (
                <div className="truncate max-w-xs" title={role.description}>
                    {role.description || t('no_description')}
                </div>
            ),
        },
        {
            key: 'permissions',
            header: t('permissions'),
            accessor: (role: Role) => getPermissionsBadge(role.permissions),
        },
        {
            key: 'users',
            header: t('users'),
            accessor: (role: Role) => (
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{role.users_count || 0}</span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: t('actions'),
            accessor: (role: Role) => (
                <div className="flex items-center justify-end gap-2">
                    <Permission permission="roles.view">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/settings/roles/${role.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                    </Permission>
                    <Permission permission="roles.edit">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/settings/roles/${role.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    </Permission>
                    <Permission permission="roles.delete">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(role.id, role.name)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </Permission>
                </div>
            ),
            className: 'text-right',
        },
    ];

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
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6 gap-2">
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
                        <Table
                            data={paginatedRoles}
                            columns={columns}
                            pageSize={perPage}
                            currentPage={currentPage}
                            totalItems={filteredRoles.length}
                            onPageChange={setCurrentPage}
                            showPagination={totalPages > 1}
                            showBorders
                            showHover
                            isLoading={isLoading}
                            emptyMessage={isLoading ? t('common:loading') : (search ? t('common:no_items_found', { items: t('common:roles').toLowerCase() }) : t('common:no_items', { items: t('common:roles').toLowerCase() }))}
                        />
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                            <p>
                                {t('showing')} {filteredRoles.length} {t('of')} {roles.length} {t('roles')}
                            </p>
                            <Permission permission="roles.view">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/settings/user-roles">
                                        <Users className="mr-2 h-4 w-4" />
                                        {t('manage_user_roles')}
                                    </Link>
                                </Button>
                            </Permission>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
