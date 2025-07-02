import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Calendar, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string; // e.g. '2024-07-10'
  title: string;
  description?: string;
  type?: 'meeting' | 'deadline' | 'alert';
}

interface CalendarWidgetProps {
  events: CalendarEvent[];
  className?: string;
}

const typeMap = {
  meeting: { color: 'bg-blue-500', icon: <Calendar className="h-4 w-4 text-blue-500" /> },
  deadline: { color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  alert: { color: 'bg-red-500', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, className = '' }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="ml-2 p-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/80" title="Create Event">
              <Plus className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>Event creation form coming soon...</DialogDescription>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {events.length === 0 ? (
            <li className="text-muted-foreground text-sm">No upcoming events.</li>
          ) : (
            events.map((event) => (
              <li key={event.id} className="flex items-center gap-2 text-sm border-b last:border-b-0 pb-2">
                <span className={`inline-block w-2 h-2 rounded-full ${typeMap[event.type || 'meeting'].color}`}></span>
                {typeMap[event.type || 'meeting'].icon}
                <span className="font-medium">{event.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">{event.date}</span>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
export type { CalendarWidgetProps, CalendarEvent };
