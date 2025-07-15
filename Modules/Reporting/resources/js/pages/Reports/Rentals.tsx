import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DataTable,
    DatePicker,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
    rentals?: {
        data: RentalData[];
        current_page: number;
        last_page: number;
    };
    summary?: {
        total_rentals: number;
        active_rentals: number;
        completed_rentals: number;
        total_amount: number;
    };
    filters?: {
        search?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        sort_field?: string;
        sort_direction?: string;
    };
}

export default function Rentals({ rentals, summary, filters }: Props) {
    const safeRentals = rentals || { data: [], current_page: 1, last_page: 1 };
    const safeSummary = summary || { total_rentals: 0, active_rentals: 0, completed_rentals: 0, total_amount: 0 };
    const safeFilters = filters || {};

    const [data, setData] = useState({
        search: safeFilters.search || '',
        status: safeFilters.status || '',
        start_date: safeFilters.start_date || '',
        end_date: safeFilters.end_date || '',
        sort_field: safeFilters.sort_field || 'created_at',
        sort_direction: safeFilters.sort_direction || 'desc',
    });

    const handleSearch = () => {
        const searchData = { ...data } as any;
        if (searchData.status === 'all') delete searchData.status;
        const params = new URLSearchParams(searchData as any).toString();
        window.location.href = `${route('reporting.modules.rentals')}?${params}`;
    };

    const columns = [
        {
            header: 'Rental Number',
            accessorKey: 'rental_number' as keyof RentalData,
        },
        {
            header: 'Customer',
            accessorKey: 'customer' as keyof RentalData,
            cell: (row: RentalData) => row.customer?.name || '',
        },
        {
            header: 'Start Date',
            accessorKey: 'start_date' as keyof RentalData,
        },
        {
            header: 'End Date',
            accessorKey: 'end_date' as keyof RentalData,
        },
        {
            header: 'Status',
            accessorKey: 'status' as keyof RentalData,
            cell: (row: RentalData) => (
                <span className={`capitalize ${row.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{row.status}</span>
            ),
        },
        {
            header: 'Items',
            accessorKey: 'items_count' as keyof RentalData,
        },
        {
            header: 'Total Amount',
            accessorKey: 'total_amount' as keyof RentalData,
            cell: (row: RentalData) => (
                <span>
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total_amount) || '0.00'}
                </span>
            ),
        },
    ];

    return (
        <AppLayout title="Rentals Report">
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
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeSummary.total_rentals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{safeSummary.active_rentals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Rentals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{safeSummary.completed_rentals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                $
                                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                                    safeSummary.total_amount,
                                ) || '0.00'}
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
                        <div className="mb-4 flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search rentals..."
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
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <DatePicker
                                    // @ts-ignore
                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                    onChange={(date: Date | null) =>
                                        setData((prev) => ({ ...prev, start_date: date ? date.toISOString().split('T')[0] : '' }))
                                    }
                                    placeholder="Start Date"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <DatePicker
                                    // @ts-ignore
                                    selected={data.end_date ? new Date(data.end_date) : undefined}
                                    onChange={(date: Date | null) =>
                                        setData((prev) => ({ ...prev, end_date: date ? date.toISOString().split('T')[0] : '' }))
                                    }
                                    placeholder="End Date"
                                />
                            </div>
                            <Button onClick={handleSearch}>Apply Filters</Button>
                        </div>

                        <DataTable columns={columns} data={safeRentals.data} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
