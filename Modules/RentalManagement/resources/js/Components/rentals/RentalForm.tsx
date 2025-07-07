import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { RentalToastService } from '../../services/RentalToastService';
import { Button } from '@/Core';
import { Input } from '@/Core';
import { Label } from '@/Core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import { DatePicker } from '@/Core';
import { Badge } from '@/Core';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

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
  const { t } = useTranslation('RentalManagement');
  const { data, setData, errors, processing } = useForm({
    rental_number: initialData.rental_number || '',
    customer_id: initialData.customer_id || '',
    equipment_ids: initialData.equipment_ids || [],
    operator_ids: initialData.operator_ids || [],
    start_date: initialData.start_date || '',
    expected_end_date: initialData.expected_end_date || '',
    notes: initialData.notes || '',
  });

  const [equipmentPrices, setEquipmentPrices] = useState<{ [id: string]: number | null }>({});
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Helper to fetch dynamic price for equipment
  const fetchDynamicPrice = async (equipmentId: string, days: number) => {
    setIsPriceLoading(true);
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rental_date: data.start_date || new Date().toISOString().slice(0, 10),
          duration: days,
          quantity: 1,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch dynamic price');
      const result = await response.json();
      return result.data?.final_price || null;
    } catch (err) {
      toast.error('Failed to calculate dynamic price');
      return null;
    } finally {
      setIsPriceLoading(false);
    }
  };

  // Update price when equipment, start_date, or expected_end_date changes
  useEffect(() => {
    const updatePrices = async () => {
      if (!data.start_date || !data.expected_end_date || !data.equipment_ids.length) return;
      const startDateObj = new Date(data.start_date);
      const endDateObj = new Date(data.expected_end_date);
      const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 0) return;
      const newPrices: { [id: string]: number | null } = {};
      for (const id of data.equipment_ids) {
        newPrices[id] = await fetchDynamicPrice(id, days);
      }
      setEquipmentPrices(newPrices);
    };
    updatePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.equipment_ids, data.start_date, data.expected_end_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!data.rental_number) {
      RentalToastService.rentalValidationError('rental number');
      return;
    }
    if (!data.customer_id) {
      RentalToastService.rentalValidationError('customer');
      return;
    }
    if (!data.equipment_ids.length) {
      RentalToastService.rentalValidationError('equipment');
      return;
    }
    if (!data.start_date) {
      RentalToastService.rentalValidationError('start date');
      return;
    }
    if (!data.expected_end_date) {
      RentalToastService.rentalValidationError('expected end date');
      return;
    }

    await onSubmit(data);
  };

  const addEquipment = (equipmentId: string) => {
    if (!data.equipment_ids.includes(equipmentId)) {
      setData('equipment_ids', [...data.equipment_ids, equipmentId]);
    }
  };

  const removeEquipment = (equipmentId: string) => {
    setData('equipment_ids', data.equipment_ids.filter(id => id !== equipmentId));
  };

  const addOperator = (operatorId: string) => {
    if (!data.operator_ids.includes(operatorId)) {
      setData('operator_ids', [...data.operator_ids, operatorId]);
    }
  };

  const removeOperator = (operatorId: string) => {
    setData('operator_ids', data.operator_ids.filter(id => id !== operatorId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="rental_number">{t('rental_number')}</Label>
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
        <Label htmlFor="customer_id">{t('customer')}</Label>
        <Select
          value={data.customer_id || undefined}
          onValueChange={(value) => setData('customer_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select_customer')} />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && (
          <p className="text-sm text-red-600">{errors.customer_id}</p>
        )}
      </div>

      <div>
        <Label htmlFor="start_date">{t('start_date')}</Label>
        <DatePicker
          value={formatDateMedium(data.start_date)}
          onChange={(date) => setData('start_date', date)}
        />
        {errors.start_date && (
          <p className="text-sm text-red-600">{errors.start_date}</p>
        )}
      </div>

      <div>
        <Label htmlFor="expected_end_date">{t('expected_end_date')}</Label>
        <DatePicker
          value={data.expected_end_date}
          onChange={(date) => setData('expected_end_date', date)}
        />
        {errors.expected_end_date && (
          <p className="text-sm text-red-600">{errors.expected_end_date}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">{t('notes')}</Label>
        <textarea
          id="notes"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          rows={4}
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={processing}
        >
          {isEditMode ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
};














