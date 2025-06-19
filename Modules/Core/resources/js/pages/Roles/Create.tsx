import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types/index';
import { AdminLayout } from '@/Modules/Core/resources/js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import { Checkbox } from '@/Modules/Core/resources/js/components/ui/checkbox';
import { ArrowLeft, Shield, Save, X } from 'lucide-react';
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
}

interface Props extends PageProps {
  permissions: Record<string, Permission[]>;
  auth: any;
}

export default function Create({ auth, permissions }: Props) {
  const { t } = useTranslation('core');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/settings/roles', {
      data: {
        ...data,
        permissions: selectedPermissions,
      },
      onSuccess: () => {
        toast.success('Role created successfully');
        reset();
        setSelectedPermissions([]);
      },
      onError: (errors) => {
        toast.error('Failed to create role');
      },
    });
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleGroupPermissionChange = (groupPermissions: Permission[], checked: boolean) => {
    const groupIds = groupPermissions.map(p => p.id);
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupIds])]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => !groupIds.includes(id)));
    }
  };

  const isGroupChecked = (groupPermissions: Permission[]) => {
    return groupPermissions.every(p => selectedPermissions.includes(p.id));
  };

  const isGroupIndeterminate = (groupPermissions: Permission[]) => {
    const checkedCount = groupPermissions.filter(p => selectedPermissions.includes(p.id)).length;
    return checkedCount > 0 && checkedCount < groupPermissions.length;
  };

  return (
    <AdminLayout 
      title="Create Role" 
      breadcrumbs={breadcrumbs} 
      requiredPermission="roles.create"
    >
      <Head title="Create Role" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings/roles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create New Role
              </CardTitle>
              <CardDescription>
                Define a new role with specific permissions for your system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., admin, manager, user"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    type="text"
                    value={data.display_name}
                    onChange={(e) => setData('display_name', e.target.value)}
                    placeholder="e.g., Administrator, Project Manager"
                  />
                  {errors.display_name && (
                    <p className="text-sm text-destructive">{errors.display_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Describe the role and its responsibilities..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions this role should have. Permissions are grouped by module.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors.permissions && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{errors.permissions}</p>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(permissions).map(([group, groupPermissions]) => (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group}`}
                        checked={isGroupChecked(groupPermissions)}
                        onCheckedChange={(checked) => 
                          handleGroupPermissionChange(groupPermissions, checked as boolean)
                        }
                        className={isGroupIndeterminate(groupPermissions) ? 'data-[state=checked]:bg-primary/50' : ''}
                      />
                      <Label 
                        htmlFor={`group-${group}`} 
                        className="text-sm font-medium capitalize cursor-pointer"
                      >
                        {group.replace('_', ' ')} ({groupPermissions.length})
                      </Label>
                    </div>
                    
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {groupPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`permission-${permission.id}`} 
                            className="text-sm cursor-pointer"
                          >
                            {permission.display_name || permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Selected permissions: <span className="font-medium">{selectedPermissions.length}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/settings/roles">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 