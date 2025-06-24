import { FC } from 'react';

declare module 'sonner' {
    export interface ToastOptions {
        duration?: number;
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
        dismissible?: boolean;
        action?: {
            label: string;
            onClick: () => void;
        };
        cancel?: {
            label: string;
            onClick: () => void;
        };
        id?: string | number;
        onDismiss?: (id: string | number) => void;
        onAutoClose?: (id: string | number) => void;
    }

    export interface ToasterProps {
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
        expand?: boolean;
        richColors?: boolean;
        closeButton?: boolean;
        theme?: 'light' | 'dark' | 'system';
        duration?: number;
        visibleToasts?: number;
        className?: string;
        style?: React.CSSProperties;
    }

    export interface Toast {
        id: string | number;
        title: string | React.ReactNode;
        description?: string | React.ReactNode;
        type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
        icon?: React.ReactNode;
        options?: ToastOptions;
    }

    export const Toaster: FC<ToasterProps>;

    export interface ToastFunction {
        (message: string | React.ReactNode, options?: ToastOptions): string | number;
        success(message: string | React.ReactNode, options?: ToastOptions): string | number;
        error(message: string | React.ReactNode, options?: ToastOptions): string | number;
        warning(message: string | React.ReactNode, options?: ToastOptions): string | number;
        info(message: string | React.ReactNode, options?: ToastOptions): string | number;
        loading(message: string | React.ReactNode, options?: ToastOptions): string | number;
        custom(message: string | React.ReactNode, options?: ToastOptions & { type?: 'success' | 'error' | 'info' | 'warning' }): string | number;
        dismiss(toastId?: string | number): void;
        update(toastId: string | number, options: { render: string | React.ReactNode } & ToastOptions): void;
    }

    export const toast: ToastFunction;
} 