import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from "@/components/ui";
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Roles', href: '/settings/roles' },
  { title: 'Create', href: '/settings/roles/create' },
];

interface Permission {
  id: number;
  name: string;
  display_name?: string;
  guard_name: string;
}

interface Props {
  permissions: Permission[];
}

export default function Create({ permissions }: Props) {
  const { t } = useTranslation('core');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const [module] = permission.name.split('.');
    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    router.post('/settings/roles', {
      name,
      display_name: displayName,
      permissions: selectedPermissions,
    }, {
      onSuccess: () => {
        toast.success('Role created successfully');
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error('Failed to create role');
      },
    });
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleModuleSelectAll = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all permissions in this module
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all permissions in this module
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        modulePermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  return (
    <AppLayout 
      title="Create Role" 
      breadcrumbs={breadcrumbs} 
      requiredPermission="roles.create"
    >
      <Head title="Create Role" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Create Role
              </CardTitle>
              <CardDescription>
                Create a new role and assign permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/settings/roles">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Roles
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter role name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className={errors.display_name ? 'border-red-500' : ''}
                  />
                  {errors.display_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.display_name}</p>
                  )}
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-4 space-y-6">
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <div key={module} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold capitalize">
                            {module.replace('_', ' ')} Module
                          </h3>
                          <Badge variant="secondary">
                            {modulePermissions.length} permission{modulePermissions.length !== 1 ? 's' : ''}
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleModuleSelectAll(modulePermissions)}
                          >
                            {modulePermissions.every(p => selectedPermissions.includes(p.id))
                              ? 'Deselect All'
                              : 'Select All'}
                          </Button>
                        </div>
                        
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">Select</TableHead>
                                <TableHead>Permission Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Guard</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {modulePermissions.map((permission) => (
                                <TableRow key={permission.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedPermissions.includes(permission.id)}
                                      onCheckedChange={() => handlePermissionChange(permission.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <Badge variant="outline">{permission.name}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {permission.display_name || '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{permission.guard_name}</Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.permissions && (
                    <p className="text-sm text-red-500 mt-1">{errors.permissions}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Create Role
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 