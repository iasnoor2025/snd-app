import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Payroll {
  id: string;
  employee: string;
  status: 'Processed' | 'Pending';
  amount: string;
  date: string;
}

interface PayrollWidgetProps {
  total: number;
  processed: number;
  pending: number;
  recentPayrolls: Payroll[];
  className?: string;
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Processed: 'text-green-600 dark:text-green-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const PayrollWidget: React.FC<PayrollWidgetProps> = ({ total, processed, pending, recentPayrolls, className = '', onRemove }) => (
  <DashboardWidgetCard title="Payrolls" summary={
    <div className="flex gap-4 mt-2 text-xs">
      <span>Total: <b>{total}</b></span>
      <span className="text-green-600 dark:text-green-400">Processed: <b>{processed}</b></span>
      <span className="text-yellow-600 dark:text-yellow-400">Pending: <b>{pending}</b></span>
    </div>
  } onRemove={onRemove} className={className} />
);

export default PayrollWidget;
export type { PayrollWidgetProps, Payroll };
