import { AppLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Label } from '@/Core';
import { BreadcrumbItem } from '@/Core/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    display_name?: string;
    guard_name: string;
}

interface Props {
    roles: Role[];
}

export default function Create({ roles }: Props) {
    const { t } = useTranslation('core');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            '/settings/users',
            {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                roles: selectedRoles,
            },
            {
                onSuccess: () => {
                    toast.success('User created successfully');
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to create user');
                },
            },
        );
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/settings' },
        { title: 'Users', href: '/settings/users' },
        { title: 'Create', href: '/settings/users/create' },
    ];

    return (
        <AppLayout title="Create User" breadcrumbs={breadcrumbs} requiredPermission="users.create">
            <Head title="Create User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <UserPlus className="h-6 w-6" />
                                Create User
                            </CardTitle>
                            <CardDescription>Create a new user and assign roles</CardDescription>
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="Confirm password"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>}
                                </div>

                                <div>
                                    <Label>Roles</Label>
                                    <div className="mt-4 space-y-2">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={selectedRoles.includes(role.id)}
                                                    onCheckedChange={() => handleRoleChange(role.id)}
                                                />
                                                <Label htmlFor={`role-${role.id}`}>{role.display_name || role.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">Create User</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
