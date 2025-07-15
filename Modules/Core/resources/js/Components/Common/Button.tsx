import { Button as ShadcnButton } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from "react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from '../../components/ui/button';
import { Loader2 } from "lucide-react";

/**
 * Button component that extends shadcn/ui's button with additional features.
 * Supports loading state, icons, and various variants.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button>Click me</Button>
 *
 * // With loading state
 * <Button isLoading>Loading...</Button>
 *
 * // With icons
 * <Button leftIcon={<PlusIcon />}>Add Item</Button>
 * <Button rightIcon={<ArrowIcon />}>Next</Button>
 *
 * // With variants
 * <Button variant="destructive">Delete</Button>
 * <Button variant="outline">Cancel</Button>
 *
 * // With sizes
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 * ```
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows loading spinner and disables button */
  isLoading?: boolean;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  /** Tooltip text to show on hover */
  tooltip?: string;
  /** Whether to show a loading spinner instead of the default loading animation */
  useSpinner?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      tooltip,
      useSpinner = false,
      ...props
    },
    ref
  ) => {
    return (
      <ShadcnButton
        className={cn(className)}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        ref={ref}
        title={tooltip}
        {...props}
      >
        {isLoading && (
          useSpinner ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export { Button };























