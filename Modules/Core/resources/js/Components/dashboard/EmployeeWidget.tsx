import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Employee {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

interface EmployeeWidgetProps {
  total: number;
  active: number;
  inactive: number;
  topEmployees: Employee[];
  className?: string;
  onRemove: () => void;
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Inactive: 'text-red-600 dark:text-red-400',
};

const EmployeeWidget: React.FC<EmployeeWidgetProps> = ({ total, active, inactive, topEmployees, className = '', onRemove }) => (
  <DashboardWidgetCard
    title="Employees"
    summary={
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Total:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400">Active:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{active}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-600 dark:text-red-400">Inactive:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{inactive}</span>
          </div>
        </div>
      </div>
    }
    onRemove={onRemove}
    className={className}
  />
);

export default EmployeeWidget;
export type { EmployeeWidgetProps, Employee };
