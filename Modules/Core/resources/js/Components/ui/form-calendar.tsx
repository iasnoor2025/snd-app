import * as React from 'react';
import { Calendar, CalendarProps } from './calendar';

interface FormCalendarProps extends Omit<CalendarProps, 'onSelect'> {
    onSelect?: (date: Date | undefined) => void;
    field?: {
        onChange?: (date: Date | undefined) => void;
        value?: Date | undefined;
    };
}

/**
 * FormCalendar component that safely handles form field changes
 * This component ensures that field.onChange is always handled safely
 */
export const FormCalendar = React.forwardRef<HTMLDivElement, FormCalendarProps>(
    ({ onSelect, field, selected, ...props }, ref) => {
        const safeOnSelect = React.useCallback((date: Date | undefined) => {
            try {
                // Try onSelect prop first
                if (onSelect && typeof onSelect === 'function') {
                    onSelect(date);
                    return;
                }

                // Fallback to field.onChange
                if (field?.onChange && typeof field.onChange === 'function') {
                    field.onChange(date);
                    return;
                }

                console.warn('FormCalendar: No valid onChange handler provided');
            } catch (error) {
                console.error('Error in FormCalendar onSelect:', error);
            }
        }, [onSelect, field?.onChange]);

        // Use field.value if selected is not provided
        const selectedDate = selected !== undefined ? selected : field?.value;

        return (
            <Calendar
                ref={ref}
                selected={selectedDate}
                onSelect={safeOnSelect}
                {...props}
            />
        );
    }
);

FormCalendar.displayName = 'FormCalendar';
