import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/Core';
import { Button } from '@/Core';
import { useTranslation } from 'react-i18next';

const modules = [
  {
    key: 'payroll',
    name: 'Payroll Management',
    path: '/payroll/reports',
    exists: true,
  },
  {
    key: 'equipment',
    name: 'Equipment Management',
    path: '/equipment/analytics/dashboard',
    exists: true,
  },
  {
    key: 'timesheet',
    name: 'Timesheet Management',
    path: '/timesheet/reports',
    exists: true,
  },
  {
    key: 'leave',
    name: 'Leave Management',
    path: '/leave/reports',
    exists: true,
  },
  {
    key: 'audit',
    name: 'Audit & Compliance',
    path: '/audit-compliance/reports',
    exists: true,
  },
  {
    key: 'project',
    name: 'Project Management',
    path: '/projects/reports',
    exists: true,
  },
  {
    key: 'rental',
    name: 'Rental Management',
    path: '/rental-management/reporting',
    exists: true,
  },
  {
    key: 'customer',
    name: 'Customer Management',
    path: '/customers/reports',
    exists: false,
  },
];

export default function ModulesReports() {
  const { t } = useTranslation('reporting');
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">{t('modules:all_module_reports')}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Card key={mod.key}>
            <CardHeader>
              <CardTitle>{mod.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {mod.exists ? (
                <Button asChild>
                  <a href={mod.path}>{t('modules:view_report')}</a>
                </Button>
              ) : (
                <CardDescription>{t('modules:coming_soon')}</CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
