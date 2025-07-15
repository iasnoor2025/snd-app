import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardWidgetCard from './DashboardWidgetCard';
import { useInitials } from '../hooks/use-initials';

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  type?: 'milestone' | 'alert' | 'event';
  avatarUrl?: string;
}

interface TimelineWidgetProps {
  events: TimelineEvent[];
  className?: string;
  onRemove: () => void;
}

const iconMap = {
  milestone: <CheckCircle className="text-green-500" />,
  alert: <AlertCircle className="text-red-500" />,
  event: <Calendar className="text-blue-500" />,
};

const TimelineWidget: React.FC<TimelineWidgetProps> = ({ events, className = '', onRemove }) => (
  <DashboardWidgetCard
    title="Project Timeline"
    summary={events.length === 0 ? 'No timeline events.' : `Events: ${events.length}`}
    onRemove={onRemove}
    className={className}
  />
);

export default TimelineWidget;
export type { TimelineWidgetProps, TimelineEvent };
