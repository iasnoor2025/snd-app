import * as React from 'react';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`rounded-md border p-4 ${className}`} {...props}>
        {children || 'Calendar component placeholder'}
    </div>
));

Calendar.displayName = 'Calendar';
