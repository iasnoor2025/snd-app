import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ indeterminate, ...props }, ref) => {
    React.useEffect(() => {
        if (ref && 'current' in ref && ref.current) {
            ref.current.indeterminate = !!indeterminate;
        }
    }, [ref, indeterminate]);

    return <input type="checkbox" ref={ref} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" {...props} />;
});

Checkbox.displayName = 'Checkbox';
