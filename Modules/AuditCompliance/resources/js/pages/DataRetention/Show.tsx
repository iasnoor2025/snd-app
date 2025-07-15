import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function DataRetentionShow() {
    return (
        <AppLayout>
            <Head title="Data Retention Report" />
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <Link
                        href="/audit-compliance/reports"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Audit & Compliance Reports
                    </Link>
                </div>
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold">Data Retention Report</h1>
                    <p className="mb-4 text-muted-foreground">This page will display data retention and compliance status. (Coming soon)</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Retention Policy Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No data available yet.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
