import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent } from '@/Core';

interface Props {
  employee: { id: number; first_name?: string; last_name?: string };
  assignment: { id: number; name?: string };
}

export default function EditAssignment({ employee, assignment }: Props) {
  return (
    <AppLayout title={`Edit Assignment #${assignment.id}`} requiredPermission="employees.edit">
      <Head title={`Edit Assignment #${assignment.id}`} />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <strong>Employee:</strong> {employee.first_name} {employee.last_name} (ID: {employee.id})
            </div>
            <div className="mb-4">
              <strong>Assignment:</strong> {assignment.name || '-'} (ID: {assignment.id})
            </div>
            <div className="text-muted-foreground">Assignment edit form will be implemented here.</div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
