import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Core";
import { RentalStatus } from '@/Core/types/models';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface RentalWorkflowActionsProps {
    rental: {
        id: number;
        status: RentalStatus;
    };
    className?: string;
    canManageDocuments?: boolean;
}

export function RentalWorkflowActions({
    rental,
    className,
    canManageDocuments = false,
}: RentalWorkflowActionsProps) {
  const { t } = useTranslation('rental');

    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleAction = (action: string) => {
        if (isProcessing) return;

        setIsProcessing(true);
        const loadingToast = toast.loading(`Processing ${action}...`);

        if (action === 'generate-quotation') {
            // For quotation, use simple form submission
            const form = document.createElement('form');
            form.method = 'GET';
            form.action = `/rentals/${rental.id}/direct-generate-quotation`;
            document.body.appendChild(form);
            form.submit();
            return;
        }

        // For other actions, use Inertia post
        router.post(`/rentals/${rental.id}/${action}`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Action completed successfully');
                router.get(window.location.pathname);
            },
            onError: () => {
                toast.dismiss(loadingToast);
                toast.error('Failed to complete action');
                setIsProcessing(false);
            },
            onFinish: () => {
                toast.dismiss(loadingToast);
                setIsProcessing(false);
            }
        })
    };

    const getAvailableActions = () => {
        const status = rental.status || 'pending';

        switch (status) {
            case 'pending':
                return [
                    {
                        label: 'Generate Quotation',
                        action: 'generate-quotation',
                        variant: 'default' as const,
                    },
                ];
            case 'quotation':
                return [
                    {
                        label: 'Approve Quotation',
                        action: 'approve-quotation',
                        variant: 'default' as const,
                    },
                ];
            case 'quotation_approved':
                return [
                    {
                        label: 'Start Mobilization',
                        action: 'start-mobilization',
                        variant: 'default' as const,
                    },
                ];
            case 'mobilization':
                return [
                    {
                        label: 'Complete Mobilization',
                        action: 'complete-mobilization',
                        variant: 'default' as const,
                    },
                ];
            case 'mobilization_completed':
                return [
                    {
                        label: 'Start Rental',
                        action: 'start',
                        variant: 'default' as const,
                    },
                ];
            case 'active':
                return [
                    {
                        label: 'Complete Rental',
                        action: 'complete',
                        variant: 'default' as const,
                    },
                ];
            case 'completed':
                return [
                    {
                        label: 'Create Invoice',
                        action: 'create-invoice',
                        variant: 'default' as const,
                    },
                ];
            case 'invoice_prepared':
                return [
                    {
                        label: 'Mark Payment Pending',
                        action: 'mark-payment-pending',
                        variant: 'default' as const,
                    },
                    {
                        label: 'Mark Closed',
                        action: 'mark-closed',
                        variant: 'outline' as const,
                    },
                ];
            case 'payment_pending':
                return [
                    {
                        label: 'Mark Closed',
                        action: 'mark-closed',
                        variant: 'default' as const,
                    },
                ];
            case 'overdue':
                return [
                    {
                        label: 'Mark Closed',
                        action: 'mark-closed',
                        variant: 'default' as const,
                    },
                ];
            case 'closed':
                return [];
            default:
                console.warn('Unknown rental status:', status);
                return [];
        }
    };

    const actions = getAvailableActions();

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-2">
                {actions.map(({ label, action, variant }) => (
                    <Button
                        key={action}
                        variant={variant}
                        onClick={() => handleAction(action)}
                        disabled={isProcessing}
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
}














