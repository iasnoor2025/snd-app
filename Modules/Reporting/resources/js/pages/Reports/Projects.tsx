import React, { useState } from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, DatePicker } from '@/Core';
import { ArrowLeft } from 'lucide-react';

interface ProjectData {
  id: number;
  name: string;
  manager: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
}

const mockSummary = {
  total_projects: 32,
  active: 20,
  completed: 10,
  on_hold: 2,
  total_budget: 500000,
};

const mockData: ProjectData[] = [
  { id: 1, name: 'Project Alpha', manager: 'Alice', status: 'active', start_date: '2024-01-01', end_date: '2024-06-01', budget: 100000 },
  { id: 2, name: 'Project Beta', manager: 'Bob', status: 'completed', start_date: '2023-01-01', end_date: '2023-12-31', budget: 150000 },
];

export default function Projects() {
  const [data, setData] = useState({
    search: '',
    status: 'all',
    start_date: '',
    end_date: '',
  });

  const columns = [
    { header: 'Name', accessorKey: 'name' as keyof ProjectData },
    { header: 'Manager', accessorKey: 'manager' as keyof ProjectData },
    { header: 'Status', accessorKey: 'status' as keyof ProjectData },
    { header: 'Start Date', accessorKey: 'start_date' as keyof ProjectData },
    { header: 'End Date', accessorKey: 'end_date' as keyof ProjectData },
    { header: 'Budget', accessorKey: 'budget' as keyof ProjectData, cell: (row: ProjectData) => `$${row.budget}` },
  ];

  const handleSearch = () => {
    // Implement real search logic or Inertia visit here
  };

  return (
    <AppLayout title="Projects Report">
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
            <CardHeader><CardTitle>Total Projects</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{mockSummary.total_projects}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Active</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{mockSummary.active}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-gray-600">{mockSummary.completed}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>On Hold</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{mockSummary.on_hold}</div></CardContent>
          </Card>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Projects Reports</CardTitle>
            <CardDescription>View and analyze project data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input placeholder="Search project..." value={data.search} onChange={e => setData(prev => ({ ...prev, search: e.target.value }))} />
              </div>
              <div className="w-full md:w-48">
                <Select value={data.status} onValueChange={value => setData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <DatePicker // @ts-ignore
                  selected={data.start_date ? new Date(data.start_date) : undefined}
                  onChange={(date: Date | null) => setData(prev => ({ ...prev, start_date: date ? date.toISOString().split('T')[0] : '' }))}
                  placeholder="Start Date"
                />
              </div>
              <div className="w-full md:w-48">
                <DatePicker // @ts-ignore
                  selected={data.end_date ? new Date(data.end_date) : undefined}
                  onChange={(date: Date | null) => setData(prev => ({ ...prev, end_date: date ? date.toISOString().split('T')[0] : '' }))}
                  placeholder="End Date"
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
