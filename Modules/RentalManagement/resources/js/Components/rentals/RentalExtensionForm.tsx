import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Calendar,
    cn,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from '@/Core';
import { router, useForm } from '@inertiajs/react';
import { addDays, format } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon, Loader2, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

interface AdditionalEquipment {
    equipment_id: string;
    quantity: number;
    needs_operator: boolean;
    operator_id?: number;
}

interface RentalExtensionFormProps {
    rentalId: number;
    currentEndDate: string;
    hasOperators: boolean;
    availableEquipment: Array<{
        id: string;
        name: string;
        type: string;
        model?: string;
        daily_rate?: number;
    }>;
    availableOperators?: Array<{
        id: number;
        name: string;
        license_number: string;
        specialization: string;
    }>;
    onSuccess?: () => void;
    onCancel?: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    new_end_date: z
        .date({ required_error: 'New end date is required' })
        .refine((date) => date > new Date(), {
            message: 'New end date must be in the future',
        })
        .refine((date) => date > new Date(rental.expected_end_date), {
            message: 'New end date must be after the current end date',
        }),
    reason: z.string().min(1, 'Reason is required'),
    additional_equipment: z
        .array(
            z.object({
                equipment_id: z.number().min(1, 'Equipment is required'),
                quantity: z.number().min(1, 'Quantity must be at least 1'),
                daily_rate: z.number().min(0, 'Daily rate must be 0 or greater'),
                operator_id: z.number().nullable(),
            }),
        )
        .optional(),
});

/**
 * Component for requesting an extension to a rental period
 */
const RentalExtensionForm = ({
    rentalId,
    currentEndDate,
    hasOperators,
    availableEquipment,
    availableOperators,
    onSuccess,
    onCancel,
    isOpen,
    onOpenChange,
}: RentalExtensionFormProps) => {
    const { t } = useTranslation('rental');

    const [newEndDate, setNewEndDate] = useState<Date | undefined>(currentEndDate ? addDays(new Date(currentEndDate), 7) : undefined);
    const [reason, setReason] = useState('');
    const [keepOperators, setKeepOperators] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [additionalEquipment, setAdditionalEquipment] = useState<AdditionalEquipment[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const inertiaForm = useForm();

    const handleAddEquipment = () => {
        setAdditionalEquipment([...additionalEquipment, { equipment_id: '', quantity: 1, needs_operator: false }]);
    };

    const handleRemoveEquipment = (index: number) => {
        setAdditionalEquipment(additionalEquipment.filter((_, i) => i !== index));
    };

    const handleEquipmentChange = (index: number, field: keyof AdditionalEquipment, value: any) => {
        const updatedEquipment = [...additionalEquipment];
        updatedEquipment[index] = {
            ...updatedEquipment[index],
            [field]: value,
        };
        setAdditionalEquipment(updatedEquipment);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!newEndDate) {
            setFormError('New end date is required');
            setIsSubmitting(false);
            return;
        }

        if (reason.trim() === '') {
            setFormError('Reason is required');
            setIsSubmitting(false);
            return;
        }

        // Calculate extension period
        const startDate = new Date(currentEndDate);
        const endDate = newEndDate;
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            setFormError('New end date must be after the current end date');
            setIsSubmitting(false);
            return;
        }

        // Validate equipment availability
        if (additionalEquipment && additionalEquipment.length > 0) {
            const unavailableEquipment = additionalEquipment.filter((item) => {
                const equipment = availableEquipment.find((e) => e.id === item.equipment_id);
                return !equipment; // Simplified check since status might not be in the data
            });

            if (unavailableEquipment.length > 0) {
                toast.error('Some selected equipment is not available');
                setIsSubmitting(false);
                return;
            }
        }

        // Validate operator availability if needed
        if (additionalEquipment && additionalEquipment.length > 0) {
            const itemsNeedingOperators = additionalEquipment.filter((item) => item.needs_operator && item.operator_id);
            if (itemsNeedingOperators.length > 0 && availableOperators) {
                const unavailableOperators = itemsNeedingOperators.filter((item) => {
                    const operator = availableOperators.find((op) => op.id === item.operator_id);
                    return !operator; // Simplified check
                });

                if (unavailableOperators.length > 0) {
                    toast.error('Some selected operators are not available');
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        try {
            // Format the data for submission
            const formData = {
                rental_id: rentalId,
                new_end_date: format(newEndDate, 'yyyy-MM-dd'),
                reason: reason,
                days: days,
                keep_operators: keepOperators,
                additional_equipment: additionalEquipment,
            };

            // Submit using inertia router
            router.post(route('rental-extensions.store'), formData, {
                onSuccess: () => {
                    toast.success('Rental extension requested successfully');
                    onSuccess?.();
                    onOpenChange(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    const errorMessage = Object.values(errors).join(', ');
                    setFormError(errorMessage || 'Failed to submit request');
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error(error);
            setFormError('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_request_rental_extension')}</DialogTitle>
                        <DialogDescription>Request an extension for this rental. Please provide a new end date and reason.</DialogDescription>
                    </DialogHeader>

                    {formError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-end-date">{t('lbl_current_end_date')}</Label>
                            <Input id="current-end-date" value={format(new Date(currentEndDate), 'MMMM d, yyyy')} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-end-date">{t('lbl_new_end_date')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="new-end-date"
                                        variant="outline"
                                        className={cn('justify-start text-left font-normal', !newEndDate && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newEndDate ? format(newEndDate, 'MMMM d, yyyy') : <span>{t('pick_a_date')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={newEndDate}
                                        onSelect={setNewEndDate}
                                        initialFocus
                                        disabled={(date) => date <= new Date(currentEndDate)}
                                    />
                                </PopoverContent>
                            </Popover>
                            {!newEndDate && <p className="mt-1 text-xs text-red-500">Required: Please select a future date</p>}
                            {newEndDate && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Extension duration:{' '}
                                    {Math.round((newEndDate.getTime() - new Date(currentEndDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">{t('lbl_reason_for_extension')}</Label>
                            <Textarea
                                id="reason"
                                placeholder={t('ph_please_explain_why_you_need_to_extend_this_rent')}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className={!reason.trim() ? 'border-red-300 focus:ring-red-500' : ''}
                            />
                            {!reason.trim() && <p className="mt-1 text-xs text-red-500">{t('please_provide_a_reason_for_the_extension')}</p>}
                            {reason.trim().length < 10 && reason.trim().length > 0 && (
                                <p className="mt-1 text-xs text-amber-500">Reason must be at least 10 characters</p>
                            )}
                        </div>
                        {hasOperators && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>{t('lbl_keep_current_operators')}</Label>
                                    <div className="text-[0.8rem] text-muted-foreground">Maintain the same operators for the extended period</div>
                                </div>
                                <Switch checked={keepOperators} onCheckedChange={setKeepOperators} />
                            </div>
                        )}

                        {/* Additional Equipment Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>{t('lbl_additional_equipment')}</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddEquipment}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('project:ttl_add_equipment')}
                                </Button>
                            </div>

                            {additionalEquipment.map((item, index) => (
                                <div key={index} className="grid gap-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Equipment {index + 1}</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEquipment(index)}>
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('lbl_equipment_type')}</Label>
                                            <Select
                                                value={item.equipment_id}
                                                onValueChange={(value) => handleEquipmentChange(index, 'equipment_id', value)}
                                            >
                                                <SelectTrigger className={!item.equipment_id ? 'border-red-300 focus:ring-red-500' : ''}>
                                                    <SelectValue placeholder={t('ph_select_equipment')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableEquipment.map((eq) => (
                                                        <SelectItem key={eq.id} value={eq.id}>
                                                            {eq.name} {eq.model ? `- ${eq.model}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!item.equipment_id && <p className="mt-1 text-xs text-red-500">Required</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleEquipmentChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('lbl_needs_operator')}</Label>
                                            <div className="text-[0.8rem] text-muted-foreground">Request an operator for this equipment</div>
                                        </div>
                                        <Switch
                                            checked={item.needs_operator}
                                            onCheckedChange={(checked) => handleEquipmentChange(index, 'needs_operator', checked)}
                                        />
                                    </div>

                                    {item.needs_operator && availableOperators && availableOperators.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>{t('lbl_select_operator')}</Label>
                                            <Select
                                                value={item.operator_id?.toString() || ''}
                                                onValueChange={(value) => handleEquipmentChange(index, 'operator_id', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('ph_select_an_operator')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableOperators.map((operator) => (
                                                        <SelectItem key={operator.id} value={operator.id.toString()}>
                                                            {operator.name} - {operator.specialization}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !newEndDate ||
                                !reason.trim() ||
                                reason.trim().length < 10 ||
                                (additionalEquipment.length > 0 && additionalEquipment.some((item) => !item.equipment_id))
                            }
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-1">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RentalExtensionForm;
