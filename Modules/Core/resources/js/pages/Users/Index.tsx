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
import { Table } from '../../components/Common/Table';
import { BreadcrumbItem } from '../../types';
import { CrudButtons } from '@/Core';

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
    const [currentPage, setCurrentPage] = useState(1);

    // Filtering
    const filteredUsers = (users || []).filter(
        (user) =>
            (searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.roles.some((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (status === 'all' || (status === 'verified' ? user.email_verified_at : !user.email_verified_at)) &&
            (role === 'all' || user.roles.some((r) => r.name === role))
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / perPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <AppLayout title={t('users:fields.users')} breadcrumbs={[] /* Add breadcrumbs if needed */} requiredPermission="users.view">
            <Head title={t('users:fields.users')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <UsersIcon className="h-6 w-6" />
                                {t('users:fields.users')}
                            </CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                            {can.create_users && (
                                <Button asChild>
                                    <Link href={route('users.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('users:fields.add_user')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('users:fields.search')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-8" />
                            </div>
                            <Select value={status} onValueChange={v => { setStatus(v); setCurrentPage(1); }}>
                                <SelectTrigger className="w-36">
                                    <SelectValue>{status === 'all' ? t('users:fields.status') : status}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('users:fields.status')}</SelectItem>
                                    <SelectItem value="verified">{t('users:fields.verified')}</SelectItem>
                                    <SelectItem value="unverified">{t('users:fields.unverified')}</SelectItem>
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
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users:fields.name')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users:fields.email')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users:fields.roles')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users:fields.status')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users:fields.created_at')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedUsers.map((user) => (
                                        <tr key={user.id} className="align-top">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role.id} variant="outline">{role.name}</Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {user.email_verified_at ? (
                                                    <Badge variant="secondary">{t('users:fields.verified')}</Badge>
                                                ) : (
                                                    <Badge variant="destructive">{t('users:fields.unverified')}</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateMedium(user.created_at)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <CrudButtons
                                                    resourceType="users"
                                                    resourceId={user.id}
                                                    resourceName={user.name}
                                                    className="justify-end"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-4 text-center">
                                                {t('common:no_items', { items: t('users:fields.users').toLowerCase() })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        {t('showing')} {(currentPage - 1) * perPage + 1} {t('to')} {Math.min(currentPage * perPage, filteredUsers.length)} {t('of')} {filteredUsers.length} {t('users:fields.users')}
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
