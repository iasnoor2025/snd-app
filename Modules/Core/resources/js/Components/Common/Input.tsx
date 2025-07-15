import { HelpCircle } from 'lucide-react';
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Input as ShadcnInput } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { cn } from '../../lib/utils';

/**
 * Input component that extends shadcn/ui's input with additional features.
 * Supports labels, error states, helper text, tooltips, and icons.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Input placeholder="Enter text" />
 *
 * // With label
 * <Input label="Username" />
 *
 * // With helper text
 * <Input helperText="This is a helper text" />
 *
 * // With error message
 * <Input error="This field is required" />
 *
 * // With tooltip
 * <Input
 *   label="Password"
 *   tooltip="Must be at least 8 characters"
 * />
 *
 * // With icons
 * <Input
 *   leftIcon={<SearchIcon className="h-4 w-4" />}
 *   placeholder="Search..."
 * />
 * <Input
 *   rightIcon={<SearchIcon className="h-4 w-4" />}
 *   placeholder="Search..."
 * />
 * ```
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Label text for the input */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Helper text to display below the input */
    helperText?: string;
    /** Tooltip text to show on hover */
    tooltip?: string;
    /** Icon to show before input */
    leftIcon?: React.ReactNode;
    /** Icon to show after input */
    rightIcon?: React.ReactNode;
    /** Whether the input is required */
    required?: boolean;
    /** Whether to show the required indicator (*) */
    showRequiredIndicator?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, tooltip, leftIcon, rightIcon, id, required, showRequiredIndicator = true, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        return (
            <div className="space-y-2">
                {label && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor={inputId}>
                            {label}
                            {required && showRequiredIndicator && <span className="ml-1 text-destructive">*</span>}
                        </Label>
                        {tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )}
                <div className="relative">
                    {leftIcon && <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">{leftIcon}</div>}
                    <ShadcnInput
                        ref={ref}
                        id={inputId}
                        className={cn(
                            className,
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-destructive focus-visible:ring-destructive',
                        )}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={cn(error && errorId, helperText && helperId)}
                        aria-required={required}
                        {...props}
                    />
                    {rightIcon && <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>}
                </div>
                {error && (
                    <p id={errorId} className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={helperId} className="text-sm text-muted-foreground">
                        {helperText}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

export { Input };
