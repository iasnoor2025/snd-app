import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { RentalStatus } from '@/types/models';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Modal } from '../Modal';
import { RentalForm } from './RentalForm';
import { RentalDetails } from './RentalDetails';

interface RentalWorkflowActionsProps {
    rental: {
        id: number;
        status: RentalStatus;
    };
    className?: string;
    canManageDocuments?: boolean;
    selectedRental: any;
    onRentalSelect: (rental: any) => void;
    customers?: any[];
    equipment?: any[];
}

export const RentalWorkflowActions: FC<RentalWorkflowActionsProps> = ({
    rental,
    className,
    canManageDocuments = false,
    selectedRental,
    onRentalSelect,
    customers = [],
    equipment = [],
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const { post, processing } = useForm();

    // Add debugging to help diagnose issues
    console.log('RentalWorkflowActions props:', {
        rentalId: rental?.id,
        status: rental?.status || 'pending',
    })

    const handleAction = async (action: string) => {
        try {
            // Special case for quotation generation which needs to use the direct endpoint
            if (action === 'generate-quotation') {
                // Show loading toast
                const loadingToast = toast.loading('Generating quotation...');

                // Use direct navigation for more reliable redirect to quotation page
                window.location.href = `/rentals/${rental.id}/direct-generate-quotation`;

                // No need for further handling as page will navigate away
                return;
            } else {
                // Handle other actions normally
                const loadingToast = toast.loading(`Processing ${action}...`);

                await post(`/rentals/${rental.id}/${action}`, {
                    preserveScroll: false, // Allow navigation after status changes
                    onSuccess: () => {
                        toast.dismiss(loadingToast);
                        toast.success('Action completed successfully');
                        // Reload the page to show updated status
                        setTimeout(() => window.location.reload(), 500);
                    },
                    onError: (error) => {
                        toast.dismiss(loadingToast);
                        toast.error(error.message || 'Failed to complete action');
                    },
                })
            }
        } catch (error) {
            console.error('Action error:', error);
            toast.error('An unexpected error occurred');
        }
    };

    const getAvailableActions = () => {
  const { t } = useTranslation('rental');

        // Make sure we have a valid status (not empty string)
        const status = rental.status || 'pending'; // Default to 'pending' if status is empty

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
                return []; // No actions for closed rentals
            default:
                console.log('Unknown rental status:', status);
                return [];
        }
    };

    const actions = getAvailableActions();

    if (actions.length === 0) {
        return null;
    }

    const handleStatusChange = (newStatus: string) => {
        if (!selectedRental) return;

        post(route('rentals.update-status', selectedRental.id), {
            status: newStatus,
            onSuccess: () => {
                // Refresh the rental data
                onRentalSelect({ ...selectedRental, status: newStatus })
            },
        })
    };

    const handleCreateSubmit = (data: any) => {
        setShowCreateModal(false);
        // Refresh the rentals list
        window.location.reload();
    };

    const handleEditSubmit = (data: any) => {
        setShowEditModal(false);
        // Update the selected rental with new data
        onRentalSelect({ ...selectedRental, ...data })
    };

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-2">
                {actions.map(({ label, action, variant }) => (
                    <Button
                        key={action}
                        variant={variant}
                        onClick={() => handleAction(action)}
                        disabled={processing}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    New Rental
                </button>

                {selectedRental && (
                    <>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => setShowDetailsModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View Details
                        </button>

                        {selectedRental.status === 'pending' && (
                            <button
                                onClick={() => handleStatusChange('active')}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Activate
                            </button>
                        )}

                        {selectedRental.status === 'active' && (
                            <button
                                onClick={() => handleStatusChange('completed')}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Complete
                            </button>
                        )}

                        {(selectedRental.status === 'pending' || selectedRental.status === 'active') && (
                            <button
                                onClick={() => handleStatusChange('cancelled')}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Cancel
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('ttl_create_new_rental')}
            >
                <RentalForm
                    customers={customers}
                    equipment={equipment}
                    onSubmit={handleCreateSubmit}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={t('ttl_edit_rental')}
            >
                <RentalForm
                    rental={selectedRental}
                    customers={customers}
                    equipment={equipment}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>

            {/* Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={t('rental_details')}
            >
                <RentalDetails
                    rental={selectedRental}
                    onEdit={() => {
                        setShowDetailsModal(false);
                        setShowEditModal(true);
                    }}
                />
            </Modal>
        </div>
    );
};














