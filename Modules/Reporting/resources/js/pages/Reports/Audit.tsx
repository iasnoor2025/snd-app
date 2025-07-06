import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Core';
import { ShieldCheck } from 'lucide-react';

export default function AuditReport() {
  return (
    <AppLayout title="Audit & Compliance Report">
      <div className="container mx-auto py-12">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader className="flex flex-col items-center">
            <ShieldCheck className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Audit & Compliance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">A detailed audit and compliance analytics dashboard is coming soon.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
