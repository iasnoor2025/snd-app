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
import { Checkbox } from '@/Modules/Core/resources/js/components/ui/checkbox';
import { ArrowLeft, User, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Permission from '@/Modules/Core/resources/js/components/Permission';

interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
}

interface Props extends PageProps {
  roles: Role[];
}

export default function Create({ roles }: Props) {
  const { t } = useTranslation(['common']);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] as number[],
    send_credentials: false,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common:dashboard'), href: route('dashboard') },
    { title: t('common:users'), href: route('users.index') },
    { title: t('common:create'), href: '' },
  ];

  const handleRoleChange = (roleId: number, checked: boolean) => {
    const updatedRoles = checked
      ? [...selectedRoles, roleId]
      : selectedRoles.filter(id => id !== roleId);
    
    setSelectedRoles(updatedRoles);
    setData('roles', updatedRoles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('users.store'), {
      onSuccess: () => {
        toast.success(t('common:messages.create_success', { resource: 'User' }));
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        toast.error(t('common:messages.create_error'));
      },
    });
  };

  const handleCancel = () => {
    reset();
    window.history.back();
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title={t('common:create_user')} />

      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link href={route('users.index')}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('common:back')}
                  </Button>
                </Link>
              </div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('common:create_user')}
              </CardTitle>
              <CardDescription>
                {t('common:create_user_description', 'Create a new user and assign roles')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t('common:name')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder={t('common:enter_name', 'Enter full name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t('common:email')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder={t('common:enter_email', 'Enter email address')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t('common:password')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                      placeholder={t('common:enter_password', 'Enter password')}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                      {t('common:confirm_password')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={errors.password_confirmation ? 'border-red-500' : ''}
                      placeholder={t('common:confirm_password')}
                    />
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>

                {/* Roles Section */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    {t('common:assign_roles')}
                  </Label>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {role.display_name || role.name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-gray-500">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.roles && (
                    <p className="text-sm text-red-500">{errors.roles}</p>
                  )}
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send_credentials"
                      checked={data.send_credentials}
                      onCheckedChange={(checked) => setData('send_credentials', checked as boolean)}
                    />
                    <Label htmlFor="send_credentials" className="text-sm">
                      {t('common:send_credentials_email', 'Send login credentials via email')}
                    </Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('common:cancel')}
                  </Button>
                  <Permission permission="users.create">
                    <Button type="submit" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common:creating') : t('common:create_user')}
                    </Button>
                  </Permission>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 