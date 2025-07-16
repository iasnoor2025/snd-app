import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { cn } from '@/Core/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const [hour, setHour] = React.useState('00');
  const [minute, setMinute] = React.useState('00');

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      if (h && m) {
        setHour(h.padStart(2, '0'));
        setMinute(m.padStart(2, '0'));
      }
    }
  }, [value]);

  const handleSelect = (h: string, m: string) => {
    setHour(h);
    setMinute(m);
    onChange && onChange(`${h}:${m}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-24 justify-between', className)}
          disabled={disabled}
        >
          {hour}:{minute}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={hour}
            onChange={e => handleSelect(e.target.value, minute)}
            disabled={disabled}
          >
            {hours.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="self-center">:</span>
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={minute}
            onChange={e => handleSelect(hour, e.target.value)}
            disabled={disabled}
          >
            {minutes.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
