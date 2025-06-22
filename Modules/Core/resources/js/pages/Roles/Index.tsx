import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from "@/Core/types";
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
import { Search, Plus, Eye, Edit, Trash2, Shield, Users } from 'lucide-react';
import { usePermission } from "@/Core";
import { toast } from 'sonner';
import { CreateButton } from "@/Core";
import { CrudButtons } from "@/Core";
import { Permission } from "@/Core";
import { debounce } from 'lodash';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Roles', href: '/settings/roles' },
];

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
  roles: Role[];
  auth: any;
}

export default function Index({ auth, roles }: Props) {
  const { t } = useTranslation(['roles', 'common']);
  const [search, setSearch] = useState('');
  const { hasPermission } = usePermission();

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    role.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (roleId: number, roleName: string) => {
    if (confirm(`${t('common:are_you_sure_delete', { item: 'role' })}: "${roleName}"?`)) {
      router.delete(`/settings/roles/${roleId}`, {
        onSuccess: () => {
          toast.success(t('common:deleted_successfully', { item: 'role' }));
        },
        onError: (errors) => {
          toast.error(errors.message || t('common:failed_to_delete', { item: 'role' }));
        },
      });
    }
  };

  const getPermissionsBadge = (permissions: Role['permissions']) => {
    const count = permissions.length;
    if (count === 0) return <Badge variant="outline">{t('common:no_items', { items: t('common:permissions').toLowerCase() })}</Badge>;
    
    return (
      <Badge variant="secondary">
        {count} {count === 1 ? t('permission_singular') : t('permission_count')}
      </Badge>
    );
  };

  return (
    <AppLayout 
      title={t('title')} 
      breadcrumbs={breadcrumbs} 
      requiredPermission="roles.view"
    >
      <Head title={t('title')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                {t('title')}
              </CardTitle>
              <CardDescription>
                {t('subtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Permission permission="roles.create">
                <Button asChild>
                  <Link href="/settings/roles/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add_role')}
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
                  placeholder={t('search_roles')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('role_name')}</TableHead>
                    <TableHead>{t('display_name')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('permissions')}</TableHead>
                    <TableHead>{t('users')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Shield className="h-8 w-8" />
                          <p>{t('common:no_items_found', { items: t('common:roles').toLowerCase() })}</p>
                          {search && <p className="text-sm">{t('common:try_adjusting_search')}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{role.name}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.display_name || t('no_display_name')}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={role.description}>
                            {role.description || t('no_description')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPermissionsBadge(role.permissions)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{role.users_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Permission permission="roles.view">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/settings/roles/${role.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </Permission>
                            <Permission permission="roles.edit">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/settings/roles/${role.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </Permission>
                            <Permission permission="roles.delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(role.id, role.name)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Permission>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>{t('showing')} {filteredRoles.length} {t('of')} {roles.length} {t('roles')}</p>
              <Permission permission="roles.view">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/user-roles">
                    <Users className="h-4 w-4 mr-2" />
                    {t('manage_user_roles')}
                  </Link>
                </Button>
              </Permission>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 
