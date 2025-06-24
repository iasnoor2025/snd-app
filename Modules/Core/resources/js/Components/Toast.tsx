import React from 'react';
import { Toaster } from 'sonner';
import type { ToastPosition } from '../services/ToastService';

interface ToastProps {
  position?: ToastPosition;
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  offset?: string | number;
  dir?: 'rtl' | 'ltr' | 'auto';
  hotkey?: string[];
  loading?: {
    icon: React.ReactNode;
    duration?: number;
  };
  toastOptions?: {
    className?: string;
    descriptionClassName?: string;
    style?: React.CSSProperties;
    unstyled?: boolean;
    classNames?: {
      toast?: string;
      description?: string;
      actionButton?: string;
      cancelButton?: string;
      closeButton?: string;
      title?: string;
      loader?: string;
    };
  };
}

const Toast: React.FC<ToastProps> = ({
  position = 'top-right',
  theme = 'system',
  richColors = true,
  expand = false,
  duration = 4000,
  visibleToasts = 3,
  closeButton = true,
  offset = '32px',
  dir = 'auto',
  hotkey = ['altKey', 'KeyT'],
  loading,
  toastOptions = {
    className: 'rounded-lg shadow-lg',
    descriptionClassName: 'text-sm text-gray-500 dark:text-gray-400',
    classNames: {
      toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-800 dark:group-[.toaster]:text-gray-50 dark:group-[.toaster]:border-gray-700',
      description: 'group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400',
      actionButton: 'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900',
      cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900 dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-50',
      closeButton: 'group-[.toast]:text-gray-950/50 group-[.toast]:hover:text-gray-950/80 dark:group-[.toast]:text-gray-50/80 dark:group-[.toast]:hover:text-gray-50',
    },
  },
}) => {
  return (
    <Toaster
      position={position}
      theme={theme}
      richColors={richColors}
      expand={expand}
      duration={duration}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      offset={offset}
      dir={dir}
      hotkey={hotkey}
      loading={loading}
      toastOptions={toastOptions}
    />
  );
};

export default Toast; 