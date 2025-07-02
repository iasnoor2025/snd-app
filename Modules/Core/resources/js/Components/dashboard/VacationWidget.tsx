import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

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
}

const statusColor: Record<string, string> = {
  Approved: 'text-green-600 dark:text-green-400',
  Pending: 'text-yellow-600 dark:text-yellow-400',
};

const VacationWidget: React.FC<VacationWidgetProps> = ({ total, approved, pending, recentRequests, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Vacations</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Approved: <b>{approved}</b></span>
        <span className="text-yellow-600 dark:text-yellow-400">Pending: <b>{pending}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {recentRequests.length === 0 ? (
          <li className="text-muted-foreground text-sm">No vacation requests found.</li>
        ) : (
          recentRequests.map((req) => (
            <li key={req.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{req.employee}</span>
              <span className={`ml-2 ${statusColor[req.status]}`}>{req.status}</span>
              <span className="ml-4 text-xs text-muted-foreground">{req.date}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default VacationWidget;
export type { VacationWidgetProps, VacationRequest };
