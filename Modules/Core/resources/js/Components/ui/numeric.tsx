import React from 'react';

interface NumericProps {
  id?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  className?: string;
}

export const Numeric: React.FC<NumericProps> = ({ id, value, onValueChange, min = 0, className }) => (
  <input
    type="number"
    id={id}
    value={value}
    min={min}
    className={className}
    onChange={e => onValueChange(Number(e.target.value))}
  />
);






















