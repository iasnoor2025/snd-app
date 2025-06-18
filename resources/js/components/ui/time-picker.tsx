import React from 'react';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, ...props }) => (
  <input
    type="time"
    value={value}
    onChange={e => onChange?.(e.target.value)}
    {...props}
  />
);

export default TimePicker;
