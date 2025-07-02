import React from 'react';

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange }) => (
  <select
    multiple
    value={value}
    onChange={e => {
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
      onChange(selected);
    }}
    className="border rounded p-2 w-full"
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default MultiSelect;
