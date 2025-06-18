import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '../../../../../../resources/js/components/ui/select';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { getTranslation } from '../../../../../../resources/js/utils/translation';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

interface Props {
  user: User;
  roles: Role[];
  success?: string;
  error?: string;
}

const EditUser: React.FC<Props> = ({ user, roles, success, error }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    role: user.roles[0]?.id ? String(user.roles[0].id) : '',
  });
  const page = usePage();

  useEffect(() => {
    if (page.props.success) toast.success(page.props.success as string);
    if (page.props.error) toast.error(page.props.error as string);
  }, [page.props.success, page.props.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('users.update', user.id));
  };

  return (
    <AdminLayout title="Edit User">
      <Head title="Edit User" />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder="Name"
                required
              />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>
            <div>
              <Input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="Email"
                required
              />
              {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            </div>
            <div>
              <Input
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                placeholder="Password (leave blank to keep current)"
              />
              {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
            </div>
            <div>
              <Input
                type="password"
                value={data.password_confirmation}
                onChange={e => setData('password_confirmation', e.target.value)}
                placeholder="Confirm Password"
              />
              {errors.password_confirmation && <div className="text-red-500 text-sm">{errors.password_confirmation}</div>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <Select
                value={data.role}
                onValueChange={val => setData('role', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={String(role.id)}>{role.display_name || role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
            </div>
            <Button type="submit" disabled={processing} className="w-full">Update</Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EditUser;
