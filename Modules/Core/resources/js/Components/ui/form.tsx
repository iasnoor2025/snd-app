import * as React from 'react';
import { Controller } from 'react-hook-form';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
}

export function Form({ children, ...props }: FormProps) {
    return <form {...props}>{children}</form>;
}

export function FormField({ name, control, render }: any) {
    return <Controller name={name} control={control} render={render} />;
}

export function FormItem({ children }: { children: React.ReactNode }) {
    return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
    if (!children) return null;
    return <p className="mt-1 text-xs text-red-500">{children}</p>;
}

export function FormDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-gray-500 dark:text-gray-400">{children}</p>;
}
