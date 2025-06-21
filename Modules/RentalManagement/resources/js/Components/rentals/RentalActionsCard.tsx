import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Core";
import { Button } from "@/Core";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Core";
import { Loader2, ChevronDown, CalendarPlus, FileText, Trash, Printer, Clock, CreditCard, Pencil, Share2, Zap } from "lucide-react";
import { Link } from "@inertiajs/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Core";
import { toast } from "sonner";
import RentalExtensionDialog from "./RentalExtensionDialog";

interface RentalActionsCardProps {
  rental: {
    id: number;
    rental_number: string;
    status: string;
    expected_end_date?: string;
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

const RentalActionsCard: React.FC<RentalActionsCardProps> = ({
  rental,
  permissions,
  onExtensionSuccess,
  onDelete,
  onShareRental
}) => {
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);

  // Check if rental status allows extensions
  const canExtend = ['active', 'pending'].includes(rental.status.toLowerCase()) && permissions.request_extension;

  // Check if rental can be deleted
  const canDelete = !['completed', 'invoiced'].includes(rental.status.toLowerCase()) && permissions.delete;

  // Handle extension dialog
  const openExtensionDialog = () => {
  const { t } = useTranslation('rental');

    if (!canExtend) {
      ToastManager.error(`Cannot extend a ${rental.status} rental`);
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
      toast.success("Quotation generated successfully");
      setIsGeneratingQuotation(false);
      // Redirect to the quotation page
      window.location.href = `/rentals/${rental.id}/quotations`;
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
              <Link href={`/rentals/${rental.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('ttl_edit_rental')}
              </Link>
            </Button>
          )}

          {canExtend && (
            <Button variant="outline" size="sm" onClick={openExtensionDialog}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Extend Rental
            </Button>
          )}

          {permissions.generate_invoice && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateQuotation}
              disabled={isGeneratingQuotation}
            >
              {isGeneratingQuotation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generate Quotation
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href={`/rentals/${rental.id}/print`}>
              <Printer className="h-4 w-4 mr-2" />
              Print Details
            </Link>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              More Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={onShareRental}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Rental
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/rentals/${rental.id}/timesheets`}>
                <Clock className="h-4 w-4 mr-2" />
                {t('employee:btn_view_timesheets')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/rentals/${rental.id}/invoice/create`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {canDelete && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Rental
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the rental and all associated data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRental} className="bg-destructive text-destructive-foreground">
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
        currentEndDate={rental.expected_end_date}
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














