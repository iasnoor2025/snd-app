import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Equipment {
  id: string;
  name: string;
  status: 'Available' | 'In Use';
}

interface EquipmentWidgetProps {
  total: number;
  available: number;
  inUse: number;
  topEquipment: Equipment[];
  className?: string;
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Available: 'text-green-600 dark:text-green-400',
  'In Use': 'text-blue-600 dark:text-blue-400',
};

const EquipmentWidget: React.FC<EquipmentWidgetProps> = ({ total, available, inUse, topEquipment, className = '', onRemove }) => (
  <DashboardWidgetCard title="Equipment" summary={
    <div className="flex gap-4 mt-2 text-xs">
      <span>Total: <b>{total}</b></span>
      <span className="text-green-600 dark:text-green-400">Available: <b>{available}</b></span>
      <span className="text-blue-600 dark:text-blue-400">In Use: <b>{inUse}</b></span>
    </div>
  } onRemove={onRemove} className={className} />
);

export default EquipmentWidget;
export type { EquipmentWidgetProps, Equipment };
