import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types/index';
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
import { ArrowLeft, User, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Permission from "@/components/Permission";
import { format } from 'date-fns';

interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  guard_name: string;
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
  roles: Role[];
}

export default function Edit({ user, roles }: Props) {
  const { t } = useTranslation(['common']);
  const [selectedRoles, setSelectedRoles] = useState<number[]>(
    user.roles.map(role => role.id)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, setData, put, processing, reset } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    roles: user.roles.map(role => role.id),
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common:dashboard'), href: route('dashboard') },
    { title: t('common:users'), href: route('users.index') },
    { title: user.name, href: route('users.show', user.id) },
    { title: t('common:edit'), href: '' },
  ];

  useEffect(() => {
    setData('roles', selectedRoles);
  }, [selectedRoles]);

  const handleRoleChange = (roleId: number, checked: boolean) => {
    const updatedRoles = checked
      ? [...selectedRoles, roleId]
      : selectedRoles.filter(id => id !== roleId);
    
    setSelectedRoles(updatedRoles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    router.put(`/settings/users/${user.id}`, {
      name: data.name,
      email: data.email,
      roles: selectedRoles,
    }, {
      onSuccess: () => {
        toast.success(t('common:messages.update_success', { resource: 'User' }));
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error(t('common:messages.update_error'));
      },
    });
  };

  const handleCancel = () => {
    reset();
    window.history.back();
  };

  return (
    <AppLayout 
      title={`Edit User: ${user.name}`} 
      breadcrumbs={breadcrumbs} 
      requiredPermission="users.edit"
    >
      <Head title={`Edit User: ${user.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Edit User: {user.name}
              </CardTitle>
              <CardDescription>
                Update user details and roles
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/settings/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter user name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label>Roles</Label>
                  <div className="mt-4 space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                        />
                        <Label htmlFor={`role-${role.id}`}>
                          {role.display_name || role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.roles && (
                    <p className="text-sm text-red-500 mt-1">{errors.roles}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  Update User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 