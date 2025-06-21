import React, { useState } from 'react';
import { AppLayout } from '@/Core';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../components/ui/table';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Users as UsersIcon,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
}

export default function Index({ users, roles }: Props) {
    const { t } = useTranslation(['common']);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common:dashboard'), href: route('dashboard') },
        { title: t('common:users'), href: '' },
    ];

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDeleteUser = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(route('users.destroy', userToDelete.id), {
            onSuccess: () => {
                toast.success(t('common:messages.delete_success', { resource: 'User' }));
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            },
            onError: (errors) => {
                toast.error(errors.message || t('common:messages.delete_error'));
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    const openDeleteDialog = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('common:users')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5" />
                                        {t('common:users')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('common:manage_users_description', 'Manage system users and their roles')}
                                    </CardDescription>
                                </div>
                                <Link href={route('users.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('common:actions.add', { resource: 'User' })}
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder={t('common:search_users', 'Search users...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('common:name')}</TableHead>
                                            <TableHead>{t('common:email')}</TableHead>
                                            <TableHead>{t('common:roles')}</TableHead>
                                            <TableHead>{t('common:status')}</TableHead>
                                            <TableHead>{t('common:created_at')}</TableHead>
                                            <TableHead className="text-right">{t('common:actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                    {searchTerm ? t('common:no_results') : t('common:no_users')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        {user.name}
                                                    </TableCell>
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
                                                        <Badge 
                                                            variant={user.email_verified_at ? "default" : "destructive"}
                                                        >
                                                            {user.email_verified_at ? 
                                                                t('common:verified') : 
                                                                t('common:unverified')
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('users.show', user.id)}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        {t('common:actions.view')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('users.edit', user.id)}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        {t('common:actions.edit')}
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="text-red-600"
                                                                    onClick={() => openDeleteDialog(user)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    {t('common:actions.delete')}
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

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common:confirm_delete')}</DialogTitle>
                        <DialogDescription>
                            {t('common:delete_user_confirmation', {
                                name: userToDelete?.name,
                                defaultValue: `Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            {t('common:actions.cancel')}
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t('common:actions.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 
