import { forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused) {
            if (ref && typeof ref !== 'function') {
                ref.current?.focus();
            } else if (localRef.current) {
                localRef.current.focus();
            }
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' + className}
            ref={ref || localRef}
        />
    );
});
