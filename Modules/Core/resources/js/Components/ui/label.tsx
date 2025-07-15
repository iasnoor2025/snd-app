import * as React from 'react';

function Label({ className = '', children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
            {children}
        </label>
    );
}

export { Label };
