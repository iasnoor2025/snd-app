import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';

export default function AuditComplianceReports() {
  return (
    <AppLayout>
      <Head title="Audit & Compliance Reports" />
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <Link href="/reporting" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Audit & Compliance Reports</h1>
          <p className="text-muted-foreground mb-4">View and analyze audit and compliance data. More reports coming soon.</p>
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
