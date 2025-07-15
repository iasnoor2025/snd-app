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

interface PayrollData {
    id: number;
    employee: string;
    period: string;
    status: string;
    amount: number;
}

const mockSummary = {
    total_payrolls: 45,
    paid: 30,
    pending: 10,
    failed: 5,
    total_amount: 120000,
};

const mockData: PayrollData[] = [
    { id: 1, employee: 'John Doe', period: '2024-06', status: 'paid', amount: 3000 },
    { id: 2, employee: 'Jane Smith', period: '2024-06', status: 'pending', amount: 2800 },
];

export default function Payroll() {
    const [data, setData] = useState({
        search: '',
        status: 'all',
        period: '',
    });

    const columns = [
        { header: 'Employee', accessorKey: 'employee' as keyof PayrollData },
        { header: 'Period', accessorKey: 'period' as keyof PayrollData },
        { header: 'Status', accessorKey: 'status' as keyof PayrollData },
        { header: 'Amount', accessorKey: 'amount' as keyof PayrollData, cell: (row: PayrollData) => `$${row.amount}` },
    ];

    const handleSearch = () => {
        // Implement real search logic or Inertia visit here
    };

    return (
        <AppLayout title="Payroll Report">
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
                            <CardTitle>Total Payrolls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockSummary.total_payrolls}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Paid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{mockSummary.paid}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{mockSummary.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{mockSummary.failed}</div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Payroll Reports</CardTitle>
                        <CardDescription>View and analyze payroll data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search employee..."
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
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Input
                                    placeholder="Period (YYYY-MM)"
                                    value={data.period}
                                    onChange={(e) => setData((prev) => ({ ...prev, period: e.target.value }))}
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
