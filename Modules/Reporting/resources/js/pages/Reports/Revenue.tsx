import { Head } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';

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
          <a href="/reporting" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </a>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Revenue Report</h1>
          <p className="text-muted-foreground mb-4">View and analyze revenue data and trends for the last 6 months.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue (Top 10 Customers)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {topCustomers.map((customer, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{customer.name}</td>
                        <td className="px-4 py-2">${Number(customer.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
