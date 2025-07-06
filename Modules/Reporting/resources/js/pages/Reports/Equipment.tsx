import React, { useState } from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, DatePicker } from '@/Core';
import { ArrowLeft } from 'lucide-react';

interface EquipmentData {
  id: number;
  name: string;
  model: string;
  category: string;
  status: string;
  daily_rate: number;
  total_rentals: number;
}

const mockSummary = {
  total_equipment: 80,
  available_equipment: 30,
  rented_equipment: 50,
  total_daily_rate: 12000,
};

const mockData: EquipmentData[] = [
  { id: 1, name: 'Excavator', model: 'CAT320', category: 'Heavy', status: 'available', daily_rate: 500, total_rentals: 12 },
  { id: 2, name: 'Bulldozer', model: 'Komatsu D65', category: 'Heavy', status: 'rented', daily_rate: 700, total_rentals: 8 },
];

export default function Equipment() {
  const [data, setData] = useState({
    search: '',
    status: 'all',
    category: 'all',
    start_date: '',
    end_date: '',
  });

  const columns = [
    { header: 'Name', accessorKey: 'name' as keyof EquipmentData },
    { header: 'Model', accessorKey: 'model' as keyof EquipmentData },
    { header: 'Category', accessorKey: 'category' as keyof EquipmentData },
    { header: 'Status', accessorKey: 'status' as keyof EquipmentData },
    { header: 'Daily Rate', accessorKey: 'daily_rate' as keyof EquipmentData, cell: (row: EquipmentData) => `$${row.daily_rate}` },
    { header: 'Total Rentals', accessorKey: 'total_rentals' as keyof EquipmentData },
  ];

  const handleSearch = () => {
    // Implement real search logic or Inertia visit here
  };

  return (
    <AppLayout title="Equipment Report">
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
            <CardHeader><CardTitle>Total Equipment</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{mockSummary.total_equipment}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Available</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{mockSummary.available_equipment}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rented</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{mockSummary.rented_equipment}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Daily Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">${mockSummary.total_daily_rate}</div></CardContent>
          </Card>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Equipment Reports</CardTitle>
            <CardDescription>View and analyze equipment data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input placeholder="Search equipment..." value={data.search} onChange={e => setData(prev => ({ ...prev, search: e.target.value }))} />
              </div>
              <div className="w-full md:w-48">
                <Select value={data.status} onValueChange={value => setData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Input placeholder="Category" value={data.category} onChange={e => setData(prev => ({ ...prev, category: e.target.value }))} />
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
