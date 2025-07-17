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
        <div ref={ref} className={`rounded-md border p-3 bg-white shadow-sm ${className}`} {...props}>
            <DayPicker
                mode={mode}
                selected={selected || undefined}
                onSelect={onSelect}
                showOutsideDays
                defaultMonth={selected || undefined}
                initialFocus={initialFocus}
                className="rdp"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
            />
        </div>
    )
);

Calendar.displayName = 'Calendar';
