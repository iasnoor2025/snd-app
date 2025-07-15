import { AppLayout, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Permission } from '@/Core';
import { type BreadcrumbItem } from '@/Core/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Key, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    role: Role;
    auth: any;
}

export default function Show({ auth, role }: Props) {
    const { t } = useTranslation(['roles', 'common']);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common:dashboard'), href: '/dashboard' },
        { title: t('common:settings'), href: '/settings' },
        { title: t('common:roles'), href: '/settings/roles' },
        { title: role.display_name || role.name, href: `/settings/roles/${role.id}` },
    ];

    // Group permissions by module
    const groupedPermissions = role.permissions.reduce(
        (acc, permission) => {
            const [module] = permission.name.split('.');
            if (!acc[module]) acc[module] = [];
            acc[module].push(permission);
            return acc;
        },
        {} as Record<string, typeof role.permissions>,
    );

    return (
        <AppLayout title={`${t('view_role')}: ${role.display_name || role.name}`} breadcrumbs={breadcrumbs} requiredPermission="roles.view">
            <Head title={`${t('view_role')}: ${role.display_name || role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/settings/roles">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common:back_to')} {t('common:roles')}
                        </Link>
                    </Button>

                    <Permission permission="roles.edit">
                        <Button asChild>
                            <Link href={`/settings/roles/${role.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('edit_role')}
                            </Link>
                        </Button>
                    </Permission>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Role Information */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    {t('role_information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('role_name')}</h3>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="text-sm">
                                            {role.name}
                                        </Badge>
                                    </div>
                                </div>

                                {role.display_name && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('display_name')}</h3>
                                        <p className="mt-1 text-sm">{role.display_name}</p>
                                    </div>
                                )}

                                {role.description && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('description')}</h3>
                                        <p className="mt-1 text-sm">{role.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('common:created')}</h3>
                                        <p className="mt-1 text-sm">{format(new Date(role.created_at), 'PPp')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('common:last_updated')}</h3>
                                        <p className="mt-1 text-sm">{format(new Date(role.updated_at), 'PPp')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    {t('common:permissions')} ({role.permissions.length})
                                </CardTitle>
                                <CardDescription>{t('permissions_granted')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(groupedPermissions).length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <Key className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                        <p>{t('no_permissions_assigned')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                            <div key={module} className="space-y-3">
                                                <h4 className="border-b pb-2 text-sm font-medium capitalize">
                                                    {module.replace('_', ' ')} ({permissions.length})
                                                </h4>
                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                    {permissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {permission.display_name || permission.name}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats & Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {t('usage_statistics')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{role.users_count || 0}</div>
                                    <p className="text-sm text-muted-foreground">{t('users_with_role')}</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold">{role.permissions.length}</div>
                                    <p className="text-sm text-muted-foreground">{t('permissions_assigned')}</p>
                                </div>

                                <Permission permission="roles.view">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/settings/user-roles">
                                            <Users className="mr-2 h-4 w-4" />
                                            {t('manage_user_roles')}
                                        </Link>
                                    </Button>
                                </Permission>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('common:actions')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Permission permission="roles.edit">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/settings/roles/${role.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            {t('edit_role')}
                                        </Link>
                                    </Button>
                                </Permission>

                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/settings/roles">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t('back_to_list')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
