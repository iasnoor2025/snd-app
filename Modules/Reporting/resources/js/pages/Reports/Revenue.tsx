import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Core';
import { TrendingUp } from 'lucide-react';

export default function RevenueReport() {
  return (
    <AppLayout title="Revenue Report">
      <div className="container mx-auto py-12">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader className="flex flex-col items-center">
            <TrendingUp className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Revenue Report</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">A detailed revenue analytics and reporting dashboard is coming soon.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
