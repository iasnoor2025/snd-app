import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

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
}

const statusColor: Record<string, string> = {
  Available: 'text-green-600 dark:text-green-400',
  'In Use': 'text-blue-600 dark:text-blue-400',
};

const EquipmentWidget: React.FC<EquipmentWidgetProps> = ({ total, available, inUse, topEquipment, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Equipment</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Available: <b>{available}</b></span>
        <span className="text-blue-600 dark:text-blue-400">In Use: <b>{inUse}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {topEquipment.length === 0 ? (
          <li className="text-muted-foreground text-sm">No equipment found.</li>
        ) : (
          topEquipment.map((eq) => (
            <li key={eq.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{eq.name}</span>
              <span className={`ml-2 ${statusColor[eq.status]}`}>{eq.status}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default EquipmentWidget;
export type { EquipmentWidgetProps, Equipment };
