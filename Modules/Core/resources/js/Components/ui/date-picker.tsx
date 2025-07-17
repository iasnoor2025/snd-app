import React from 'react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export interface DatePickerProps {
    // New interface (preferred)
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;

    // Legacy interface (for backward compatibility)
    date?: Date | null;
    setDate?: (date: Date | undefined) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    // New props
    value,
    onChange,
    placeholder = "Pick a date",
    disabled = false,
    className = "",

    // Legacy props
    date,
    setDate,
}) => {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    // Use legacy props if new props are not provided
    const selectedDate = value !== undefined ? value : date;
    const handleDateChange = onChange || ((newDate: Date | null) => {
        if (setDate && typeof setDate === 'function') {
            setDate(newDate || undefined);
        }
    });

    // Ensure we have a valid date change handler
    const safeHandleDateChange = (newDate: Date | null) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('DatePicker safeHandleDateChange called with:', {
                newDate,
                onChange: typeof onChange,
                setDate: typeof setDate,
                isArabic,
                language: i18n.language
            });
        }

        try {
            if (handleDateChange && typeof handleDateChange === 'function') {
                handleDateChange(newDate);
            } else {
                console.warn('DatePicker: No valid date change handler provided', {
                    onChange: typeof onChange,
                    setDate: typeof setDate,
                    handleDateChange: typeof handleDateChange
                });
            }
        } catch (error) {
            console.error('Error in DatePicker date change handler:', {
                error,
                newDate,
                stackTrace: error instanceof Error ? error.stack : 'No stack trace'
            });
        }
    };

    // Enhanced date formatting for Persian calendar
    const formatDate = (date: Date | null) => {
        if (!date) return placeholder;

        try {
            if (isArabic) {
                // Try to format in Persian/Arabic
                return date.toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                return format(date, 'PPP');
            }
        } catch (error) {
            console.warn('Date formatting error, falling back to default:', error);
            return format(date, 'PPP');
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"} ${isArabic ? "rtl:text-right" : ""} ${className}`}
                    disabled={disabled}
                >
                    <CalendarIcon className={`mr-2 h-4 w-4 ${isArabic ? "rtl:ml-2 rtl:mr-0" : ""}`} />
                    {formatDate(selectedDate)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-auto p-0 ${isArabic ? "rtl:text-right" : ""}`} align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => safeHandleDateChange(date || null)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};
