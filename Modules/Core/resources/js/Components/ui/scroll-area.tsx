import * as React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(({ children, className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 overflow-auto ${className}`}
        {...props}
    >
        {children}
    </div>
));

ScrollArea.displayName = 'ScrollArea';
