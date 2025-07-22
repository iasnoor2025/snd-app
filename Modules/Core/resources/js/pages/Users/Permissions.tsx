import { AppLayout } from '@/Core';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox } from '@/Core/Components/ui';





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
    roles: Array<{ id: number; name: string; display_name?: string }>;
}

interface Props {
    user: User;
    directPermissions: Permission[];
    allPermissions: Permission[];
}

export default function Permissions({ user, directPermissions, allPermissions }: Props) {
    const [selected, setSelected] = useState<number[]>(directPermissions.map((p) => p.id));
    const [saving, setSaving] = useState(false);

    const handleToggle = (id: number) => {
        setSelected((sel) => (sel.includes(id) ? sel.filter((pid) => pid !== id) : [...sel, id]));
    };

    const handleSave = () => {
        setSaving(true);
        router.put(
            `/settings/users/${user.id}/permissions`,
            { permissions: selected },
            {
                onSuccess: () => {
                    toast.success('Permissions updated successfully');
                    setSaving(false);
                },
                onError: () => {
                    toast.error('Failed to update permissions');
                    setSaving(false);
                },
            },
        );
    };

    return (
        <AppLayout
            title={`Manage Permissions: ${user.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Settings', href: '/settings' },
                { title: 'Users', href: '/settings/users' },
                { title: user.name, href: `/settings/users/${user.id}` },
                { title: 'Permissions', href: `/settings/users/${user.id}/permissions` },
            ]}
            requiredPermission="users.edit"
        >
            <Head title={`Manage Permissions: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                <Key className="h-6 w-6" />
                                Manage Direct Permissions
                            </CardTitle>
                            <CardDescription>Assign or remove direct permissions for this user.</CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={`/users/${user.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to User
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="font-medium">
                                User: <span className="text-primary">{user.name}</span> ({user.email})
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {user.roles.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allPermissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                                                    No permissions available
                                                </td>
                                            </tr>
                                        ) : (
                                            allPermissions.map((permission) => (
                                                <tr key={permission.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Checkbox
                                                            checked={selected.includes(permission.id)}
                                                            onChange={() => handleToggle(permission.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                            <div className="mt-6 flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Permissions'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
