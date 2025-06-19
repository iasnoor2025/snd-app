import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/Modules/EmployeeManagement/Resources/js/types';
import { AdminLayout } from '@/Modules/Core/resources/js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Modules/Core/resources/js/components/ui/card';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { ToastService } from '@/Modules/Core/resources/js/components/shared/ToastManager';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface Props extends PageProps {
  employee: Employee;
}

export default function Create({ auth, employee }: Props) {
  const { t } = useTranslation('employee');

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [monthlyDeduction, setMonthlyDeduction] = useState('');
  const [estimatedMonths, setEstimatedMonths] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Employees',
      href: '/employees',
    },
    {
      title: `${employee.first_name} ${employee.last_name}`,
      href: `/employees/${employee.id}`,
    },
    {
      title: 'Advances',
      href: `/employees/${employee.id}/advances`,
    },
    {
      title: 'Create Advance',
      href: `/employees/${employee.id}/advances/create`,
    },
  ];

  const calculateEstimatedMonths = () => {
    const amountValue = parseFloat(amount);
    const deductionValue = parseFloat(monthlyDeduction);

    if (amountValue > 0 && deductionValue > 0) {
      const estimated = Math.ceil(amountValue / deductionValue);
      setEstimatedMonths(estimated.toString());
    } else {
      setEstimatedMonths('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.post(
      route('advances.store', { employee: employee.id }),
      {
        amount: parseFloat(amount),
        reason,
        payment_date: paymentDate,
        monthly_deduction: parseFloat(monthlyDeduction),
        estimated_months: parseInt(estimatedMonths) || 1,
      },
      {
        onSuccess: () => {
          ToastService.success('Advance payment request created successfully');
          router.visit(`/employees/${employee.id}/advances`);
        },
        onError: (errors) => {
          setIsSubmitting(false);
          ToastService.error(errors?.message || 'Failed to create advance payment request');
        },
      }
    );
  };

  return (
    <AdminLayout title={t('ttl_create_advance_payment')} breadcrumbs={breadcrumbs} requiredPermission="employees.edit">
      <Head title={t('ttl_create_advance_payment')} />

      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.visit(`/employees/${employee.id}/advances`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Advances
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_create_advance_payment')}</CardTitle>
            <CardDescription>
              Create a new advance payment request for {employee.first_name} {employee.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (SAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      calculateEstimatedMonths();
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-date">{t('lbl_payment_date')}</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-deduction">Monthly Deduction (SAR)</Label>
                  <Input
                    id="monthly-deduction"
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyDeduction}
                    onChange={(e) => {
                      setMonthlyDeduction(e.target.value);
                      calculateEstimatedMonths();
                    }}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The monthly amount to deduct from the employee's salary
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated-months">Estimated Repayment (Months)</Label>
                  <Input
                    id="estimated-months"
                    type="number"
                    min="1"
                    value={estimatedMonths}
                    onChange={(e) => setEstimatedMonths(e.target.value)}
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground">
                    Calculated based on amount and monthly deduction
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit(`/employees/${employee.id}/advances`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

















