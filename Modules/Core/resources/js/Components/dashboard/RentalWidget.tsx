import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DashboardWidgetCard from './DashboardWidgetCard';

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
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Overdue: 'text-yellow-600 dark:text-yellow-400',
};

const RentalWidget: React.FC<RentalWidgetProps> = ({ total, active, overdue, topRentals, className = '', onRemove }) => (
  <DashboardWidgetCard title="Rentals" summary={
    <>
      Total: <b>{total}</b>
      <span className="mx-2">&middot;</span>
      <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
      <span className="mx-2">&middot;</span>
      <span className="text-yellow-600 dark:text-yellow-400">Overdue: <b>{overdue}</b></span>
    </>
  } onRemove={onRemove} className={className} />
);

export default RentalWidget;
export type { RentalWidgetProps, RentalItem };
