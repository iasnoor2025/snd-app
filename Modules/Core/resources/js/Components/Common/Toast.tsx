import React, { HTMLAttributes, forwardRef } from "react";
import {
  Toast as ShadcnToast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastProvider,
  ToastViewport,
} from "../../../../../../resources/js/components/ui/toast";
import { cn } from "../../../../../../resources/js/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle, X, Loader2 } from "lucide-react";

/**
 * Toast component that extends shadcn/ui's toast with additional features.
 * Supports various variants, animations, and customizable content.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Toast title="Success" description="Operation completed successfully" />
 *
 * // With variant
 * <Toast
 *   variant="success"
 *   title="Success"
 *   description="Operation completed successfully"
 * />
 *
 * // With custom icon
 * <Toast
 *   icon={<CustomIcon />}
 *   title="Custom"
 *   description="Custom toast with icon"
 * />
 *
 * // With actions
 * <Toast
 *   title="Action Required"
 *   description="Please review and take action"
 *   actions={
 *     <Button variant="secondary" size="sm">Take Action</Button>
 *   }
 * />
 *
 * // With loading state
 * <Toast
 *   title="Processing"
 *   description="Please wait..."
 *   isLoading
 * />
 * ```
 */
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Title of the toast */
  title?: string;
  /** Description or content of the toast */
  description?: React.ReactNode;
  /** Visual style variant */
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  /** Duration in ms before auto-dismissing (0 to disable) */
  duration?: number;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Callback when toast is closed */
  onClose?: () => void;
  /** Custom class name */
  className?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to animate the toast */
  animate?: boolean;
  /** Actions to display in the toast */
  actions?: React.ReactNode;
  /** Whether to show a loading state */
  isLoading?: boolean;
  /** Whether to use a spinner instead of the default loading animation */
  useSpinner?: boolean;
  /** Position of the toast */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  /** Whether to show a progress bar */
  showProgress?: boolean;
  /** Whether to pause duration on hover */
  pauseOnHover?: boolean;
  /** Whether to pause duration on window blur */
  pauseOnWindowBlur?: boolean;
  /** Whether to make the toast more compact */
  compact?: boolean;
}

const variantClasses = {
  default: "bg-background text-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-green-500 text-white dark:bg-green-600",
  warning: "bg-yellow-500 text-white dark:bg-yellow-600",
  info: "bg-blue-500 text-white dark:bg-blue-600",
};

const defaultIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

const positionClasses = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

const Toast = forwardRef<HTMLDivElement, ToastProps>((
  {
    title,
    description,
    variant = "default",
    duration = 5000,
    icon,
    onClose,
    className,
    showIcon = true,
    animate = true,
    actions,
    isLoading = false,
    useSpinner = false,
    position = "bottom-right",
    showProgress = true,
    pauseOnHover = true,
    pauseOnWindowBlur = true,
    compact = false,
    ...props
  },
  ref
) => {
  const Icon = icon || defaultIcons[variant];
  const [progress, setProgress] = React.useState(100);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (duration && showProgress && !isPaused) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingProgress = Math.max(0, 100 - (elapsedTime / duration) * 100);
        setProgress(remainingProgress);
        if (remainingProgress === 0) {
          clearInterval(timer);
          onClose?.();
        }
      }, 10);
      return () => clearInterval(timer);
    }
  }, [duration, showProgress, isPaused, onClose]);

  return (
    <ShadcnToast
      ref={ref}
      duration={duration}
      className={cn(
        variantClasses[variant],
        positionClasses[position],
        animate && "animate-in fade-in-0 slide-in-from-right-full duration-300",
        compact && "p-2",
        "relative",
        className
      )}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onBlur={() => pauseOnWindowBlur && setIsPaused(true)}
      onFocus={() => pauseOnWindowBlur && setIsPaused(false)}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && (isLoading ? (
          useSpinner ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )
        ) : Icon && (
          <span className="mt-0.5 flex-shrink-0">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ))}
        <div className="flex-1 space-y-1">
          {title && (
            <ToastTitle className={cn(
              "font-medium leading-none tracking-tight",
              compact && "text-sm"
            )}>
              {title}
            </ToastTitle>
          )}
          {description && (
            <ToastDescription className={cn(
              "text-sm opacity-90",
              compact && "text-xs"
            )}>
              {description}
            </ToastDescription>
          )}
          {actions && (
            <div className={cn(
              "mt-2 flex items-center gap-2",
              compact && "mt-1 gap-1"
            )}>
              {actions}
            </div>
          )}
        </div>
        <ToastClose
          onClick={onClose}
          className={cn(
            "opacity-70 transition-opacity hover:opacity-100",
            compact && "h-4 w-4"
          )}
          aria-label="Close toast"
        />
      </div>
      {showProgress && duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-20"
          style={{ width: `${progress}%`, transition: "width 10ms linear" }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        />
      )}
    </ShadcnToast>
  );
});

Toast.displayName = "Toast";

export { Toast, ToastProvider, ToastViewport };

