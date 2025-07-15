import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { HTMLAttributes, forwardRef } from 'react';
import { AlertDescription, AlertTitle, Alert as ShadcnAlert } from '../../components/ui/alert';
import { cn } from '../../lib/utils';

/**
 * Alert component that extends shadcn/ui's alert with additional features.
 * Supports various variants, sizes, and customizable content.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Alert title="Success" description="Operation completed successfully" />
 *
 * // With variant
 * <Alert
 *   variant="success"
 *   title="Success"
 *   description="Operation completed successfully"
 * />
 *
 * // With custom icon
 * <Alert
 *   icon={<CustomIcon />}
 *   title="Custom"
 *   description="Custom alert with icon"
 * />
 *
 * // Dismissible
 * <Alert
 *   dismissible
 *   onClose={() => console.log("Alert closed")}
 *   title="Dismissible"
 *   description="Click the X to close"
 * />
 *
 * // With actions
 * <Alert
 *   title="Action Required"
 *   description="Please review and take action"
 *   actions={
 *     <Button variant="secondary" size="sm">Take Action</Button>
 *   }
 * />
 * ```
 */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    /** Title of the alert */
    title?: string;
    /** Description or content of the alert */
    description?: React.ReactNode;
    /** Visual style variant */
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    /** Size of the alert */
    size?: 'sm' | 'md' | 'lg';
    /** Custom icon to display */
    icon?: React.ReactNode;
    /** Callback when alert is closed */
    onClose?: () => void;
    /** Whether the alert can be dismissed */
    dismissible?: boolean;
    /** Custom class name */
    className?: string;
    /** Whether to show the icon */
    showIcon?: boolean;
    /** Whether to animate the alert */
    animate?: boolean;
    /** Duration in ms before auto-dismissing (0 to disable) */
    autoDismiss?: number;
    /** Actions to display in the alert */
    actions?: React.ReactNode;
    /** Whether to show a border */
    bordered?: boolean;
    /** Whether to show a shadow */
    shadowed?: boolean;
    /** Whether to make the alert more compact */
    compact?: boolean;
}

const variantClasses = {
    default: 'bg-background text-foreground',
    destructive: 'bg-destructive/15 text-destructive dark:bg-destructive/25',
    success: 'bg-green-500/15 text-green-600 dark:bg-green-500/25 dark:text-green-400',
    warning: 'bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/25 dark:text-yellow-400',
    info: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400',
};

const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-base p-4',
    lg: 'text-lg p-5',
};

const defaultIcons = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
    (
        {
            title,
            description,
            variant = 'default',
            size = 'md',
            icon,
            onClose,
            dismissible = false,
            className,
            showIcon = true,
            animate = true,
            autoDismiss = 0,
            actions,
            bordered = false,
            shadowed = false,
            compact = false,
            ...props
        },
        ref,
    ) => {
        const Icon = icon || defaultIcons[variant];

        React.useEffect(() => {
            if (autoDismiss > 0 && onClose) {
                const timer = setTimeout(onClose, autoDismiss);
                return () => clearTimeout(timer);
            }
        }, [autoDismiss, onClose]);

        return (
            <ShadcnAlert
                ref={ref}
                className={cn(
                    variantClasses[variant],
                    sizeClasses[size],
                    'relative',
                    animate && 'animate-in fade-in-0 duration-300',
                    bordered && 'border',
                    shadowed && 'shadow-md',
                    compact && 'py-2',
                    className,
                )}
                role="alert"
                {...props}
            >
                <div className="flex items-start gap-3">
                    {showIcon && Icon && (
                        <span className="mt-0.5 flex-shrink-0">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                    )}
                    <div className="flex-1 space-y-1">
                        {title && (
                            <AlertTitle className={cn('leading-none font-medium tracking-tight', size === 'lg' && 'text-lg')}>{title}</AlertTitle>
                        )}
                        {description && (
                            <AlertDescription className={cn('text-muted-foreground', size === 'sm' && 'text-xs', size === 'lg' && 'text-base')}>
                                {description}
                            </AlertDescription>
                        )}
                        {actions && <div className="mt-3 flex items-center gap-3">{actions}</div>}
                    </div>
                    {dismissible && (
                        <button
                            onClick={onClose}
                            className={cn(
                                'absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                                size === 'sm' && 'top-1 right-1',
                                size === 'lg' && 'top-3 right-3',
                            )}
                            aria-label="Close alert"
                        >
                            <X className={cn('h-4 w-4', size === 'sm' && 'h-3 w-3', size === 'lg' && 'h-5 w-5')} />
                            <span className="sr-only">Close</span>
                        </button>
                    )}
                </div>
            </ShadcnAlert>
        );
    },
);

Alert.displayName = 'Alert';

export { Alert };
