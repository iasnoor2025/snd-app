import React from 'react';
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
        <Label htmlFor="equipment_ids">{t('equipment')}</Label>
        <div className="space-y-2">
          <Select
            value={undefined}
            onValueChange={addEquipment}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('select_equipment')} />
            </SelectTrigger>
            <SelectContent>
              {equipment
                .filter(item => !data.equipment_ids.includes(item.id.toString()))
                .map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.equipment_ids.map((id) => {
              const item = equipment.find(e => e.id.toString() === id);
              return item ? (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {item.name}
                  <button
                    type="button"
                    onClick={() => removeEquipment(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
        {errors.equipment_ids && (
          <p className="text-sm text-red-600">{errors.equipment_ids}</p>
        )}
      </div>

      <div>
        <Label htmlFor="operator_ids">{t('operators')}</Label>
        <div className="space-y-2">
          <Select
            value={undefined}
            onValueChange={addOperator}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('select_operators')} />
            </SelectTrigger>
            <SelectContent>
              {employees
                .filter(emp => !data.operator_ids.includes(emp.id.toString()))
                .map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.operator_ids.map((id) => {
              const emp = employees.find(e => e.id.toString() === id);
              return emp ? (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {emp.name}
                  <button
                    type="button"
                    onClick={() => removeOperator(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
        {errors.operator_ids && (
          <p className="text-sm text-red-600">{errors.operator_ids}</p>
        )}
      </div>

      <div>
        <Label htmlFor="start_date">{t('start_date')}</Label>
        <DatePicker
          value={data.start_date}
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














