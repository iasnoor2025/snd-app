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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('navigation.dashboard'), href: route('dashboard') },
        { title: t('navigation.users'), href: '' },
    ];

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.roles.some((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );

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
                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder={t('users:search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('users:fields.name')}</TableHead>
                                            <TableHead>{t('users:fields.email')}</TableHead>
                                            <TableHead>{t('users:fields.roles')}</TableHead>
                                            <TableHead>{t('users:fields.status')}</TableHead>
                                            <TableHead>{t('users:fields.created_at')}</TableHead>
                                            <TableHead className="text-right">{t('users:fields.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                                    {searchTerm ? t('messages.no_results') : t('messages.no_users')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles.map((role) => (
                                                                <Badge key={role.id} variant="secondary">
                                                                    {role.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.email_verified_at ? 'default' : 'destructive'}>
                                                            {user.email_verified_at ? t('status.verified') : t('status.unverified')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDateMedium(new Date(user.created_at))}</TableCell>
                                                    <TableCell className="text-right">
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
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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
