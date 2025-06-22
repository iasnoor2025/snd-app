import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
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
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/Core";
import { ArrowLeft, Shield, Plus, Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: number;
  name: string;
  display_name?: string;
  guard_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

interface Props {
  users: User[];
  roles: Role[];
}

export default function UserRoles({ users, roles }: Props) {
  const { t } = useTranslation(['roles', 'common']);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(role => role.id));
    setIsDialogOpen(true);
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    router.put(`/settings/users/${selectedUser.id}/roles`, {
      roles: selectedRoles,
    }, {
      onSuccess: () => {
        toast.success(t('common:updated_successfully', { item: t('common:roles') }));
        setIsDialogOpen(false);
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error(t('common:failed_to_update', { item: t('common:roles') }));
      },
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common:dashboard'), href: '/dashboard' },
    { title: t('common:settings'), href: '/settings' },
    { title: t('manage_user_roles'), href: '/settings/user-roles' },
  ];

  return (
    <AppLayout 
      title={t('manage_user_roles')} 
      breadcrumbs={breadcrumbs} 
      requiredPermission="roles.assign"
    >
      <Head title={t('manage_user_roles')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                {t('manage_user_roles')}
              </CardTitle>
              <CardDescription>
                {t('subtitle')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common:search_users')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Shield className="h-8 w-8" />
                  <p>{t('common:no_items_found', { items: t('common:users').toLowerCase() })}</p>
                  {search && <p className="text-sm">{t('common:try_adjusting_search')}</p>}
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common:name')}</TableHead>
                      <TableHead>{t('common:email')}</TableHead>
                      <TableHead>{t('current_roles')}</TableHead>
                      <TableHead className="text-right">{t('common:actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => (
                              <Badge key={role.id} variant="secondary">
                                {role.display_name || role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserSelect(user)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('manage_roles_for')} {selectedUser?.name}
              </DialogTitle>
              <DialogDescription>
                {t('select_roles_to_assign')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`}>
                    {role.display_name || role.name}
                  </Label>
                </div>
              ))}

              {errors.roles && (
                <p className="text-sm text-red-500 mt-1">{errors.roles}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                {t('common:cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                <Plus className="h-4 w-4 mr-2" />
                {t('update_roles')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
} 
