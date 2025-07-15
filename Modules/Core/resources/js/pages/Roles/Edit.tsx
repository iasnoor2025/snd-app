import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Label,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@/Core';
import { BreadcrumbItem, PageProps } from '@/Core/types/index';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Permission {
    id: number;
    name: string;
    display_name?: string;
    guard_name: string;
}

interface Role {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    permissions: Permission[];
}

interface Props extends PageProps {
    role: Role;
    permissions: Record<string, Permission[]>;
    selectedPermissions: number[];
    auth: any;
}

export default function Edit({ auth, role, permissions, selectedPermissions: initialSelectedPermissions }: Props) {
    const { t } = useTranslation(['roles', 'common']);
    const [selectedTab, setSelectedTab] = useState('general');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(initialSelectedPermissions || []);
    const [name, setName] = useState(role.name);
    const [displayName, setDisplayName] = useState(role.display_name || '');
    const [description, setDescription] = useState(role.description || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common:dashboard'), href: '/dashboard' },
        { title: t('common:settings'), href: '/settings' },
        { title: t('common:roles'), href: '/settings/roles' },
        { title: role.display_name || role.name, href: `/settings/roles/${role.id}` },
        { title: t('edit_role'), href: `/settings/roles/${role.id}/edit` },
    ];

    const {
        data,
        setData,
        put,
        processing,
        errors: formErrors,
        reset,
    } = useForm({
        name,
        display_name: displayName,
        description,
        permissions: selectedPermissions,
    });

    useEffect(() => {
        setData('permissions', selectedPermissions);
    }, [selectedPermissions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/settings/roles/${role.id}`, {
            data: {
                ...data,
                permissions: selectedPermissions,
            },
            onSuccess: () => {
                toast.success(t('common:updated_successfully', { item: t('common:role') }));
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error(t('common:failed_to_update', { item: t('common:role') }));
            },
        });
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setSelectedPermissions((prev) => [...prev, permissionId]);
        } else {
            setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId));
        }
    };

    const handleGroupPermissionChange = (groupPermissions: Permission[], checked: boolean) => {
        const groupIds = groupPermissions.map((p) => p.id);
        if (checked) {
            setSelectedPermissions((prev) => [...new Set([...prev, ...groupIds])]);
        } else {
            setSelectedPermissions((prev) => prev.filter((id) => !groupIds.includes(id)));
        }
    };

    const isGroupChecked = (groupPermissions: Permission[]) => {
        return groupPermissions.every((p) => selectedPermissions.includes(p.id));
    };

    const isGroupIndeterminate = (groupPermissions: Permission[]) => {
        const checkedCount = groupPermissions.filter((p) => selectedPermissions.includes(p.id)).length;
        return checkedCount > 0 && checkedCount < groupPermissions.length;
    };

    const handleModuleSelectAll = (modulePermissions: Permission[]) => {
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !modulePermissionIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => {
                const newPermissions = [...prev];
                modulePermissionIds.forEach((id) => {
                    if (!newPermissions.includes(id)) {
                        newPermissions.push(id);
                    }
                });
                return newPermissions;
            });
        }
    };

    // If permissions is an object (grouped), flatten it to an array
    const flatPermissions = Array.isArray(permissions) ? permissions : Object.values(permissions).flat();

    // Group permissions by module
    const groupedPermissions = flatPermissions.reduce(
        (acc, permission) => {
            const [module] = permission.name.split('.');
            if (!acc[module]) acc[module] = [];
            acc[module].push(permission);
            return acc;
        },
        {} as Record<string, typeof flatPermissions>,
    );

    return (
        <AppLayout title={t('edit_role')} breadcrumbs={breadcrumbs} requiredPermission="roles.edit">
            <Head title={t('edit_role')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/settings/roles/${role.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common:back_to')} {t('view_role')}
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        {t('edit_role')}
                                    </CardTitle>
                                    <CardDescription>{t('edit_role_description')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="general">{t('common:general')}</TabsTrigger>
                                            <TabsTrigger value="permissions">{t('common:permissions')}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="general" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">{t('role_name')} *</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder={t('role_name_placeholder')}
                                                />
                                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="display_name">{t('display_name')}</Label>
                                                <Input
                                                    id="display_name"
                                                    value={data.display_name}
                                                    onChange={(e) => setData('display_name', e.target.value)}
                                                    placeholder={t('display_name_placeholder')}
                                                />
                                                {errors.display_name && <p className="text-sm text-red-500">{errors.display_name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">{t('description')}</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder={t('description_placeholder')}
                                                    rows={3}
                                                />
                                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="permissions" className="space-y-6">
                                            {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                                <div key={module} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium capitalize">
                                                            {module.replace('_', ' ')} ({permissions.length})
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleModuleSelectAll(permissions)}
                                                        >
                                                            {permissions.every((p) => selectedPermissions.includes(p.id))
                                                                ? t('common:deselect_all')
                                                                : t('common:select_all')}
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                        {permissions.map((permission) => (
                                                            <div key={permission.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`permission-${permission.id}`}
                                                                    checked={selectedPermissions.includes(permission.id)}
                                                                    onCheckedChange={(checked) =>
                                                                        handlePermissionChange(permission.id, checked as boolean)
                                                                    }
                                                                />
                                                                <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                                                                    {permission.display_name || permission.name}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {errors.permissions && <p className="text-sm text-red-500">{errors.permissions}</p>}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('common:actions')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <Shield className="mr-2 h-4 w-4 animate-spin" />
                                                {t('common:saving')}...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {t('common:save')} {t('common:changes')}
                                            </>
                                        )}
                                    </Button>

                                    <Button type="button" variant="outline" className="w-full" asChild>
                                        <Link href={`/settings/roles/${role.id}`}>
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            {t('common:cancel')}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
