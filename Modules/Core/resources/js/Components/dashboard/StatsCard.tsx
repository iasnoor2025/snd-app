import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className = '' }) => (
  <Card className={`flex flex-col justify-between ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label}
      </CardTitle>
      {trend && <span className="text-xs text-green-600 dark:text-green-400">{trend}</span>}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default StatsCard;
