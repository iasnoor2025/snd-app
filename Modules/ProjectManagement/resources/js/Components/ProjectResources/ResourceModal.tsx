import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Core';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: () => void;
    isLoading?: boolean;
    submitText?: string;
}

export function ResourceModal({ isOpen, onClose, title, children, onSubmit, isLoading = false, submitText = 'Save' }: ResourceModalProps) {
    const { t } = useTranslation('project');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">{children}</div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            submitText
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
