import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { format, addDays } from "date-fns";
import { router } from "@inertiajs/react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import ToastManager from "@/utils/toast-manager";

interface RentalExtensionDialogProps {
  rentalId: number;
  currentEndDate: Date | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RentalExtensionDialog({
  rentalId,
  currentEndDate,
  isOpen,
  onClose,
  onSuccess
}: RentalExtensionDialogProps) {
  const { t } = useTranslation('rental');

  const [newEndDate, setNewEndDate] = useState<Date | undefined>(
    typeof currentEndDate === 'string'
      ? addDays(new Date(currentEndDate), 7)
      : addDays(currentEndDate, 7)
  );
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      const endDate = typeof currentEndDate === 'string'
        ? new Date(currentEndDate)
        : currentEndDate;

      setNewEndDate(addDays(endDate, 7));
      setReason("");
      setIsSubmitting(false);
    }
  }, [isOpen, currentEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newEndDate) {
      ToastManager.error("Please select a new end date");
      return;
    }

    if (!reason.trim() || reason.length < 10) {
      ToastManager.error("Please provide a reason (minimum 10 characters)");
      return;
    }

    setIsSubmitting(true);

    const requestData = {
      new_end_date: format(newEndDate, 'yyyy-MM-dd'),
      reason: reason,
      keep_operators: true // Default to keeping operators
    };

    // Send extension request to server
    axios.post(route('rentals.request-extension', rentalId), requestData)
      .then(response => {
        ToastManager.success("Rental extension requested successfully");
        onClose();
        if (onSuccess) onSuccess();
      })
      .catch(error => {
        console.error('Extension error:', error);
        const errorMessage = error.response?.data?.message || "Failed to extend rental";
        ToastManager.error(errorMessage);
        setIsSubmitting(false);
      })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('ttl_request_rental_extension')}</DialogTitle>
          <DialogDescription>
            Extend the rental period by selecting a new end date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-end-date" className="text-right col-span-1">
                {t('lbl_new_end_date')}
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="new-end-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEndDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEndDate ? format(newEndDate, "PPP") : <span>{t('pick_a_date')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEndDate}
                      onSelect={setNewEndDate}
                      initialFocus
                      disabled={(date) => {
                        // Disable dates before today
                        return date < new Date();
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right col-span-1">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="col-span-3"
                placeholder={t('ph_reason_for_extension')}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Extension
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


