import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', ...props }, ref) => (
    <textarea
        ref={ref}
        className={`block w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 ${className}`}
        {...props}
    />
));

Textarea.displayName = 'Textarea';
