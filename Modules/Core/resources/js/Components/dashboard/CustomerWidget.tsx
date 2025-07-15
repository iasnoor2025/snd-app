import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Customer {
    id: string;
    name: string;
    status: 'Active' | 'Inactive';
}

interface CustomerWidgetProps {
    total: number;
    active: number;
    inactive: number;
    topCustomers: Customer[];
    className?: string;
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Active: 'text-green-600 dark:text-green-400',
    Inactive: 'text-red-600 dark:text-red-400',
};

const CustomerWidget: React.FC<CustomerWidgetProps> = ({ total, active, inactive, topCustomers, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Customers"
        summary={
            <>
                Total: <b>{total}</b>
                <span className="mx-2">&middot;</span>
                <span className="text-green-600 dark:text-green-400">
                    Active: <b>{active}</b>
                </span>
                <span className="mx-2">&middot;</span>
                <span className="text-red-600 dark:text-red-400">
                    Inactive: <b>{inactive}</b>
                </span>
            </>
        }
        className={className}
        onRemove={onRemove}
    />
);

export default CustomerWidget;
export type { Customer, CustomerWidgetProps };
