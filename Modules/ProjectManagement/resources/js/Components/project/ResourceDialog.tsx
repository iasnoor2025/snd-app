import { ErrorBoundary } from '@/Core';
import { XIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ResourceForm from './ResourceForm';

export type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';

export interface ResourceDialogProps {
    projectId: number;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialType?: ResourceType;
    initialData?: any;
    onSuccess?: () => void;
}

export default function ResourceDialog({
    projectId,
    isOpen = false,
    onOpenChange = () => {},
    initialType = 'manpower',
    initialData = null,
    onSuccess = () => {},
}: ResourceDialogProps) {
    const { t } = useTranslation(['projects']);

    const title = initialData
        ? t(`edit_${initialType}`, { defaultValue: t('edit_resource') })
        : t(`add_${initialType}`, { defaultValue: t('add_resource') });

    // Only render the dialog when it's actually open
    if (!isOpen) {
        return null;
    }

    // Add body overflow hidden to prevent scrolling when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key to close dialog
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onOpenChange]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    return (
        <ErrorBoundary>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={handleBackdropClick}>
                <div className="relative w-full max-w-[500px] rounded-lg bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={() => onOpenChange(false)}
                    >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">{t('common:close')}</span>
                    </button>

                    {/* Header */}
                    <div className="border-b p-6">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{initialData ? t('update_resource') : t('add_new_resource')}</p>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <ResourceForm
                            type={initialType}
                            projectId={projectId}
                            onSuccess={() => {
                                onSuccess();
                                onOpenChange(false);
                            }}
                            initialData={initialData}
                        />
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
