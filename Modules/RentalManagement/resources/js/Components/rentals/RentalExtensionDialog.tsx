import {
    Button,
    Calendar,
    cn,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Textarea,
    ToastManager,
} from '@/Core';
import axios from 'axios';
import { addDays, format, isValid as isValidDateFns } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RentalExtensionDialogProps {
    rentalId: number;
    currentEndDate: Date | string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Helper to safely format dates
function safeFormat(date: Date | string | undefined, fmt: string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return isValidDateFns(d) ? format(d, fmt) : '';
}

export default function RentalExtensionDialog({ rentalId, currentEndDate, isOpen, onClose, onSuccess }: RentalExtensionDialogProps) {
    const { t } = useTranslation('rental');

    const [newEndDate, setNewEndDate] = useState<Date | undefined>(
        typeof currentEndDate === 'string' ? addDays(new Date(currentEndDate), 7) : addDays(currentEndDate, 7),
    );
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            const endDate = typeof currentEndDate === 'string' ? new Date(currentEndDate) : currentEndDate;

            setNewEndDate(addDays(endDate, 7));
            setReason('');
            setIsSubmitting(false);
        }
    }, [isOpen, currentEndDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!newEndDate || !isValidDateFns(newEndDate)) {
            ToastManager.error('Please select a valid new end date');
            return;
        }

        if (!reason.trim() || reason.length < 10) {
            ToastManager.error('Please provide a reason (minimum 10 characters)');
            return;
        }

        setIsSubmitting(true);

        const requestData = {
            new_end_date: safeFormat(newEndDate, 'yyyy-MM-dd'),
            reason: reason,
            keep_operators: true, // Default to keeping operators
        };

        // Send extension request to server
        axios
            .post(route('rentals.request-extension', rentalId), requestData)
            .then((response) => {
                ToastManager.success('Rental extension requested successfully');
                onClose();
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                console.error('Extension error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to extend rental';
                ToastManager.error(errorMessage);
                setIsSubmitting(false);
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{t('ttl_request_rental_extension')}</DialogTitle>
                    <DialogDescription>Extend the rental period by selecting a new end date.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-end-date" className="col-span-1 text-right">
                                {t('lbl_new_end_date')}
                            </Label>
                            <div className="col-span-3">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="new-end-date"
                                            variant={'outline'}
                                            className={cn('w-full justify-start text-left font-normal', !newEndDate && 'text-muted-foreground')}
                                            disabled={isSubmitting}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newEndDate ? safeFormat(newEndDate, 'PPP') : <span>{t('pick_a_date')}</span>}
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
                            <Label htmlFor="reason" className="col-span-1 text-right">
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
