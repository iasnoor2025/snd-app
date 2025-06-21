import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/Modules/EmployeeManagement/resources/js/types';
import { AppLayout } from '@/Core';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
import { Button } from "@/Core";
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ToastService } from "@/Core";

interface User {
  id: number;
  name: string;
}

interface Advance {
  id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at: string;
  payment_date: string;
  rejection_reason?: string;
  repayment_date?: string;
  monthly_deduction?: number;
  approver?: User;
  rejecter?: User;
  approved_at?: string;
  rejected_at?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface Props extends PageProps {
  employee: Employee;
  advance: Advance;
}

export default function Edit({ auth, employee, advance }: Props) {
  const { t } = useTranslation('employee');

  const [amount, setAmount] = useState(advance.amount.toString());
  const [reason, setReason] = useState(advance.reason || '');
  const [paymentDate, setPaymentDate] = useState(
    advance.payment_date ? format(new Date(advance.payment_date), 'yyyy-MM-dd') : ''
  );
  const [monthlyDeduction, setMonthlyDeduction] = useState(
    advance.monthly_deduction?.toString() || ''
  );
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
      title: 'Edit Advance',
      href: `/employees/${employee.id}/advances/${advance.id}/edit`,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.patch(
      route('advances.update', { employee: employee.id, advance: advance.id }),
      {
        amount: parseFloat(amount),
        reason,
        payment_date: paymentDate,
        monthly_deduction: monthlyDeduction ? parseFloat(monthlyDeduction) : null,
      },
      {
        onSuccess: () => {
          ToastService.success('Advance payment updated successfully');
          router.visit(`/employees/${employee.id}/advances`);
        },
        onError: (errors) => {
          setIsSubmitting(false);
          ToastService.error(errors?.message || 'Failed to update advance payment');
        },
      }
    );
  };

  return (
    <AppLayout title={t('ttl_edit_advance_payment')} breadcrumbs={breadcrumbs} requiredPermission="employees.edit">
      <Head title={t('ttl_edit_advance_payment')} />

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
            <CardTitle>{t('ttl_edit_advance_payment')}</CardTitle>
            <CardDescription>
              Update the details of the advance payment for {employee.first_name} {employee.last_name}
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
                    onChange={(e) => setAmount(e.target.value)}
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
                    onChange={(e) => setMonthlyDeduction(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The monthly amount to deduct from the employee's salary
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
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

















