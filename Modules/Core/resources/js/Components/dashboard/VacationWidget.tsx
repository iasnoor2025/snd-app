import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface VacationRequest {
    id: string;
    employee: string;
    status: 'Approved' | 'Pending';
    date: string;
}

interface VacationWidgetProps {
    total: number;
    approved: number;
    pending: number;
    recentRequests: VacationRequest[];
    className?: string;
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Approved: 'text-green-600 dark:text-green-400',
    Pending: 'text-yellow-600 dark:text-yellow-400',
};

const VacationWidget: React.FC<VacationWidgetProps> = ({ total, approved, pending, recentRequests, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Vacations"
        summary={
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-green-600 dark:text-green-400">Approved:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{approved}</span>
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

export default VacationWidget;
export type { VacationRequest, VacationWidgetProps };
