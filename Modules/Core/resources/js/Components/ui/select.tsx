import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ children, className = '', ...props }, ref) => (
    <select
        ref={ref}
        className={`block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 ${className}`}
        {...props}
    >
        {children}
    </select>
));

Select.displayName = 'Select';
