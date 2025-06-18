import React, { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../../resources/js/components/ui/table';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Permission {
  id: number;
  name: string;
}

interface Props {
  permissions: Permission[];
  success?: string;
  error?: string;
}

const PermissionsIndex: React.FC<Props> = ({ permissions, success, error }) => {
  const page = usePage();

  useEffect(() => {
    if (page.props.success) toast.success(page.props.success as string);
    if (page.props.error) toast.error(page.props.error as string);
  }, [page.props.success, page.props.error]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      router.delete(route('permissions.destroy', id));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <Button onClick={() => router.get(route('permissions.create'))} className="mt-2">Create Permission</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map(permission => (
              <TableRow key={permission.id}>
                <TableCell>{permission.id}</TableCell>
                <TableCell>{permission.name}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => router.get(route('permissions.edit', permission.id))}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(permission.id)} className="ml-2">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PermissionsIndex;
