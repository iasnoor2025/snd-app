import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/Core";
import { Search, Plus, Eye, Edit, Trash2, Key } from 'lucide-react';
import { usePermission } from "@/Core";
import { toast } from 'sonner';
import { Permission } from "@/Core";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Permissions', href: '/settings/permissions' },
];

interface PermissionItem {
  id: number;
  name: string;
  display_name?: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Props extends PageProps {
  permissions: PermissionItem[];
  auth: any;
}

export default function Index({ auth, permissions }: Props) {
  const { t } = useTranslation('core');
  const [search, setSearch] = useState('');
  const { hasPermission } = usePermission();

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(search.toLowerCase()) ||
    permission.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group permissions by module
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const [module] = permission.name.split('.');
    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  const handleDelete = (permissionId: number, permissionName: string) => {
    if (confirm(`Are you sure you want to delete the permission "${permissionName}"?`)) {
      router.delete(`/settings/permissions/${permissionId}`, {
        onSuccess: () => {
          toast.success('Permission deleted successfully');
        },
        onError: (errors) => {
          toast.error(errors.message || 'Failed to delete permission');
        },
      });
    }
  };

  return (
    <AppLayout 
      title="Permissions Management" 
      breadcrumbs={breadcrumbs} 
      requiredPermission="permissions.view"
    >
      <Head title="Permissions Management" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Key className="h-6 w-6" />
                Permissions Management
              </CardTitle>
              <CardDescription>
                Manage system permissions and their assignments
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Permission permission="permissions.create">
                <Button asChild>
                  <Link href="/settings/permissions/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permission
                  </Link>
                </Button>
              </Permission>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Key className="h-8 w-8" />
                  <p>No permissions found</p>
                  {search && <p className="text-sm">Try adjusting your search</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold capitalize">
                        {module.replace('_', ' ')} Module
                      </h3>
                      <Badge variant="secondary">
                        {modulePermissions.length} permission{modulePermissions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Permission Name</TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Guard</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {modulePermissions.map((permission) => (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">
                                <Badge variant="outline">{permission.name}</Badge>
                              </TableCell>
                              <TableCell>
                                {permission.display_name || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{permission.guard_name}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Permission permission="permissions.view">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/settings/permissions/${permission.id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </Permission>
                                  <Permission permission="permissions.edit">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/settings/permissions/${permission.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </Permission>
                                  <Permission permission="permissions.delete">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(permission.id, permission.name)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </Permission>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <p>Showing {filteredPermissions.length} of {permissions.length} permissions</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/roles">
                    <Key className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 
