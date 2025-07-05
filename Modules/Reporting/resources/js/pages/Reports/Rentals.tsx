import { Head } from '@inertiajs/react';
import { PageProps } from '@/Core/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { DataTable } from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { DatePicker } from "@/Core";
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface RentalData {
  id: number;
  rental_number: string;
  customer: {
    name: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  items_count: number;
  total_amount: number;
}

interface Props extends PageProps {
  rentals: {
    data: RentalData[];
    current_page: number;
    last_page: number;
  };
  summary: {
    total_rentals: number;
    active_rentals: number;
    completed_rentals: number;
    total_amount: number;
  };
  filters: {
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    sort_field?: string;
    sort_direction?: string;
  };
}

export default function Rentals({ rentals, summary, filters }: Props) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const { data, setData, get } = useForm({
    search: filters.search || '',
    status: filters.status || '',
    start_date: filters.start_date || '',
    end_date: filters.end_date || '',
    sort_field: filters.sort_field || 'created_at',
    sort_direction: filters.sort_direction || 'desc',
  });

  const handleSearch = () => {
    get(route('reporting.modules.rentals'), {
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

  const columns = [
    {
      accessorKey: 'rental_number',
      header: 'Rental Number',
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`capitalize ${row.original.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'items_count',
      header: 'Items',
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span>
          ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.original.total_amount) || '0.00'}
        </span>
      ),
    },
  ];

  return (
    <>
      <Head title="Rental Reports" />

      <div className="container mx-auto py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_rentals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.active_rentals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completed_rentals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.total_amount) || '0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rental Reports</CardTitle>
            <CardDescription>View and analyze rental data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search rentals..."
                  value={data.search}
                  onChange={(e) => setData('search', e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
            </div>

            <DataTable
              columns={columns}
              data={rentals.data}
              pagination={{
                pageIndex: rentals.current_page - 1,
                pageCount: rentals.last_page,
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
