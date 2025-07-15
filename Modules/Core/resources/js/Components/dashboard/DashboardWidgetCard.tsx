import React, { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/card';

interface DashboardWidgetCardProps {
    title: string;
    summary: ReactNode;
    onRemove?: () => void;
    className?: string;
}

const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = ({ title, summary, onRemove, className = '' }) => (
    <Card className={`${className} border-none bg-transparent p-3 shadow-none`}>
        <CardHeader className="flex flex-row items-start justify-between p-0 pb-2">
            <div className="flex-1">
                <CardTitle className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{title}</CardTitle>
                <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{summary}</div>
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-3 rounded-full bg-red-50 px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    title="Remove Widget"
                >
                    ×
                </button>
            )}
        </CardHeader>
        {/* CardContent intentionally omitted for now */}
    </Card>
);

export default DashboardWidgetCard;
