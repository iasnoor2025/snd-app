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
      <>
        Total: <b>{total}</b>
        <span className="mx-2">&middot;</span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="mx-2">&middot;</span>
        <span className="text-red-600 dark:text-red-400">Inactive: <b>{inactive}</b></span>
      </>
    }
    onRemove={onRemove}
    className={className}
  />
);

export default EmployeeWidget;
export type { EmployeeWidgetProps, Employee };
