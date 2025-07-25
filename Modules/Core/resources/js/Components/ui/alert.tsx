import * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className = '', variant = 'default', ...props }, ref) => {
    let variantClass = 'bg-blue-50 text-blue-800 border-blue-200';
    if (variant === 'destructive') variantClass = 'bg-red-50 text-red-800 border-red-200';
    if (variant === 'success') variantClass = 'bg-green-50 text-green-800 border-green-200';
    if (variant === 'warning') variantClass = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return <div ref={ref} className={`rounded-md border px-4 py-3 ${variantClass} ${className}`} {...props} />;
});

Alert.displayName = 'Alert';

export const AlertTitle = ({ children, className = '', ...props }: any) => (
  <div className={`font-semibold text-base mb-1 ${className}`} {...props}>{children}</div>
);

export const AlertDescription = ({ children, className = '', ...props }: any) => (
  <div className={`text-sm opacity-80 ${className}`} {...props}>{children}</div>
);
