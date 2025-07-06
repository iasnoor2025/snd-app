import React, { useState } from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, DatePicker } from '@/Core';
import { ArrowLeft } from 'lucide-react';

interface TimesheetData {
  id: number;
  employee: string;
  date: string;
  hours: number;
  status: string;
}

const mockSummary = {
  total_timesheets: 210,
  approved: 180,
  pending: 20,
  rejected: 10,
  total_hours: 1680,
};

const mockData: TimesheetData[] = [
  { id: 1, employee: 'John Doe', date: '2024-06-01', hours: 8, status: 'approved' },
  { id: 2, employee: 'Jane Smith', date: '2024-06-01', hours: 7, status: 'pending' },
];

export default function Timesheets() {
  const [data, setData] = useState({
    search: '',
    status: 'all',
    date: '',
  });

  const columns = [
    { header: 'Employee', accessorKey: 'employee' as keyof TimesheetData },
    { header: 'Date', accessorKey: 'date' as keyof TimesheetData },
    { header: 'Hours', accessorKey: 'hours' as keyof TimesheetData },
    { header: 'Status', accessorKey: 'status' as keyof TimesheetData },
  ];

  const handleSearch = () => {
    // Implement real search logic or Inertia visit here
  };

  return (
    <AppLayout title="Timesheets Report">
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <a href="/reporting">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader><CardTitle>Total Timesheets</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{mockSummary.total_timesheets}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{mockSummary.approved}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{mockSummary.pending}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{mockSummary.rejected}</div></CardContent>
          </Card>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timesheets Reports</CardTitle>
            <CardDescription>View and analyze timesheet data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input placeholder="Search employee..." value={data.search} onChange={e => setData(prev => ({ ...prev, search: e.target.value }))} />
              </div>
              <div className="w-full md:w-48">
                <Select value={data.status} onValueChange={value => setData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <DatePicker // @ts-ignore
                  selected={data.date ? new Date(data.date) : undefined}
                  onChange={(date: Date | null) => setData(prev => ({ ...prev, date: date ? date.toISOString().split('T')[0] : '' }))}
                  placeholder="Date"
                />
              </div>
              <Button onClick={handleSearch}>Apply Filters</Button>
            </div>
            <div className="mt-4">
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {columns.map(col => <th key={col.header} className="px-4 py-2 text-left">{col.header}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {mockData.map(row => (
                          <tr key={row.id}>
                            {columns.map(col => <td key={col.header} className="px-4 py-2">{col.cell ? col.cell(row) : row[col.accessorKey]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
