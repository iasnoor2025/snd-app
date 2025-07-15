import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Payroll {
    id: string;
    employee: string;
    status: 'Processed' | 'Pending';
    amount: string;
    date: string;
}

interface PayrollWidgetProps {
    total: number;
    processed: number;
    pending: number;
    recentPayrolls: Payroll[];
    className?: string;
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Processed: 'text-green-600 dark:text-green-400',
    Pending: 'text-yellow-600 dark:text-yellow-400',
};

const PayrollWidget: React.FC<PayrollWidgetProps> = ({ total, processed, pending, recentPayrolls, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Payrolls"
        summary={
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-green-600 dark:text-green-400">Processed:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{processed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-600 dark:text-yellow-400">Pending:</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{pending}</span>
                    </div>
                </div>
            </div>
        }
        onRemove={onRemove}
        className={className}
    />
);

export default PayrollWidget;
export type { Payroll, PayrollWidgetProps };
