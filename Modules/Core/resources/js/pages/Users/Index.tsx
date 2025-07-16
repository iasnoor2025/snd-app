import { AppLayout } from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Loader2, MoreHorizontal, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../../../../resources/js/components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Table, Column } from '../../components/Common/Table';
import { BreadcrumbItem } from '../../types';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    users: User[];
    roles: Role[];
    can: {
        create_users: boolean;
    };
}

export default function Index({ users, roles, can }: Props) {
    const { t } = useTranslation('common');
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('all');
    const [role, setRole] = useState('all');
    const [perPage, setPerPage] = useState(15);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('navigation.dashboard'), href: route('dashboard') },
        { title: t('navigation.users'), href: '' },
    ];

    // Advanced filtering
    const filteredUsers = users.filter(
        (user) =>
            (searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.roles.some((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (status === 'all' || (status === 'verified' ? user.email_verified_at : !user.email_verified_at)) &&
            (role === 'all' || user.roles.some((r) => r.name === role))
    );

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredUsers.length / perPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        router.delete(route('users.destroy', userToDelete.id), {
            onSuccess: () => {
                toast.success(t('messages.delete_success', { resource: t('users') }));
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            },
            onError: (errors) => {
                toast.error(errors.message || t('messages.delete_error', { resource: t('users') }));
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const openDeleteDialog = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const getStatusBadge = (verified: string | null) => (
        <Badge variant={verified ? 'default' : 'destructive'}>
            {verified ? t('status.verified') : t('status.unverified')}
        </Badge>
    );

    const columns: Column<User>[] = [
        {
            key: 'name',
            header: t('users:fields.name'),
            accessor: (user) => <span className="font-medium">{user.name}</span>,
        },
        {
            key: 'email',
            header: t('users:fields.email'),
            accessor: (user) => user.email,
        },
        {
            key: 'roles',
            header: t('users:fields.roles'),
            accessor: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">{role.name}</Badge>
                    ))}
                </div>
            ),
        },
        {
            key: 'status',
            header: t('users:fields.status'),
            accessor: (user) => getStatusBadge(user.email_verified_at),
        },
        {
            key: 'created_at',
            header: t('users:fields.created_at'),
            accessor: (user) => formatDateMedium(new Date(user.created_at)),
        },
        {
            key: 'actions',
            header: t('users:fields.actions'),
            accessor: (user) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('users:view')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href={route('users.show', user.id)} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                {t('users:view')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={route('users.edit', user.id)} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                {t('users:edit')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(user)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('users:delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: 'text-right',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('navigation.users')} />
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5" />
                                        {t('users:title')}
                                    </CardTitle>
                                    <CardDescription>{t('users:messages.manage_user_description')}</CardDescription>
                                </div>
                                {can.create_users && (
                                    <Link href={route('users.create')}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('users:create')}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Advanced Filters */}
                            <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-6 gap-2">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder={t('users:search')}
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={status} onValueChange={v => { setStatus(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue>{status === 'all' ? t('status.all') : t('status.' + status)}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('status.all')}</SelectItem>
                                        <SelectItem value="verified">{t('status.verified')}</SelectItem>
                                        <SelectItem value="unverified">{t('status.unverified')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={role} onValueChange={v => { setRole(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue>{role === 'all' ? t('users:fields.roles') : role}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('users:fields.roles')}</SelectItem>
                                        {roles.map(r => (
                                            <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            {/* Users Table */}
                            <Table
                                data={paginatedUsers}
                                columns={columns}
                                pageSize={perPage}
                                currentPage={currentPage}
                                totalItems={filteredUsers.length}
                                onPageChange={setCurrentPage}
                                showPagination={totalPages > 1}
                                showBorders
                                showHover
                                emptyMessage={searchTerm ? t('messages.no_results') : t('messages.no_users')}
                            />
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        {t('showing')} {(currentPage - 1) * perPage + 1} {t('to')} {Math.min(currentPage * perPage, filteredUsers.length)} {t('of')} {filteredUsers.length} {t('users')}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}>{page}</Button>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('users:messages.confirm_delete')}</DialogTitle>
                        <DialogDescription>
                            {userToDelete && t('users:messages.delete_user_confirmation', { name: userToDelete.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            {t('users:messages.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('users:messages.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
