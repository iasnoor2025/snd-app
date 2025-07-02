import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Activity Feed</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {activities.length === 0 ? (
          <li className="text-muted-foreground text-sm">No recent activity.</li>
        ) : (
          activities.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span><span className="font-medium">{item.user}</span> {item.action}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </li>
          ))
        )}
      </ul>
    </CardContent>
  </Card>
);

export default ActivityFeed;

export type { ActivityFeedProps, ActivityItem };
