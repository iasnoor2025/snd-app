import { HelpCircle } from 'lucide-react';
import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../Components/ui/tooltip';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';

/**
 * Option interface for Select component
 */
export interface SelectOption {
    /** Value of the option */
    value: string;
    /** Display label for the option */
    label: string;
    /** Whether the option is disabled */
    disabled?: boolean;
    /** Optional description for the option */
    description?: string;
    /** Optional icon for the option */
    icon?: React.ReactNode;
}

/**
 * Select component that extends shadcn/ui's select with additional features.
 * Supports labels, error states, helper text, tooltips, and custom options.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "1", label: "Option 1" },
 *   { value: "2", label: "Option 2" },
 *   { value: "3", label: "Option 3", disabled: true },
 * ];
 *
 * // Basic usage
 * <Select options={options} />
 *
 * // With label
 * <Select label="Category" options={options} />
 *
 * // With helper text
 * <Select helperText="Select a category" options={options} />
 *
 * // With error message
 * <Select error="This field is required" options={options} />
 *
 * // With tooltip
 * <Select
 *   label="Category"
 *   tooltip="Select a category from the list"
 *   options={options}
 * />
 *
 * // With value and onChange
 * <Select
 *   value="1"
 *   onChange={(value) => console.log(value)}
 *   options={options}
 * />
 * ```
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    /** Label text for the select */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Helper text to display below the select */
    helperText?: string;
    /** Tooltip text to show on hover */
    tooltip?: string;
    /** Array of options to display */
    options: SelectOption[];
    /** Current selected value */
    value?: string;
    /** Callback when value changes */
    onChange?: (value: string) => void;
    /** Callback when value changes */
    onValueChange?: (value: string) => void;
    /** Placeholder text when no option is selected */
    placeholder?: string;
    /** Whether the select is required */
    required?: boolean;
    /** Whether to show the required indicator (*) */
    showRequiredIndicator?: boolean;
    /** Whether to show a search input in the dropdown */
    searchable?: boolean;
    /** Whether to show option descriptions */
    showDescriptions?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            tooltip,
            options,
            value,
            onChange,
            onValueChange,
            placeholder = 'Select an option',
            id,
            required,
            showRequiredIndicator = true,
            searchable = false,
            showDescriptions = false,
            ...props
        },
        ref,
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const errorId = `${selectId}-error`;
        const helperId = `${selectId}-helper`;

        return (
            <div className="space-y-2">
                {label && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor={selectId}>
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
                <select
                    id={selectId}
                    className={cn(className, error && 'border-destructive focus:ring-destructive')}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={cn(error && errorId, helperText && helperId)}
                    aria-required={required}
                    value={value}
                    onChange={(e) => {
                        onChange?.(e.target.value);
                        onValueChange?.(e.target.value);
                    }}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options
                        .filter((option) => option.value !== '')
                        .map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                                {showDescriptions && option.description && <div className="text-xs text-muted-foreground">{option.description}</div>}
                            </option>
                        ))}
                </select>
                {searchable && (
                    <div className="px-2 pb-2">
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                    </div>
                )}
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

Select.displayName = 'Select';

export { Select };
