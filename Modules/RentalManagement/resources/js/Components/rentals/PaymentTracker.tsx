import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Progress } from "@/Core";
import { PaymentForm } from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/Core";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  Download,
  Send,
  Plus
} from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Payment {
  id: number;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  reference: string;
  notes?: string;
}

interface PaymentTrackerProps {
  rental: {
    id: number;
    total_amount: number;
    deposit_amount?: number;
    payment_terms_days?: number;
    payment_due_date?: string;
    status: string;
    start_date: string;
    expected_end_date: string;
    actual_end_date?: string;
  };
  payments: Payment[];
  onAddPayment?: (payment: Omit<Payment, 'id'>) => void;
  onSendReminder?: () => void;
  onGenerateInvoice?: () => void;
}

export default function PaymentTracker({
  rental,
  payments,
  onAddPayment,
  onSendReminder,
  onGenerateInvoice
}: PaymentTrackerProps) {
  const { t } = useTranslation('rental');

  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  // Calculate payment metrics
  const calculatePaymentMetrics = () => {
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const failedPayments = payments.filter(p => p.status === 'failed');

    const remainingAmount = rental.total_amount - totalPaid;
    const paymentProgress = (totalPaid / rental.total_amount) * 100;

    const isOverdue = rental.payment_due_date ? isAfter(new Date(), new Date(rental.payment_due_date)) : false;
    const daysOverdue = isOverdue && rental.payment_due_date ? differenceInDays(new Date(), new Date(rental.payment_due_date)) : 0;

    return {
      totalPaid,
      remainingAmount,
      paymentProgress,
      pendingPayments,
      failedPayments,
      isOverdue,
      daysOverdue
    };
  };

  const metrics = calculatePaymentMetrics();

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  };

  const handleFormSubmit = (data: any) => {
    if (data.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAddPayment?.(data);
  };

  return (
    <div className="space-y-4">
      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('th_total_amount')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(rental.total_amount)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Progress value={metrics.paymentProgress} className="h-1 w-full mr-2" />
              {Math.round(metrics.paymentProgress)}% paid
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('ttl_remaining_balance')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.remainingAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.pendingPayments.length} pending payments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payment_status')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {rental.payment_due_date ? format(new Date(rental.payment_due_date), "MMM dd") : "N/A"}
              </div>
              {metrics.isOverdue ? (
                <Badge variant="destructive" className="animate-pulse">
                  {metrics.daysOverdue} days overdue
                </Badge>
              ) : (
                <Badge variant="outline">
                  {rental.payment_due_date ? differenceInDays(new Date(rental.payment_due_date), new Date()) : 'N/A'} days left
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Alerts */}
      {metrics.isOverdue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_payment_overdue')}</AlertTitle>
          <AlertDescription>
            This rental is {metrics.daysOverdue} days overdue. Please take action immediately.
          </AlertDescription>
        </Alert>
      )}

      {metrics.failedPayments.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_failed_payments')}</AlertTitle>
          <AlertDescription>
            There are {metrics.failedPayments.length} failed payment attempts. Please review and retry.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('add_payment')}
        </Button>
        <Button variant="outline" onClick={onSendReminder}>
          <Send className="h-4 w-4 mr-2" />
          Send Reminder
        </Button>
        <Button variant="outline" onClick={onGenerateInvoice}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('ttl_payment_history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No payments recorded
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/payments/${payment.id}/receipt`} target="_blank" rel="noopener noreferrer">
                          <Receipt className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <PaymentForm
        isOpen={isAddPaymentDialogOpen}
        onClose={() => setIsAddPaymentDialogOpen(false)}
        onSubmit={handleFormSubmit}
        type="rental"
        rental={{
          id: rental.id,
          total_amount: rental.total_amount,
          remaining_balance: metrics.remainingAmount
        }}
      />
    </div>
  );
}















