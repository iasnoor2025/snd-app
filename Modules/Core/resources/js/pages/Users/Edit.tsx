import { AppLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Label } from '@/Core';
import { BreadcrumbItem, PageProps } from '@/Core/types/index';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name?: string;
    description?: string;
    guard_name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
}

interface Props extends PageProps {
    user: UserData;
    roles: Role[];
}

export default function Edit({ user, roles }: Props) {
    const { t } = useTranslation(['common']);
    const [selectedRoles, setSelectedRoles] = useState<number[]>(user.roles.map((role) => role.id));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data, setData, put, processing, reset } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles.map((role) => role.id),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common:dashboard'), href: route('dashboard') },
        { title: t('common:users'), href: route('users.index') },
        { title: user.name, href: route('users.show', user.id) },
        { title: t('common:edit'), href: '' },
    ];

    useEffect(() => {
        setData('roles', selectedRoles);
    }, [selectedRoles]);

    const handleRoleChange = (roleId: number, checked: boolean) => {
        const updatedRoles = checked ? [...selectedRoles, roleId] : selectedRoles.filter((id) => id !== roleId);

        setSelectedRoles(updatedRoles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(
            route('users.update', user.id),
            {
                name: data.name,
                email: data.email,
                roles: selectedRoles,
            },
            {
                onSuccess: () => {
                    toast.success(t('common:messages.update_success', { resource: 'User' }));
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error(t('common:messages.update_error'));
                },
            },
        );
    };

    const handleCancel = () => {
        reset();
        window.history.back();
    };

    return (
        <AppLayout title={`Edit User: ${user.name}`} breadcrumbs={breadcrumbs} requiredPermission="users.edit">
            <Head title={`Edit User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <User className="h-6 w-6" />
                                Edit User: {user.name}
                            </CardTitle>
                            <CardDescription>Update user details and roles</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" asChild>
                                <Link href="/settings/users">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter user name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label>Roles</Label>
                                    <div className="mt-4 space-y-2">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={selectedRoles.includes(role.id)}
                                                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`role-${role.id}`}>{role.display_name || role.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
