import { useState } from 'react';
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/Core';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    // New interface
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    className?: string;

    // Legacy interface for backward compatibility
    date?: Date | null | undefined;
    setDate?: (date: Date | undefined) => void;
    placeholder?: string;
}

export function DatePicker({
    value,
    onChange,
    className,
    date,
    setDate,
    placeholder = "Pick a date"
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    // Use legacy props if new props are not provided
    const selectedDate = value !== undefined ? value : date;
    const handleDateChange = onChange || ((newDate: Date | null) => {
        if (setDate) {
            setDate(newDate || undefined);
        }
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground', className)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        handleDateChange(date ?? null);
                        setOpen(false);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
