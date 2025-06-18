import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { TableComponent, Column } from '../../../../../../resources/js/components/ui/table';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '../../../../../../resources/js/components/ui/select';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import { Pencil } from 'lucide-react';
import { route } from 'ziggy-js';
import { differenceInDays, parseISO } from 'date-fns'; 
import { Badge } from '../../../../../../resources/js/components/ui/badge';
import { useTranslation } from '../../../../../../resources/js/hooks/useTranslation';

interface Role { id: number; name: string; }
interface User {
  id: number;
  name: string;
  email: string;
  is_active?: boolean;
  roles: Role[];
  last_login_at?: string | Date;
}
interface Props {
  users: User[];
  roles: Role[];
}

const PAGE_SIZE = 10;

const UsersIndex: React.FC<Props> = ({ users, roles }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [roleUpdates, setRoleUpdates] = useState<{ [userId: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortKey as keyof User];
        let bValue: any = b[sortKey as keyof User];
        if (sortKey === 'roles') {
          aValue = a.roles.map(r => r.name).join(', ');
          bValue = b.roles.map(r => r.name).join(', ');
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortDirection === 'asc' ? Number(bValue) - Number(aValue) : Number(aValue) - Number(bValue);
        }
        return 0;
      });
    }
    return filtered;
  }, [users, search, sortKey, sortDirection]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Handle role change
  const handleRoleChange = (userId: number, roleId: number) => {
    setRoleUpdates(prev => ({ ...prev, [userId]: roleId }));
  };

  // Assign role
  const assignRole = (userId: number) => {
    const roleId = roleUpdates[userId];
    if (!roleId) return;
    setLoading(true);
    router.post(`/users/${userId}/roles`, { role_id: roleId }, {
      onFinish: () => setLoading(false),
    });
  };

  // Delete user
  const deleteUser = (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    router.delete(`/users/${userId}`, {
      onFinish: () => setLoading(false),
    });
  };

  // Bulk delete
  const bulkDelete = () => {
    if (!window.confirm('Delete selected users?')) return;
    setLoading(true);
    router.delete('/users/bulk-destroy', {
      data: { ids: selected },
      onFinish: () => { setLoading(false); setSelected([]); },
    });
  };

  // Toggle select
  const toggleSelect = (userId: number) => {
    setSelected(sel => sel.includes(userId) ? sel.filter(id => id !== userId) : [...sel, userId]);
  };

  // Select all
  const selectAll = () => {
    setSelected(paginatedUsers.map(u => u.id));
  };

  // Deselect all
  const deselectAll = () => {
    setSelected([]);
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      key: 'select',
      header: '',
      accessor: (user) => (
        <input
          type="checkbox"
          checked={selected.includes(user.id)}
          onChange={() => toggleSelect(user.id)}
        />
      ),
      width: 40,
      className: 'text-center',
      sortable: false,
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (user) => user.name,
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (user) => user.email,
      sortable: true,
    },
    {
      key: 'roles',
      header: 'Roles',
      accessor: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map(role => (
              <Badge key={role.id} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-xs">No roles assigned</span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (user) => {
        let status = 'Inactive';
        if (user.last_login_at) {
          const lastLogin = typeof user.last_login_at === 'string' ? parseISO(user.last_login_at) : new Date(user.last_login_at);
          const now = new Date();
          const days = differenceInDays(now, lastLogin);
          if (days <= 7) status = 'Active';
        }
        return (
          <Badge variant={status === 'Active' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.get(route('users.show', user.id, undefined, { locale }))}
            title="View User"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.get(route('users.edit', user.id, undefined, { locale }))}
            title="Edit User"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteUser(user.id)}
            disabled={loading}
            title="Delete User"
          >
            Delete
          </Button>
        </div>
      ),
      sortable: false,
      width: 200,
    },
  ];

  const { locale } = useTranslation();

  return (
    <AdminLayout title="User Management">
      <Head title="User Management" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => router.get(route('users.create', undefined, undefined, { locale }))}>
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by name or email" />
            <Button variant="outline" onClick={selectAll}>Select All</Button>
            <Button variant="outline" onClick={deselectAll}>Deselect All</Button>
            <Button variant="destructive" onClick={bulkDelete} disabled={selected.length === 0}>Delete Selected</Button>
          </div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selected.includes(u.id))}
              onChange={e => (e.target.checked ? selectAll() : deselectAll())}
              className="mr-2"
            />
            <span className="text-sm text-muted-foreground">Select All on Page</span>
          </div>
          <TableComponent
            data={paginatedUsers}
            columns={columns}
            isLoading={loading}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={(key, dir) => { setSortKey(key); setSortDirection(dir); }}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
            showPagination={true}
            showBorders={true}
            striped={true}
            compact={false}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default UsersIndex;
