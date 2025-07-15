import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface Report {
    id: string;
    name: string;
    status: 'Active' | 'Archived';
    date: string;
}

interface AnalyticsWidgetProps {
    total: number;
    active: number;
    archived: number;
    recentReports: Report[];
    className?: string;
    onRemove: () => void;
}

const statusColor: Record<string, string> = {
    Active: 'text-green-600 dark:text-green-400',
    Archived: 'text-gray-500 dark:text-gray-400',
};

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ total, active, archived, recentReports, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Analytics"
        summary={
            <>
                Total: <b>{total}</b>
                <span className="mx-2">&middot;</span>
                <span className="text-green-600 dark:text-green-400">
                    Active: <b>{active}</b>
                </span>
                <span className="mx-2">&middot;</span>
                <span className="text-gray-500 dark:text-gray-400">
                    Archived: <b>{archived}</b>
                </span>
            </>
        }
        className={className}
        onRemove={onRemove}
    />
);

export default AnalyticsWidget;
export type { AnalyticsWidgetProps, Report };
