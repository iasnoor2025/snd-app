import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
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
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Modules/Core/resources/js/components/ui/tabs';
import { ArrowLeft, User, Edit, Shield, Clock, Mail, Calendar } from 'lucide-react';
import Permission from '@/Modules/Core/resources/js/components/Permission';
import { format } from 'date-fns';

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
}

export default function Show({ user }: Props) {
  const { t } = useTranslation(['common']);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common:dashboard'), href: route('dashboard') },
    { title: t('common:users'), href: route('users.index') },
    { title: user.name, href: '' },
  ];

  // Get all unique permissions from user's roles
  const allPermissions = (user.roles || [])
    .flatMap(role => (role && role.permissions) ? role.permissions : [])
    .filter((permission) => permission && permission.id)
    .filter((permission, index, self) => 
      index === self.findIndex(p => p && p.id === permission.id)
    );

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, permission) => {
    if (!permission || !permission.name) return acc;
    
    const module = permission.name.split('.')[0];
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title={user.name} />

      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href={route('users.index')}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t('common:back')}
                    </Button>
                  </Link>
                </div>
                <Permission permission="users.edit">
                  <Link href={route('users.edit', user.id)}>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common:edit')}
                    </Button>
                  </Link>
                </Permission>
              </div>
              
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.name}
              </CardTitle>
              <CardDescription>
                {t('common:user_details_description', 'View user information, roles, and permissions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">{t('common:overview')}</TabsTrigger>
                  <TabsTrigger value="roles">{t('common:roles')}</TabsTrigger>
                  <TabsTrigger value="permissions">{t('common:permissions')}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">{t('common:basic_information')}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{t('common:name')}:</span>
                          <span>{user.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{t('common:email')}:</span>
                          <span>{user.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{t('common:status')}:</span>
                          <Badge variant={user.email_verified_at ? "default" : "destructive"}>
                            {user.email_verified_at ? t('common:verified') : t('common:unverified')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">{t('common:account_info')}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{t('common:created_at')}:</span>
                          <span>{format(new Date(user.created_at), 'PPpp')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{t('common:updated_at')}:</span>
                          <span>{format(new Date(user.updated_at), 'PPpp')}</span>
                        </div>
                        
                        {user.email_verified_at && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{t('common:verified_at')}:</span>
                            <span>{format(new Date(user.email_verified_at), 'PPpp')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('common:assigned_roles')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.roles || []).length > 0 ? (
                        (user.roles || []).map((role) => (
                          role && role.id ? (
                            <Badge key={role.id} variant="secondary" className="text-sm">
                              {role.display_name || role.name}
                            </Badge>
                          ) : null
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {t('common:no_roles_assigned')}
                        </span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('common:user_roles')}</h3>
                    
                    {(user.roles || []).length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {(user.roles || []).map((role) => (
                          <Card key={role.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {role.display_name || role.name}
                              </CardTitle>
                              {role.description && (
                                <CardDescription className="text-sm">
                                  {role.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <span className="text-sm font-medium">
                                  {t('common:permissions')} ({(role.permissions || []).length})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(role.permissions || []).slice(0, 5).map((permission) => (
                                    permission && permission.id ? (
                                      <Badge key={permission.id} variant="outline" className="text-xs">
                                        {permission.display_name || permission.name}
                                      </Badge>
                                    ) : null
                                  ))}
                                  {(role.permissions || []).length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{(role.permissions || []).length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))} 
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('common:no_roles_assigned')}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t('common:effective_permissions')} ({allPermissions.length})
                    </h3>
                    
                    {Object.keys(permissionsByModule).length > 0 ? (
                      <div className="space-y-6">
                        {Object.entries(permissionsByModule).map(([module, permissions]) => (
                          <Card key={module}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base capitalize">
                                {module} {t('common:module')}
                              </CardTitle>
                              <CardDescription>
                                {permissions.length} {t('common:permissions')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {permissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center p-2 border rounded">
                                    <Shield className="h-3 w-3 mr-2 text-gray-400" />
                                    <span className="text-sm">
                                      {permission.display_name || permission.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t('common:no_permissions_assigned')}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 