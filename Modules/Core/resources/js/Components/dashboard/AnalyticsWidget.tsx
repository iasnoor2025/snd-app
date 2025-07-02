import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Report {
  id: string;
  name: string;
  status: 'Active' | 'Archived';
  date: string;
}

interface AnalyticsWidgetProps {
  total: number;
  active: number;
  archived: number;
  recentReports: Report[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Archived: 'text-gray-500 dark:text-gray-400',
};

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ total, active, archived, recentReports, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="text-gray-500 dark:text-gray-400">Archived: <b>{archived}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {recentReports.length === 0 ? (
          <li className="text-muted-foreground text-sm">No reports found.</li>
        ) : (
          recentReports.map((rep) => (
            <li key={rep.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{rep.name}</span>
              <span className={`ml-2 ${statusColor[rep.status]}`}>{rep.status}</span>
              <span className="ml-4 text-xs text-muted-foreground">{rep.date}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default AnalyticsWidget;
export type { AnalyticsWidgetProps, Report };
