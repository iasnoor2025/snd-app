import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DashboardWidgetCard from './DashboardWidgetCard';

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
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Passed: 'text-green-600 dark:text-green-400',
  Failed: 'text-red-600 dark:text-red-400',
};

const AuditWidget: React.FC<AuditWidgetProps> = ({ total, passed, failed, recentAudits, className = '', onRemove }) => (
  <DashboardWidgetCard title="Audits" summary={
    <div className="flex gap-4 mt-2 text-xs">
      <span>Total: <b>{total}</b></span>
      <span className="text-green-600 dark:text-green-400">Passed: <b>{passed}</b></span>
      <span className="text-red-600 dark:text-red-400">Failed: <b>{failed}</b></span>
    </div>
  } onRemove={onRemove} className={className} />
);

export default AuditWidget;
export type { AuditWidgetProps, Audit };
