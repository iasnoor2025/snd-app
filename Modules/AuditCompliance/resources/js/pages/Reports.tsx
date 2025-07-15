import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function AuditComplianceReports() {
    return (
        <AppLayout>
            <Head title="Audit & Compliance Reports" />
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <Link
                        href="/reporting"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </Link>
                </div>
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold">Audit & Compliance Reports</h1>
                    <p className="mb-4 text-muted-foreground">View and analyze audit and compliance data. More reports coming soon.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Placeholder for future report cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Retention Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming soon: View data retention and compliance status.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
