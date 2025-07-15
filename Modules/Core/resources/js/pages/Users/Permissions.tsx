import { AppLayout } from '@/Core';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assign</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Display Name</TableHead>
                                        <TableHead>Guard</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPermissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(permission.id)}
                                                    onCheckedChange={() => handleToggle(permission.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">{permission.name}</Badge>
                                            </TableCell>
                                            <TableCell>{permission.display_name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{permission.guard_name}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
