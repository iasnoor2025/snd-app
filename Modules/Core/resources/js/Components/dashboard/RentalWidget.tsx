import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface RentalItem {
    id: string;
    name: string;
    status: 'Active' | 'Overdue';
}

interface RentalWidgetProps {
    total: number;
    active: number;
    overdue: number;
    topRentals: RentalItem[];
    className?: string;
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Active: 'text-green-600 dark:text-green-400',
    Overdue: 'text-yellow-600 dark:text-yellow-400',
};

const RentalWidget: React.FC<RentalWidgetProps> = ({ total, active, overdue, topRentals, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Rentals"
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
                        <span className="text-yellow-600 dark:text-yellow-400">Overdue:</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{overdue}</span>
                    </div>
                </div>
            </div>
        }
        onRemove={onRemove}
        className={className}
    />
);

export default RentalWidget;
export type { RentalItem, RentalWidgetProps };
