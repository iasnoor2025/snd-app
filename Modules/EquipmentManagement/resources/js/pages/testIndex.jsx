import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { getTranslation } from '@/utils/translation';

const Index = ({ equipment }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      'available': 'bg-green-500',
      'in_use': 'bg-blue-500',
      'under_maintenance': 'bg-yellow-500',
      'needs_maintenance': 'bg-red-500',
      'out_of_order': 'bg-gray-500',
    };

    return (
      <Badge className={statusMap[status] || 'bg-gray-400'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Equipment Management"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Equipment Management
        </h2>
      )}
    >
      <Head title="Equipment Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Equipment List</h3>
                <Link href={route('equipment.create')}>
                  <Button>Add New Equipment</Button>
                </Link>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        <Link href={route('equipment.show', item.id)} className="text-blue-600 hover:text-blue-800">
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.category ? item.category.name : '-'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.location ? item.location.name : '-'}</TableCell>
                      <TableCell>{item.purchase_date ? formatDate(item.purchase_date) : '-'}</TableCell>
                      <TableCell className="space-x-2">
                        <Link href={route('equipment.edit', item.id)}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={route('equipment.show', item.id)}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {equipment.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No equipment found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-6">
                <Pagination links={equipment.links} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
