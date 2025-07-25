import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    usePermission,
    DialogClose,
} from '@/Core';
import { Link, router } from '@inertiajs/react';
import { Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
// @ts-ignore
import { route } from 'ziggy-js';

interface CrudButtonsProps {
    resourceType: string;
    resourceId: number;
    resourceName?: string;
    className?: string;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    onDelete?: () => void;
    viewRoute?: string;
    onView?: () => void;
    hideView?: boolean;
    additionalActions?: Array<{
        label: string;
        icon?: React.ReactNode;
        href?: string;
        onClick?: () => void;
        permission?: string;
    }>;
    [key: string]: any;
}

// Helper to force string output for any label or value
function forceString(val: any, fallback: string): string {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.en && typeof val.en === 'string') return val.en;
        const first = Object.values(val).find((v) => typeof v === 'string');
        if (first) return first;
    }
    return fallback;
}

const CrudButtons: React.FC<CrudButtonsProps> = ({
    resourceType,
    resourceId,
    resourceName = 'this item',
    className = '',
    showView = true,
    showEdit = true,
    showDelete = true,
    onDelete,
    additionalActions = [],
    viewRoute,
    onView,
    hideView,
    ...props
}) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { hasPermission } = usePermission();
    const { t } = useTranslation(['common']);

    const hasViewPermission = hasPermission(`${resourceType}.view`);
    const hasEditPermission = hasPermission(`${resourceType}.edit`);
    const hasDeletePermission = hasPermission(`${resourceType}.delete`);

    const handleDelete = () => {
        setIsDeleting(true);

        // Try to use named route first, fallback to manual URL construction
        let deleteUrl: string;
        try {
            deleteUrl = route(`${resourceType}.destroy`, resourceId);
        } catch (error: any) {
            deleteUrl = `/${resourceType}/${resourceId}`;
        }

        router.delete(deleteUrl, {
            onSuccess: () => {
                toast.success(t('messages.delete_success', { resource: resourceName }));
                if (onDelete) onDelete();
            },
            onError: (errors) => {
                toast.error(errors.message || t('messages.delete_error'));
            },
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            {showView && hasViewPermission && (
                <Button variant="outline" size="icon" asChild title={forceString(t('actions.view'), 'View')}>
                    <Link
                        href={(() => {
                            try {
                                return route(`${resourceType}.show`, resourceId);
                            } catch (error: any) {
                                return `/${resourceType}/${resourceId}`;
                            }
                        })()}
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            )}

            {showEdit && hasEditPermission && (
                <Button variant="outline" size="icon" asChild title={forceString(t('actions.edit'), 'Edit')}>
                    <Link
                        href={(() => {
                            try {
                                return route(`${resourceType}.edit`, resourceId);
                            } catch (error: any) {
                                return `/${resourceType}/${resourceId}/edit`;
                            }
                        })()}
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>
            )}

            {(showDelete || additionalActions.length > 0) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {additionalActions.map((action, index) => {
                            if (action.permission && !hasPermission(action.permission)) {
                                return null;
                            }

                            if (action.href) {
                                return (
                                    <DropdownMenuItem key={index} asChild>
                                        <Link href={action.href} className="flex cursor-pointer items-center">
                                            {action.icon && <span className="mr-2">{action.icon}</span>}
                                            {action.label}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            }

                            return (
                                <DropdownMenuItem key={index} onClick={action.onClick} className="cursor-pointer">
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                </DropdownMenuItem>
                            );
                        })}

                        {showDelete && hasDeletePermission && (
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {forceString(t('actions.delete'), 'Delete')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{forceString(t('dialogs.confirm_delete.title'), 'Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {forceString(t('dialogs.confirm_delete.description', { resource: resourceName }), 'Are you sure?')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isDeleting}>
                            {forceString(t('actions.cancel'), 'Cancel')}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {forceString(t('actions.deleting'), 'Deleting')}
                            </>
                        ) : (
                            forceString(t('actions.delete'), 'Delete')
                        )}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CrudButtons;
