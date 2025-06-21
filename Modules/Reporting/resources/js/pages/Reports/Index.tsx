import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import RevenueChart from './RevenueChart';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart } from '@/components/ui/charts';
import { DataTable } from '@/components/ui/data-table';

interface Stats {
  revenue: any;
  clients: number;
  equipment: number;
  rentals: number;
  invoices: number;
  payments: number;
  employees: number;
  projects: number;
  timesheets: number;
  leaves: number;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  // ... add other pagination fields as needed
}

interface RecentActivity {
  leaves: any;
  rentals: Paginated<any>;
  invoices: Paginated<any>;
  payments: Paginated<any>;
}

interface ChartData {
  leaveDistribution: any;
  monthlyRevenue: { month: string; total: number }[];
}

interface ReportsIndexProps {
  stats: Stats;
  recentActivity: RecentActivity;
  charts: ChartData;
  filters: {
    report_type: string;
    department: string;
    status: string; date_from?: string; date_to?: string 
};
}

interface LeaveData {
  id: number;
  employee: {
    name: string;
  };
  department: string;
  leaveType: {
    name: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  days: number;
}

const reportTypes = [
  { value: 'clients', label: 'Clients' },
  { value: 'rentals', label: 'Rentals' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'projects', label: 'Projects' },
  { value: 'employees', label: 'Employees' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'leaves', label: 'Leaves' },
];

const ReportsIndex: React.FC<ReportsIndexProps> = ({ stats, recentActivity, charts, filters }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, setData, get } = useForm({
    report_type: filters.report_type || 'overview',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
    department: filters.department || '',
    status: filters.status || '',
  });

  const handleSearch = () => {
    get(route('reporting.index'), {
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

  const rentalColumns = [
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
          ${row.original.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
        </span>
      ),
    },
  ];

  const leaveColumns = [
    {
      accessorKey: 'employee.name',
      header: 'Employee',
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
        <span className={`capitalize ${
          row.original.status === 'approved' ? 'text-green-600' : 
          row.original.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {row.original.status}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Comprehensive Reports Dashboard">
      <Head title="Comprehensive Reports Dashboard" />
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = route('reporting.export', { type: activeTab })}>
              Export Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="leaves">Leave Management</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rentals.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.leaves.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.equipment.available}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={charts.monthlyRevenue}
                    xField="month"
                    yField="total"
                    height={300}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Leave Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={charts.leaveDistribution}
                    xField="type"
                    yField="count"
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            <Button
              onClick={() => window.location.href = route('reporting.modules.rentals')}
              className="mb-4"
            >
              View Detailed Rental Reports
            </Button>
            <Card>
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
                      value={data.date_from ? new Date(data.date_from) : undefined}
                      onChange={(date) => setData('date_from', date?.toISOString().split('T')[0] || '')}
                      placeholder="Start Date"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <DatePicker
                      value={data.date_to ? new Date(data.date_to) : undefined}
                      onChange={(date) => setData('date_to', date?.toISOString().split('T')[0] || '')}
                      placeholder="End Date"
                    />
                  </div>
                  <Button onClick={handleSearch}>Apply Filters</Button>
                </div>

                <DataTable
                  columns={rentalColumns}
                  data={recentActivity.rentals.data}
                  pagination={{
                    pageIndex: recentActivity.rentals.current_page - 1,
                    pageCount: recentActivity.rentals.last_page,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-4">
            <Button
              onClick={() => window.location.href = route('reporting.modules.leaves')}
              className="mb-4"
            >
              View Detailed Leave Reports
            </Button>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.leaves.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.leaves.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.leaves.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.leaves.rejected}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={leaveColumns}
                  data={recentActivity.leaves.data}
                  pagination={{
                    pageIndex: recentActivity.leaves.current_page - 1,
                    pageCount: recentActivity.leaves.last_page,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.monthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.revenue.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={charts.monthlyRevenue}
                  xField="month"
                  yField="total"
                  height={400}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ReportsIndex;














