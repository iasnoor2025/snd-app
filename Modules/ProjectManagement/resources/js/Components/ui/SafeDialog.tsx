import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogErrorBoundary } from '../DialogErrorBoundary';

interface SafeDialogProps {
    children: ReactNode;
    trigger?: ReactNode;
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    contentClassName?: string;
}

export function SafeDialog({ children, trigger, title, description, open, onOpenChange, className, contentClassName }: SafeDialogProps) {
    const { t } = useTranslation('project');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={contentClassName}>
                <DialogErrorBoundary>
                    {(title || description) && (
                        <DialogHeader>
                            {title && <DialogTitle>{title}</DialogTitle>}
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </DialogHeader>
                    )}
                    <div className={className}>{children}</div>
                </DialogErrorBoundary>
            </DialogContent>
        </Dialog>
    );
}

export default SafeDialog;
