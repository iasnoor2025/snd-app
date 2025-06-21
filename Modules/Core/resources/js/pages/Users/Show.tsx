import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";
import { ArrowLeft, User, Edit, Key, Shield, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Role {
  id: number;
  name: string;
  display_name?: string;
  guard_name: string;
}

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
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}

interface Props {
  user: User;
}

export default function Show({ user }: Props) {
  const { t } = useTranslation('core');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings' },
    { title: 'Users', href: '/settings/users' },
    { title: user.name, href: `/settings/users/${user.id}` },
  ];

  return (
    <AppLayout 
      title={`User: ${user.name}`} 
      breadcrumbs={breadcrumbs} 
      requiredPermission="users.view"
    >
      <Head title={`User: ${user.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                {user.name}
              </CardTitle>
              <CardDescription>
                User details and permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/settings/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/settings/users/${user.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Name</TableCell>
                        <TableCell>{user.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Email</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {user.email}
                          {user.email_verified_at ? (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Not Verified
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Created At</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'PPpp')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Last Updated</TableCell>
                        <TableCell>{format(new Date(user.updated_at), 'PPpp')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Roles */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Roles</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/settings/users/${user.id}/roles`}>
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Roles
                    </Link>
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Guard</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No roles assigned
                          </TableCell>
                        </TableRow>
                      ) : (
                        user.roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              <Badge variant="outline">{role.name}</Badge>
                            </TableCell>
                            <TableCell>{role.display_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{role.guard_name}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Direct Permissions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Direct Permissions</h3>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/settings/users/${user.id}/permissions`}>
                      <Key className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </Link>
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Guard</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.permissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No direct permissions assigned
                          </TableCell>
                        </TableRow>
                      ) : (
                        user.permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                              <Badge variant="outline">{permission.name}</Badge>
                            </TableCell>
                            <TableCell>{permission.display_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{permission.guard_name}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 