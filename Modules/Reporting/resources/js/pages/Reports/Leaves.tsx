import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { DataTable } from '@/Modules/Core/resources/js/components/ui/data-table';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Modules/Core/resources/js/components/ui/select';
import { DatePicker } from '@/Modules/Core/resources/js/components/ui/date-picker';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface LeaveData {
  id: number;
  employee: {
    id: number;
    name: string;
    employee_id: string;
  };
  department: string;
  leaveType: {
    id: number;
    name: string;
    color: string;
  };
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string;
}

interface Department {
  id: number;
  name: string;
}

interface LeaveType {
  id: number;
  name: string;
}

interface Props extends PageProps {
  leaves: {
    data: LeaveData[];
    current_page: number;
    last_page: number;
  };
  summary: {
    total_leaves: number;
    approved_leaves: number;
    pending_leaves: number;
    rejected_leaves: number;
    total_days: number;
  };
  filters: {
    search?: string;
    status?: string;
    department?: string;
    leave_type?: string;
    start_date?: string;
    end_date?: string;
    sort_field?: string;
    sort_direction?: string;
  };
  departments: Department[];
  leaveTypes: LeaveType[];
}

export default function Leaves({ leaves, summary, filters, departments, leaveTypes }: Props) {
  const { data, setData, get } = useForm({
    search: filters.search || '',
    status: filters.status || '',
    department: filters.department || '',
    leave_type: filters.leave_type || '',
    start_date: filters.start_date || '',
    end_date: filters.end_date || '',
    sort_field: filters.sort_field || 'created_at',
    sort_direction: filters.sort_direction || 'desc',
  });

  const handleSearch = () => {
    get(route('reporting.modules.leaves'), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Filters applied successfully');
      },
      onError: () => {
        toast.error('Failed to apply filters');
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const columns = [
    {
      accessorKey: 'employee.name',
      header: 'Employee',
    },
    {
      accessorKey: 'employee.employee_id',
      header: 'Employee ID',
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'leaveType.name',
      header: 'Leave Type',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
    },
    {
      accessorKey: 'days',
      header: 'Days',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <Head title="Leave Reports" />

      <div className="container mx-auto py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_leaves}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.approved_leaves}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending_leaves}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.rejected_leaves}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_days}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Leave Reports</CardTitle>
            <CardDescription>View and analyze leave data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search employees..."
                  value={data.search}
                  onChange={(e) => setData('search', e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={data.department} onValueChange={(value) => setData('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={data.leave_type} onValueChange={(value) => setData('leave_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Leave Types</SelectItem>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <DatePicker
                  value={data.start_date ? new Date(data.start_date) : undefined}
                  onChange={(date) => setData('start_date', date?.toISOString().split('T')[0] || '')}
                  placeholder="Start Date"
                />
              </div>
              <div className="w-full md:w-48">
                <DatePicker
                  value={data.end_date ? new Date(data.end_date) : undefined}
                  onChange={(date) => setData('end_date', date?.toISOString().split('T')[0] || '')}
                  placeholder="End Date"
                />
              </div>
              <Button onClick={handleSearch}>Apply Filters</Button>
              <Button variant="outline" onClick={() => {
                setData({
                  search: '',
                  status: '',
                  department: '',
                  leave_type: '',
                  start_date: '',
                  end_date: '',
                  sort_field: 'created_at',
                  sort_direction: 'desc',
                });
                get(route('reporting.modules.leaves'), {
                  preserveState: true,
                  preserveScroll: true,
                });
              }}>Reset</Button>
            </div>

            <DataTable
              columns={columns}
              data={leaves.data}
              pagination={{
                pageIndex: leaves.current_page - 1,
                pageCount: leaves.last_page,
              }}
              sorting={{
                field: data.sort_field,
                direction: data.sort_direction as 'asc' | 'desc',
                onSort: (field, direction) => {
                  setData('sort_field', field);
                  setData('sort_direction', direction);
                  handleSearch();
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
} 