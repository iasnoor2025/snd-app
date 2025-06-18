import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { Badge } from '../../../../../../resources/js/components/ui/badge';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import { ArrowLeft, Edit, Mail, User as UserIcon } from 'lucide-react';
import { route } from 'ziggy-js';
import { getTranslation } from '../../../../../../resources/js/utils/translation';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}

interface Props {
  user: User;
}

const ShowUser: React.FC<Props> = ({ user }) => {
  return (
    <AdminLayout>
      <Head title={`${getTranslation('User Details')} - ${user.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('users.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {getTranslation('Back to Users')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{getTranslation('User Details')}</h1>
          </div>
          <Link href={route('users.edit', user.id)}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {getTranslation('Edit User')}
            </Button>
          </Link>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>{getTranslation('User Information')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{getTranslation('Name')}</label>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{getTranslation('Email')}</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{getTranslation('Email Verified')}</label>
                <p className="text-lg">
                  {user.email_verified_at ? (
                    <Badge variant="default">{getTranslation('Verified')}</Badge>
                  ) : (
                    <Badge variant="destructive">{getTranslation('Not Verified')}</Badge>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{getTranslation('Created At')}</label>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('Assigned Roles')}</CardTitle>
          </CardHeader>
          <CardContent>
            {user.roles && user.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{getTranslation('No roles assigned')}</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('Direct Permissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Badge key={permission.id} variant="outline">
                    {permission.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{getTranslation('No direct permissions assigned')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ShowUser;
