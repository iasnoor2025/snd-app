import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '../../../../../../resources/js/components/ui/button';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../../../../../resources/js/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../../resources/js/components/ui/table';

interface Role {
  id: number;
  name: string;
}

interface Props {
  roles: Role[];
}

const RolesIndex: React.FC<Props> = ({ roles }) => {
  const [deleteRole, setDeleteRole] = useState<{ id: number; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDeleteDialog = (role: Role) => {
    setDeleteRole(role);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteRole) {
      router.delete(route('roles.destroy', deleteRole.id));
      setDialogOpen(false);
      setDeleteRole(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDeleteRole(null);
  };

  return (
    <AdminLayout title="Roles" requiredPermission="roles.view">
      <Head title="Roles" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Button onClick={() => router.get(route('roles.create'))}>
            Create Role
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.get(route('roles.edit', role.id))}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(role)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role{' '}
              <span className="font-semibold">{deleteRole?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default RolesIndex;
