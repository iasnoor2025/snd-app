import * as React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ label, className = '', ...props }, ref) => (
    <label className={`inline-flex cursor-pointer items-center ${className}`}>
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 transition-all peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary peer-focus:outline-none dark:bg-gray-700"></div>
        {label && <span className="ml-2 text-sm">{label}</span>}
    </label>
));

Switch.displayName = 'Switch';
