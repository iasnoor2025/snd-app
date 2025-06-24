import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from '@inertiajs/react';
import { EquipmentToastService } from '../../services/EquipmentToastService';
import { Button } from '@/Core';
import { Input } from '@/Core';
import { Label } from '@/Core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import { DatePicker } from '@/Core';
import { Textarea } from '@/Core';

interface EquipmentFormProps {
  form: UseFormReturn<{
    name: string;
    description: string;
    category: string;
    daily_rate: number;
    weekly_rate: number;
    monthly_rate: number;
    status: 'available' | 'rented' | 'maintenance' | 'retired';
    serial_number: string;
    purchase_date: string;
    last_maintenance_date: string;
    notes: string;
  }>;
  onSubmit: () => Promise<void>;
  submitLabel: string;
}

export const EquipmentForm: FC<EquipmentFormProps> = ({ form, onSubmit, submitLabel }) => {
  const { t } = useTranslation('equipment');
  const { data, setData, errors, processing } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!data.name) {
      EquipmentToastService.equipmentValidationError('name');
      return;
    }
    if (!data.category) {
      EquipmentToastService.equipmentValidationError('category');
      return;
    }
    if (!data.serial_number) {
      EquipmentToastService.equipmentValidationError('serial number');
      return;
    }
    if (!data.purchase_date) {
      EquipmentToastService.equipmentValidationError('purchase date');
      return;
    }

    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          error={errors.name}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          error={errors.description}
        />
      </div>

      <div>
        <Label htmlFor="category">{t('category')}</Label>
        <Select
          value={data.category}
          onValueChange={(value) => setData('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select_category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="heavy">{t('heavy_equipment')}</SelectItem>
            <SelectItem value="light">{t('light_equipment')}</SelectItem>
            <SelectItem value="tools">{t('tools')}</SelectItem>
            <SelectItem value="vehicles">{t('vehicles')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="daily_rate">{t('daily_rate')}</Label>
          <Input
            id="daily_rate"
            type="number"
            min="0"
            step="0.01"
            value={data.daily_rate}
            onChange={(e) => setData('daily_rate', parseFloat(e.target.value))}
            error={errors.daily_rate}
          />
        </div>

        <div>
          <Label htmlFor="weekly_rate">{t('weekly_rate')}</Label>
          <Input
            id="weekly_rate"
            type="number"
            min="0"
            step="0.01"
            value={data.weekly_rate}
            onChange={(e) => setData('weekly_rate', parseFloat(e.target.value))}
            error={errors.weekly_rate}
          />
        </div>

        <div>
          <Label htmlFor="monthly_rate">{t('monthly_rate')}</Label>
          <Input
            id="monthly_rate"
            type="number"
            min="0"
            step="0.01"
            value={data.monthly_rate}
            onChange={(e) => setData('monthly_rate', parseFloat(e.target.value))}
            error={errors.monthly_rate}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">{t('status')}</Label>
        <Select
          value={data.status}
          onValueChange={(value) => setData('status', value as typeof data.status)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{t('available')}</SelectItem>
            <SelectItem value="rented">{t('rented')}</SelectItem>
            <SelectItem value="maintenance">{t('maintenance')}</SelectItem>
            <SelectItem value="retired">{t('retired')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-600">{errors.status}</p>
        )}
      </div>

      <div>
        <Label htmlFor="serial_number">{t('serial_number')}</Label>
        <Input
          id="serial_number"
          type="text"
          value={data.serial_number}
          onChange={(e) => setData('serial_number', e.target.value)}
          error={errors.serial_number}
          required
        />
      </div>

      <div>
        <Label htmlFor="purchase_date">{t('purchase_date')}</Label>
        <DatePicker
          value={data.purchase_date}
          onChange={(date) => setData('purchase_date', date)}
        />
        {errors.purchase_date && (
          <p className="text-sm text-red-600">{errors.purchase_date}</p>
        )}
      </div>

      <div>
        <Label htmlFor="last_maintenance_date">{t('last_maintenance_date')}</Label>
        <DatePicker
          value={data.last_maintenance_date}
          onChange={(date) => setData('last_maintenance_date', date)}
        />
        {errors.last_maintenance_date && (
          <p className="text-sm text-red-600">{errors.last_maintenance_date}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
          error={errors.notes}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={processing}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

















