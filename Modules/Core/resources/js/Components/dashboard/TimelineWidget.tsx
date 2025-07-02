import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

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
}

const iconMap = {
  milestone: <CheckCircle className="text-green-500" />,
  alert: <AlertCircle className="text-red-500" />,
  event: <Calendar className="text-blue-500" />,
};

const TimelineWidget: React.FC<TimelineWidgetProps> = ({ events, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Project Timeline</CardTitle>
    </CardHeader>
    <CardContent>
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {events.length === 0 ? (
          <li className="text-muted-foreground text-sm">No timeline events.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="mb-8 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-primary">
                {event.avatarUrl ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.avatarUrl} />
                    <AvatarFallback>{event.title.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  iconMap[event.type || 'event']
                )}
              </span>
              <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{event.time}</time>
              {event.description && <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{event.description}</p>}
            </li>
          ))
        )}
      </ol>
    </CardContent>
  </Card>
);

export default TimelineWidget;
export type { TimelineWidgetProps, TimelineEvent };
