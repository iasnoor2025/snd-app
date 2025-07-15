import * as React from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`fixed right-4 bottom-4 z-50 ${className}`} {...props}>
        {children}
    </div>
));

Toast.displayName = 'Toast';
