import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function DataRetentionEdit() {
    return (
        <AppLayout>
            <Head title="Edit Data Retention Policy" />
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
                    <h1 className="mb-2 text-2xl font-bold">Edit Data Retention Policy</h1>
                    <p className="mb-4 text-muted-foreground">This page will allow editing of data retention policies. (Coming soon)</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No form available yet.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
