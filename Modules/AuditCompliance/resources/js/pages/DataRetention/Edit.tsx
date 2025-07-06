import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';

export default function DataRetentionEdit() {
  return (
    <AppLayout>
      <Head title="Edit Data Retention Policy" />
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <Link href="/audit-compliance/reports" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Audit & Compliance Reports
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Edit Data Retention Policy</h1>
          <p className="text-muted-foreground mb-4">This page will allow editing of data retention policies. (Coming soon)</p>
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
