import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DashboardWidgetCard from './DashboardWidgetCard';

interface VacationRequest {
  id: string;
  employee: string;
  status: 'Approved' | 'Pending';
  date: string;
}

interface VacationWidgetProps {
  total: number;
  approved: number;
  pending: number;
  recentRequests: VacationRequest[];
  className?: string;
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Approved: 'text-green-600 dark:text-green-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const VacationWidget: React.FC<VacationWidgetProps> = ({ total, approved, pending, recentRequests, className = '', onRemove }) => (
  <DashboardWidgetCard title="Vacations" summary={
    <>
      Total: <b>{total}</b>
      <span className="mx-2">&middot;</span>
      <span className="text-green-600 dark:text-green-400">Approved: <b>{approved}</b></span>
      <span className="mx-2">&middot;</span>
      <span className="text-yellow-600 dark:text-yellow-400">Pending: <b>{pending}</b></span>
    </>
  } onRemove={onRemove} className={className} />
);

export default VacationWidget;
export type { VacationWidgetProps, VacationRequest };
