import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';

export default function AuditComplianceReport() {
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
          <p className="text-muted-foreground mb-4">View and analyze audit and compliance data across modules.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/audit-compliance/reports/data-retention/show" className="block">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Data Retention Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View data retention and compliance status.</p>
              </CardContent>
            </Card>
          </Link>
          {/* Add more Audit & Compliance report cards here as needed */}
        </div>
      </div>
    </AppLayout>
  );
}
