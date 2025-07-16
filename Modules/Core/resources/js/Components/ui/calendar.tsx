import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export interface CalendarProps {
    mode?: 'single';
    selected?: Date | null;
    onSelect?: (date: Date | undefined) => void;
    initialFocus?: boolean;
    className?: string;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    ({ mode = 'single', selected, onSelect, initialFocus, className = '', ...props }, ref) => (
        <div ref={ref} className={`rounded-md border p-4 bg-white ${className}`} {...props}>
            <DayPicker
                mode={mode}
                selected={selected || undefined}
                onSelect={onSelect}
                showOutsideDays
                defaultMonth={selected || undefined}
                initialFocus={initialFocus}
            />
        </div>
    )
);

Calendar.displayName = 'Calendar';
