import { Button, DatePicker, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { RentalToastService } from '../../services/RentalToastService';

interface RentalFormProps {
    customers: { id: number; name: string }[];
    equipment: { id: number; name: string }[];
    employees: { id: number; name: string }[];
    initialData?: any;
    isEditMode?: boolean;
    onSubmit: (values: any) => Promise<void>;
    onCancel: () => void;
}

export const RentalForm: React.FC<RentalFormProps> = ({
    customers,
    equipment,
    employees,
    initialData = {},
    isEditMode = false,
    onSubmit,
    onCancel,
}) => {
    const { t } = useTranslation(['common', 'fields', 'rentals']);
    const { data, setData, errors, processing } = useForm({
        rental_number: initialData.rental_number || '',
        customer_id: initialData.customer_id || '',
        start_date: initialData.start_date || '',
        expected_end_date: initialData.expected_end_date || '',
        notes: initialData.notes || '',
        equipment_ids: initialData.equipment_ids || [],
        operator_ids: initialData.operator_ids || [],
    });

    const [selectedEquipment, setSelectedEquipment] = useState<any[]>(
        initialData.equipment?.map((eq: any) => ({ id: eq.id, name: eq.name })) || [],
    );

    const [selectedOperators, setSelectedOperators] = useState<any[]>(
        initialData.operators?.map((op: any) => ({ id: op.id, name: op.name })) || [],
    );

    useEffect(() => {
        setData('equipment_ids', selectedEquipment.map((eq) => eq.id));
    }, [selectedEquipment]);

    useEffect(() => {
        setData('operator_ids', selectedOperators.map((op) => op.id));
    }, [selectedOperators]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(data);
            RentalToastService.success(
                isEditMode ? 'Rental updated successfully!' : 'Rental created successfully!',
            );
        } catch (error) {
            RentalToastService.error('Failed to save rental. Please try again.');
        }
    };

    const addEquipment = (equipmentId: string) => {
        const equipment = equipment.find((eq) => eq.id.toString() === equipmentId);
        if (equipment && !selectedEquipment.find((eq) => eq.id.toString() === equipmentId)) {
            setSelectedEquipment([...selectedEquipment, equipment]);
        }
    };

    const removeEquipment = (equipmentId: string) => {
        setSelectedEquipment(
            selectedEquipment.filter((eq) => eq.id.toString() !== equipmentId),
        );
    };

    const addOperator = (operatorId: string) => {
        const operator = employees.find((emp) => emp.id.toString() === operatorId);
        if (operator && !selectedOperators.find((op) => op.id.toString() === operatorId)) {
            setSelectedOperators([...selectedOperators, operator]);
        }
    };

    const removeOperator = (operatorId: string) => {
        setData(
            'operator_ids',
            data.operator_ids.filter((id) => id !== operatorId),
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="rental_number">{t('rentals:rental_number')}</Label>
                <Input
                    id="rental_number"
                    type="text"
                    value={data.rental_number}
                    onChange={(e) => setData('rental_number', e.target.value)}
                    error={errors.rental_number}
                    required
                />
            </div>

            <div>
                <Label htmlFor="customer_id">{t('rentals:customer')}</Label>
                <Select value={data.customer_id || undefined} onValueChange={(value) => setData('customer_id', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('rentals:select_customer')} />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
            </div>

            <div>
                <Label htmlFor="start_date">{t('fields:start_date')}</Label>
                <DatePicker value={formatDateMedium(data.start_date)} onChange={(date) => setData('start_date', date)} />
                {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
            </div>

            <div>
                <Label htmlFor="expected_end_date">{t('rentals:expected_end_date')}</Label>
                <DatePicker value={data.expected_end_date} onChange={(date) => setData('expected_end_date', date)} />
                {errors.expected_end_date && <p className="text-sm text-red-600">{errors.expected_end_date}</p>}
            </div>

            <div>
                <Label htmlFor="notes">{t('fields:notes')}</Label>
                <textarea
                    id="notes"
                    className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                    rows={4}
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                />
                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
            </div>

            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                    {t('common:cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                    {isEditMode ? t('common:update') : t('common:create')}
                </Button>
            </div>
        </form>
    );
};
