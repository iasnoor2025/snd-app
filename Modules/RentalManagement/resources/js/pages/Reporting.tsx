import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from '@/Core';
import { BarChart3 } from 'lucide-react';

export default function RentalManagementReporting() {
  return (
    <AppLayout title="Reporting">
      <div className="container mx-auto py-12">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader className="flex flex-col items-center">
            <BarChart3 className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Reporting Moved</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              The reporting dashboard has moved. Please use the main reporting dashboard for all analytics and reports.
            </CardDescription>
            <a href="/reporting">
              <Button variant="default">Go to Reporting Dashboard</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
