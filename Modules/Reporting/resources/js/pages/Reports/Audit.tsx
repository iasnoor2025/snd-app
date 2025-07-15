import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function AuditReport() {
    return (
        <AppLayout>
            <Head title="Audit Report" />
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
                    <h1 className="mb-2 text-2xl font-bold">Audit Report</h1>
                    <p className="mb-4 text-muted-foreground">View and analyze audit logs and compliance events. (Coming soon)</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Placeholder for future audit analytics cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Log Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">No audit data available yet.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
