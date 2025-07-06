import { Head } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';

export default function AuditReport() {
  return (
    <AppLayout>
      <Head title="Audit Report" />
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <a href="/reporting" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </a>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Audit Report</h1>
          <p className="text-muted-foreground mb-4">View and analyze audit logs and compliance events. (Coming soon)</p>
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
