import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface ActivityItem {
    id: string;
    user: string;
    action: string;
    time: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
    className?: string;
    onRemove: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className = '', onRemove }) => (
    <DashboardWidgetCard
        title="Activity Feed"
        summary={activities.length === 0 ? 'No recent activity.' : `Activities: ${activities.length}`}
        onRemove={onRemove}
        className={className}
    />
);

export default ActivityFeed;

export type { ActivityFeedProps, ActivityItem };
