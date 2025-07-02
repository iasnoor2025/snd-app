import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';

interface ClockWidgetProps {
  label?: string;
  timezone?: string;
  className?: string;
}

const getTimeString = (date: Date, timezone?: string) =>
  new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(date);

const getDateString = (date: Date, timezone?: string) =>
  new Intl.DateTimeFormat([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);

const ClockWidget: React.FC<ClockWidgetProps> = ({ label = 'Clock', timezone, className = '' }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-mono font-bold text-center">{getTimeString(now, timezone)}</div>
        <div className="text-sm text-muted-foreground text-center mt-1">{getDateString(now, timezone)}</div>
        {timezone && <div className="text-xs text-muted-foreground text-center mt-1">{timezone}</div>}
      </CardContent>
    </Card>
  );
};

export default ClockWidget;
