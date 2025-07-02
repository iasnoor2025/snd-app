import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Audit {
  id: string;
  name: string;
  status: 'Passed' | 'Failed';
  date: string;
}

interface AuditWidgetProps {
  total: number;
  passed: number;
  failed: number;
  recentAudits: Audit[];
  className?: string;
}

const statusColor: Record<string, string> = {
  Passed: 'text-green-600 dark:text-green-400',
  Failed: 'text-red-600 dark:text-red-400',
};

const AuditWidget: React.FC<AuditWidgetProps> = ({ total, passed, failed, recentAudits, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Audits</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Passed: <b>{passed}</b></span>
        <span className="text-red-600 dark:text-red-400">Failed: <b>{failed}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {recentAudits.length === 0 ? (
          <li className="text-muted-foreground text-sm">No audits found.</li>
        ) : (
          recentAudits.map((audit) => (
            <li key={audit.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{audit.name}</span>
              <span className={`ml-2 ${statusColor[audit.status]}`}>{audit.status}</span>
              <span className="ml-4 text-xs text-muted-foreground">{audit.date}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default AuditWidget;
export type { AuditWidgetProps, Audit };
