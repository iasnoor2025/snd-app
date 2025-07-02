import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

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
}

const statusColor: Record<string, string> = {
  Active: 'text-green-600 dark:text-green-400',
  Inactive: 'text-red-600 dark:text-red-400',
};

const EmployeeWidget: React.FC<EmployeeWidgetProps> = ({ total, active, inactive, topEmployees, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Employees</CardTitle>
      <div className="flex gap-4 mt-2 text-xs">
        <span>Total: <b>{total}</b></span>
        <span className="text-green-600 dark:text-green-400">Active: <b>{active}</b></span>
        <span className="text-red-600 dark:text-red-400">Inactive: <b>{inactive}</b></span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {topEmployees.length === 0 ? (
          <li className="text-muted-foreground text-sm">No employees found.</li>
        ) : (
          topEmployees.map((emp) => (
            <li key={emp.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{emp.name}</span>
              <span className={`ml-2 ${statusColor[emp.status]}`}>{emp.status}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default EmployeeWidget;
export type { EmployeeWidgetProps, Employee };
