import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface RentalItem {
  id: string;
  name: string;
  status: 'Active' | 'Overdue';
}

interface RentalWidgetProps {
  total: number;
  active: number;
  overdue: number;
  topRentals: RentalItem[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Overdue: 'text-yellow-600 dark:text-yellow-400',
};

const RentalWidget: React.FC<RentalWidgetProps> = ({ total, active, overdue, topRentals, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Rentals</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="text-yellow-600 dark:text-yellow-400">Overdue: <b>{overdue}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {topRentals.length === 0 ? (
          <li className="text-muted-foreground text-sm">No rentals found.</li>
        ) : (
          topRentals.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{item.name}</span>
              <span className={`ml-2 ${statusColor[item.status]}`}>{item.status}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default RentalWidget;
export type { RentalWidgetProps, RentalItem };
