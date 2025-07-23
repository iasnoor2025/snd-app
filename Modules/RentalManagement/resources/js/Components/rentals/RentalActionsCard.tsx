import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Core';
import { Inertia } from '@inertiajs/inertia';
import { CalendarPlus, ChevronDown, Clock, CreditCard, FileText, Loader2, Pencil, Printer, Share2, Trash, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import RentalExtensionDialog from './rentalExtensionDialog';

interface RentalActionsCardProps {
    rental: {
        id: number;
        rental_number: string;
        status: string;
        expected_end_date?: string | null;
    };
    permissions: {
        update: boolean;
        delete: boolean;
        request_extension: boolean;
        generate_invoice: boolean;
    };
    onExtensionSuccess?: () => void;
    onDelete?: () => void;
    onShareRental?: () => void;
}

const RentalActionsCard: React.FC<RentalActionsCardProps> = ({ rental, permissions, onExtensionSuccess, onDelete, onShareRental }) => {
    const { t } = useTranslation('rental');
    const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);

    // Check if rental status allows extensions
    const canExtend = ['active', 'pending'].includes(rental.status.toLowerCase()) && permissions.request_extension;

    // Check if rental can be deleted
    const canDelete = !['completed', 'invoiced'].includes(rental.status.toLowerCase()) && permissions.delete;

    // Handle extension dialog
    const openExtensionDialog = () => {
        if (!canExtend) {
            toast.error(`Cannot extend a ${rental.status} rental`);
            return;
        }
        setIsExtensionDialogOpen(true);
    };

    // Handle quotation generation
    const handleGenerateQuotation = () => {
        if (!permissions.generate_invoice) {
            toast.error("You don't have permission to generate quotations");
            return;
        }

        setIsGeneratingQuotation(true);

        // In a real app, this would be an API call
        setTimeout(() => {
            toast.success('Quotation generated successfully');
            setIsGeneratingQuotation(false);
            // Reload the page to show updated workflow and let backend handle redirect
            window.location.reload();
        }, 1500);
    };

    // Handle delete rental
    const handleDeleteRental = () => {
        // In a real app, this would be an API call or use Inertia.delete
        if (onDelete) {
            onDelete();
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('ttl_rental_actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    {permissions.update && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/rentals/${rental.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('ttl_edit_rental')}
                            </a>
                        </Button>
                    )}

                    {canExtend && (
                        <Button variant="outline" size="sm" onClick={openExtensionDialog}>
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Extend Rental
                        </Button>
                    )}

                    {permissions.generate_invoice && (
                        <Button variant="outline" size="sm" onClick={handleGenerateQuotation} disabled={isGeneratingQuotation}>
                            {isGeneratingQuotation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            Generate Quotation
                        </Button>
                    )}

                    <Button variant="outline" size="sm" asChild>
                        <a href={`/rentals/${rental.id}/print`}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Details
                        </a>
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                            <Zap className="mr-2 h-4 w-4" />
                            More Actions
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={onShareRental}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Rental
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <a href={`/rentals/${rental.id}/timesheets`}>
                                <Clock className="mr-2 h-4 w-4" />
                                {t('employee:btn_view_timesheets')}
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                Inertia.post(route('rentals.create-invoice', rental.id));
                            }}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Create Invoice
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {canDelete && (
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Rental
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the rental and all associated data. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteRental} className="text-destructive-foreground bg-destructive">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>

            {/* Extension Dialog */}
            <RentalExtensionDialog
                rentalId={rental.id}
                currentEndDate={rental.expected_end_date || new Date()}
                isOpen={isExtensionDialogOpen}
                onClose={() => setIsExtensionDialogOpen(false)}
                onSuccess={() => {
                    if (onExtensionSuccess) onExtensionSuccess();
                }}
            />
        </Card>
    );
};

export default RentalActionsCard;
