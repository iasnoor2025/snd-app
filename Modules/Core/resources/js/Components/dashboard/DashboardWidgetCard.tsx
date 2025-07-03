import React, { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/card';

interface DashboardWidgetCardProps {
  title: string;
  summary: ReactNode;
  onRemove?: () => void;
  className?: string;
}

const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = ({ title, summary, onRemove, className = '' }) => (
  <Card className={className + " p-2"}>
    <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
      <div>
        <CardTitle className="text-base mb-1">{title}</CardTitle>
        <div className="mt-0 text-xs leading-tight">{summary}</div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200"
          title="Remove Widget"
        >
          ×
        </button>
      )}
    </CardHeader>
    {/* CardContent intentionally omitted for now */}
  </Card>
);

export default DashboardWidgetCard;
