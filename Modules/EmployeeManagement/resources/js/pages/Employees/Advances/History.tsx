import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
// Minimal type definitions for build
type PageProps = { [key: string]: any };
type BreadcrumbItem = { title: string; href: string };
import AdminLayout from '../../../layouts/AdminLayout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PaymentHistory from '../../../../../../Payroll/resources/js/components/advances/PaymentHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  notes: string;
  recorded_by: string;
  advance_payment_id: number;
}

interface MonthlyHistoryItem {
  month: string;
  total_amount: number;
  payments: Payment[];
}

interface Props extends PageProps {
  employee: Employee;
  monthlyHistory: MonthlyHistoryItem[];
  totalRepaid: number;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function History({ employee, monthlyHistory, totalRepaid, pagination }: Props) {
  const { t } = useTranslation('employee');

  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Employees',
      href: '/employees',
    },
    {
      title: 'Employee Details',
      href: `/employees/${employee.id}`,
    },
    {
      title: 'Payment History',
      href: `/employees/${employee.id}/advances/history`,
    },
  ];

  return (
    <AdminLayout title={t('payment_history')} breadcrumbs={breadcrumbs} requiredPermission="employees.view">
      <Head title={t('payment_history')} />

      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('payment_history')}
            </h1>
            <p className="text-muted-foreground">
              {employee.first_name} {employee.last_name} • ID: {employee.employee_id}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.visit(`/employees/${employee.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employee
          </Button>
        </div>

        <Card>
          {/* <CardHeader>
            <CardTitle>{t('payment_history')}</CardTitle>
            <CardDescription>{t('track_and_manage_employee_advance_payments_and_ded')}</CardDescription>
          </CardHeader> */}
          <CardContent>
            <PaymentHistory
              employeeId={employee.id}
              initialMonthlyHistory={monthlyHistory}
              initialTotalRepaid={totalRepaid}
              initialPagination={pagination}
              showOnlyLast={false}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
