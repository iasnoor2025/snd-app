import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

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
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Available: 'text-green-600 dark:text-green-400',
    'In Use': 'text-blue-600 dark:text-blue-400',
};

const EquipmentWidget: React.FC<EquipmentWidgetProps> = ({ total, available, inUse, topEquipment, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Equipment"
        summary={
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-green-600 dark:text-green-400">Available:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{available}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-blue-600 dark:text-blue-400">In Use:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{inUse}</span>
                    </div>
                </div>
            </div>
        }
        onRemove={onRemove}
        className={className}
    />
);

export default EquipmentWidget;
export type { Equipment, EquipmentWidgetProps };
