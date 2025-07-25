import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className = '', ...props }, ref) => (
    <PopoverPrimitive.Content
        ref={ref}
        className={`z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ${className}`}
        {...props}
    />
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
