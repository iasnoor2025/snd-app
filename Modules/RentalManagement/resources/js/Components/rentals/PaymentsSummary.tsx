import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Progress } from "@/Core";
import { PaymentStatusBadge } from "@/Core";
import { CreditCard, DollarSign, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/Core";
import { format, differenceInDays, isAfter } from "date-fns";

interface PaymentsSummaryProps {
  rental: {
    id: number;
    total_amount: number;
    total_paid?: number;
    remaining_balance?: number;
    payment_progress?: number;
    payment_status?: 'unpaid' | 'partial' | 'paid' | 'overdue';
    payment_due_date?: string;
  };
  showDetails?: boolean;
}

export default function PaymentsSummary({ rental, showDetails = true }: PaymentsSummaryProps) {
  const { t } = useTranslation('rental');

  const paymentProgress = rental.payment_progress || 0;
  const isOverdue = rental.payment_due_date && isAfter(new Date(), new Date(rental.payment_due_date));
  const daysOverdue = isOverdue ? differenceInDays(new Date(), new Date(rental.payment_due_date as string)) : 0;
  const daysLeft = rental.payment_due_date ?
    differenceInDays(new Date(rental.payment_due_date), new Date()) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('financial_summary')}</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('th_total_amount')}</span>
            <span className="text-xl font-bold">{formatCurrency(rental.total_amount)}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('amount_paid')}</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(rental.total_paid || 0)}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Balance</span>
            <span className={`text-xl font-bold ${((rental.remaining_balance ?? 0) > 0) ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(rental.remaining_balance ?? rental.total_amount)}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('payment_status')}</span>
            <div>
              <PaymentStatusBadge status={rental.payment_status || 'unpaid'} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{t('payment_progress')}</span>
            <span>{Math.round(paymentProgress)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-2" />
        </div>

        {rental.payment_due_date && (
          <div className="mt-4 p-3 rounded-md bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">Payment Due:</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">{format(new Date(rental.payment_due_date), "MMM dd, yyyy")}</span>
              {isOverdue ? (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                </span>
              ) : (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                </span>
              )}
            </div>
          </div>
        )}

        {showDetails && (
          <div className="mt-4">
            <Button asChild className="w-full" variant="outline">
              <Link href={route('rentals.payments.index', rental.id)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Payments
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}














