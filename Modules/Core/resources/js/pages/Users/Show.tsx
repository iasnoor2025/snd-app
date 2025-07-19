import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Table,
} from '@/Core';
import { BreadcrumbItem } from '@/Core/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Key, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Role {
    id: number;
    name: string;
    display_name?: string;
    guard_name: string;
    permissions?: Permission[];
}

interface Permission {
    id: number;
    name: string;
    display_name?: string;
    guard_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    permissions: Permission[];
}

interface Props {
    user: User;
}

export default function Show({ user }: Props) {
    const { t } = useTranslation('core');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];



    return (
        <AppLayout title={`User: ${user.name}`} breadcrumbs={breadcrumbs} requiredPermission="users.view">
            <Head title={`User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <User className="h-6 w-6" />
                                {user.name}
                            </CardTitle>
                            <CardDescription>User details and permissions</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" asChild>
                                <Link href="/users">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/users/${user.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* User Information */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">User Information</h3>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Name</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Email</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {user.email}
                                                        {user.email_verified_at ? (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Not Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Created At</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(user.created_at), 'PPpp')}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Last Updated</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(user.updated_at), 'PPpp')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Roles */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Roles</h3>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/settings/user-roles#user-${user.id}`}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Manage Roles
                                        </Link>
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {user.roles.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                                                        No roles assigned
                                                    </td>
                                                </tr>
                                            ) : (
                                                user.roles.map((role) => (
                                                    <tr key={role.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <Badge variant="outline">{role.name}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{role.display_name || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <Badge variant="secondary">{role.guard_name}</Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Direct Permissions */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Direct Permissions</h3>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/settings/users/${user.id}/permissions`}>
                                            <Key className="mr-2 h-4 w-4" />
                                            Manage Permissions
                                        </Link>
                                    </Button>
                                </div>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {user.permissions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                                                        No direct permissions assigned
                                                    </td>
                                                </tr>
                                            ) : (
                                                user.permissions.map((permission) => (
                                                    <tr key={permission.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <Badge variant="outline">{permission.name}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{permission.display_name || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <Badge variant="secondary">{permission.guard_name}</Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
