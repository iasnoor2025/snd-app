import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

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
}

const statusColor: Record<string, string> = {
  Processed: 'text-green-600 dark:text-green-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const PayrollWidget: React.FC<PayrollWidgetProps> = ({ total, processed, pending, recentPayrolls, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Payrolls</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Processed: <b>{processed}</b></span>
        <span className="text-yellow-600 dark:text-yellow-400">Pending: <b>{pending}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {recentPayrolls.length === 0 ? (
          <li className="text-muted-foreground text-sm">No payrolls found.</li>
        ) : (
          recentPayrolls.map((pay) => (
            <li key={pay.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{pay.employee}</span>
              <span className={`ml-2 ${statusColor[pay.status]}`}>{pay.status}</span>
              <span className="ml-2">{pay.amount}</span>
              <span className="ml-4 text-xs text-muted-foreground">{pay.date}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default PayrollWidget;
export type { PayrollWidgetProps, Payroll };
