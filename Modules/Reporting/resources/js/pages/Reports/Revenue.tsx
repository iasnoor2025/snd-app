import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface TopCustomer {
    name: string;
    total: number;
}

interface RevenueReportProps {
    topCustomers: TopCustomer[];
}

export default function RevenueReport({ topCustomers = [] }: RevenueReportProps) {
    const totalRevenue = topCustomers.reduce((sum, c) => sum + Number(c.total), 0);

    return (
        <AppLayout>
            <Head title="Revenue Report" />
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <a
                        href="/reporting"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </a>
                </div>
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold">Revenue Report</h1>
                    <p className="mb-4 text-muted-foreground">View and analyze revenue data and trends for the last 6 months.</p>
                </div>
                <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Revenue (Top 10 Customers)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers by Revenue (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCustomers.length === 0 ? (
                            <p className="text-muted-foreground">No revenue data available.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Customer</th>
                                            <th className="px-4 py-2 text-left">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                        {topCustomers.map((customer, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2">{customer.name}</td>
                                                <td className="px-4 py-2">
                                                    $
                                                    {Number(customer.total).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
