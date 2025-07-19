import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@/Core';
import { BreadcrumbItem } from '@/Core/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, Shield, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name?: string;
    guard_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props {
    users: User[];
    roles: Role[];
}

export default function UserRoles({ users, roles }: Props) {
    const { t } = useTranslation(['roles', 'common']);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredUsers = users.filter(
        (user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
    );

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles.map((role) => role.id));
        setIsDialogOpen(true);
    };

    const handleRoleChange = (roleId: number) => {
        setSelectedRoles((prev) => {
            if (prev.includes(roleId)) {
                return prev.filter((id) => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const handleSubmit = () => {
        if (!selectedUser) return;

        router.put(
            `/settings/users/${selectedUser.id}/roles`,
            {
                roles: selectedRoles,
            },
            {
                onSuccess: () => {
                    toast.success(t('common:updated_successfully', { item: t('common:roles') }));
                    setIsDialogOpen(false);
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error(t('common:failed_to_update', { item: t('common:roles') }));
                },
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common:dashboard'), href: '/dashboard' },
        { title: t('common:settings'), href: '/settings' },
        { title: t('manage_user_roles'), href: '/settings/user-roles' },
    ];

    return (
        <AppLayout title={t('manage_user_roles')} breadcrumbs={breadcrumbs} requiredPermission="roles.assign">
            <Head title={t('manage_user_roles')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <Shield className="h-6 w-6" />
                                {t('manage_user_roles')}
                            </CardTitle>
                            <CardDescription>{t('subtitle')}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('common:search_users')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Shield className="h-8 w-8" />
                                    <p>{users.length === 0 ? 'No users available' : t('common:no_items_found', { items: t('common:users').toLowerCase() })}</p>
                                    {search && users.length > 0 && <p className="text-sm">{t('common:try_adjusting_search')}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common:name')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common:email')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('current_roles')}</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common:actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <Badge key={role.id} variant="secondary">
                                                                {role.display_name || role.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button variant="ghost" size="sm" onClick={() => handleUserSelect(user)}>
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('manage_roles_for')} {selectedUser?.name}
                            </DialogTitle>
                            <DialogDescription>{t('select_roles_to_assign')}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={() => handleRoleChange(role.id)}
                                    />
                                    <Label htmlFor={`role-${role.id}`}>{role.display_name || role.name}</Label>
                                </div>
                            ))}

                            {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                <X className="mr-2 h-4 w-4" />
                                {t('common:cancel')}
                            </Button>
                            <Button onClick={handleSubmit}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('update_roles')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
