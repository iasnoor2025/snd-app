import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Customer {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

interface CustomerWidgetProps {
  total: number;
  active: number;
  inactive: number;
  topCustomers: Customer[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Inactive: 'text-red-600 dark:text-red-400',
};

const CustomerWidget: React.FC<CustomerWidgetProps> = ({ total, active, inactive, topCustomers, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Customers</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="text-red-600 dark:text-red-400">Inactive: <b>{inactive}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {topCustomers.length === 0 ? (
          <li className="text-muted-foreground text-sm">No customers found.</li>
        ) : (
          topCustomers.map((cust) => (
            <li key={cust.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{cust.name}</span>
              <span className={`ml-2 ${statusColor[cust.status]}`}>{cust.status}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default CustomerWidget;
export type { CustomerWidgetProps, Customer };
