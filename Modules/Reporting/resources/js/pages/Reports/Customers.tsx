import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface CustomerData {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    total_rentals: number;
    total_payments: number;
}

const mockSummary = {
    total_customers: 150,
    active: 120,
    inactive: 30,
    total_payments: 485000,
};

const mockData: CustomerData[] = [
    { id: 1, name: 'Acme Corp', email: 'info@acme.com', phone: '123-456-7890', status: 'active', total_rentals: 12, total_payments: 25000 },
    { id: 2, name: 'Beta LLC', email: 'contact@beta.com', phone: '987-654-3210', status: 'inactive', total_rentals: 8, total_payments: 18000 },
];

export default function Customers() {
    const [data, setData] = useState({
        search: '',
        status: 'all',
    });

    const columns = [
        { header: 'Name', accessorKey: 'name' as keyof CustomerData },
        { header: 'Email', accessorKey: 'email' as keyof CustomerData },
        { header: 'Phone', accessorKey: 'phone' as keyof CustomerData },
        { header: 'Status', accessorKey: 'status' as keyof CustomerData },
        { header: 'Total Rentals', accessorKey: 'total_rentals' as keyof CustomerData },
        { header: 'Total Payments', accessorKey: 'total_payments' as keyof CustomerData, cell: (row: CustomerData) => `$${row.total_payments}` },
    ];

    const handleSearch = () => {
        // Implement real search logic or Inertia visit here
    };

    return (
        <AppLayout title="Customers Report">
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <a href="/reporting">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </a>
                </div>
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockSummary.total_customers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{mockSummary.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inactive</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{mockSummary.inactive}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${mockSummary.total_payments}</div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Customers Reports</CardTitle>
                        <CardDescription>View and analyze customer data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search customer..."
                                    value={data.search}
                                    onChange={(e) => setData((prev) => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={data.status} onValueChange={(value) => setData((prev) => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                                    {columns.map((col) => (
                                                        <th key={col.header} className="px-4 py-2 text-left">
                                                            {col.header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockData.map((row) => (
                                                    <tr key={row.id}>
                                                        {columns.map((col) => (
                                                            <td key={col.header} className="px-4 py-2">
                                                                {col.cell ? col.cell(row) : row[col.accessorKey]}
                                                            </td>
                                                        ))}
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
