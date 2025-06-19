import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
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
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Modules/Core/resources/js/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Modules/Core/resources/js/components/ui/dialog';
import { Checkbox } from '@/Modules/Core/resources/js/components/ui/checkbox';
import { Search, ArrowLeft, Users, Edit, Shield, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Permission from '@/Modules/Core/resources/js/components/Permission';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Roles', href: '/settings/roles' },
  { title: 'User Roles', href: '/settings/user-roles' },
];

interface Role {
  id: number;
  name: string;
  display_name?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Array<{
    id: number;
    name: string;
  }>;
}

interface Props extends PageProps {
  users: User[];
  roles: Role[];
  auth: any;
}

export default function UserRoles({ auth, users, roles }: Props) {
  const { t } = useTranslation('core');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.roles.some(role => 
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.display_name?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles.map(role => role.id));
    setIsDialogOpen(true);
  };

  const handleSaveUserRoles = () => {
    if (!editingUser) return;

    router.put(`/settings/user-roles/${editingUser.id}`, {
      roles: selectedRoles,
    }, {
      onSuccess: () => {
        toast.success('User roles updated successfully');
        setIsDialogOpen(false);
        setEditingUser(null);
        setSelectedRoles([]);
      },
      onError: (errors) => {
        toast.error('Failed to update user roles');
      },
    });
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const getRolesBadges = (userRoles: Role[]) => {
    if (userRoles.length === 0) {
      return <Badge variant="outline">No roles</Badge>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {userRoles.map((role) => (
          <Badge key={role.id} variant="secondary" className="text-xs">
            {role.display_name || role.name}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout 
      title="User Roles Management" 
      breadcrumbs={breadcrumbs} 
      requiredPermission="roles.view"
    >
      <Head title="User Roles Management" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings/roles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                User Roles Management
              </CardTitle>
              <CardDescription>
                Manage role assignments for all users in the system
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Direct Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-8 w-8" />
                          <p>No users found</p>
                          {search && <p className="text-sm">Try adjusting your search</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>
                          {user.email}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {getRolesBadges(user.roles)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.permissions.length} permission{user.permissions.length !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Permission permission="roles.edit">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Permission>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>Showing {filteredUsers.length} of {users.length} users</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Roles Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Edit User Roles
              </DialogTitle>
              <DialogDescription>
                {editingUser && `Manage roles for ${editingUser.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Roles</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => 
                          handleRoleChange(role.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`role-${role.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div>
                          <div className="font-medium">{role.display_name || role.name}</div>
                          <div className="text-xs text-muted-foreground">{role.name}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Selected roles: <span className="font-medium">{selectedRoles.length}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveUserRoles}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 