import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardHeader, CardTitle, CardContent } from '@/Core';
import { Button } from '@/Core';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Users,
  Briefcase,
  CalendarCheck,
  FileText,
  DollarSign,
  ClipboardList,
  ShieldCheck,
  Layers,
  TrendingUp,
  Wrench,
} from 'lucide-react';

const modules = [
  {
    key: 'rentals',
    name: 'Rentals',
    count: 120,
    path: '/reporting/rentals',
    tKey: 'modules:rentals',
    icon: <Briefcase className="h-7 w-7 text-primary" />,
  },
  {
    key: 'equipment',
    name: 'Equipment',
    count: 80,
    path: '/reporting/equipment',
    tKey: 'modules:equipment',
    icon: <Layers className="h-7 w-7 text-primary" />,
  },
  {
    key: 'payroll',
    name: 'Payroll',
    count: 45,
    path: '/reporting/payroll',
    tKey: 'modules:payroll',
    icon: <DollarSign className="h-7 w-7 text-primary" />,
  },
  {
    key: 'timesheets',
    name: 'Timesheets',
    count: 210,
    path: '/reporting/timesheets',
    tKey: 'modules:timesheets',
    icon: <ClipboardList className="h-7 w-7 text-primary" />,
  },
  {
    key: 'projects',
    name: 'Projects',
    count: 32,
    path: '/reporting/projects',
    tKey: 'modules:projects',
    icon: <FileText className="h-7 w-7 text-primary" />,
  },
  {
    key: 'leaves',
    name: 'Leaves',
    count: 67,
    path: '/reporting/leaves',
    tKey: 'modules:leaves',
    icon: <CalendarCheck className="h-7 w-7 text-primary" />,
  },
  {
    key: 'customers',
    name: 'Customers',
    count: 150,
    path: '/reporting/customers',
    tKey: 'modules:customers',
    icon: <Users className="h-7 w-7 text-primary" />,
  },
  {
    key: 'audit',
    name: 'Audit & Compliance',
    count: 12,
    path: '/reporting/audit',
    tKey: 'modules:audit',
    icon: <ShieldCheck className="h-7 w-7 text-primary" />,
  },
  {
    key: 'revenue',
    name: 'Revenue',
    count: 485000,
    path: '/reporting/revenue',
    tKey: 'modules:revenue',
    isCurrency: true,
    icon: <TrendingUp className="h-7 w-7 text-primary" />,
  },
  {
    key: 'builder',
    name: 'Custom Report Builder',
    count: '',
    path: '/reporting/builder',
    tKey: 'modules:builder',
    icon: <Wrench className="h-7 w-7 text-primary" />,
  },
];

export default function ReportsIndex() {
  const { t } = useTranslation('reporting');
  return (
    <AppLayout title={t('main_dashboard')}>
      <div className="min-h-screen bg-gradient-to-br from-muted/50 to-white dark:from-background dark:to-muted/40 py-12">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-primary tracking-tight drop-shadow-sm">
            {t('main_dashboard')}
          </h1>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <a
                key={mod.key}
                href={mod.path}
                className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-xl"
                tabIndex={0}
                aria-label={t(mod.tKey, mod.name)}
              >
                <Card className="transition-shadow hover:shadow-xl hover:scale-[1.025] border-0 bg-white/90 dark:bg-muted/80 shadow-md rounded-xl cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                      {mod.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary-700 transition-colors">
                      {t(mod.tKey, mod.name)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-2 pt-0 pb-6">
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {mod.isCurrency ? `$${mod.count.toLocaleString()}` : mod.count}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2 group-hover:bg-primary group-hover:text-white transition-colors pointer-events-none opacity-90"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {t('modules:view_report')}
                    </Button>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}














