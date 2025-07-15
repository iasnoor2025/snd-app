import { Input } from '@/Core';
import { ExpiryDateInputProps } from '@/Core/types/employee';
import { format, isBefore } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExpiryDateInput: React.FC<ExpiryDateInputProps> = ({ field, name }) => {
    const getExpiryDateStyle = (expiryDateStr: string | undefined | null) => {
        const { t } = useTranslation('employee');

        if (!expiryDateStr) return '';

        const expiryDate = new Date(expiryDateStr);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (isBefore(expiryDate, today)) {
            return 'border-red-500 focus-visible:ring-red-500';
        } else if (daysUntilExpiry <= 30) {
            return 'border-yellow-500 focus-visible:ring-yellow-500';
        }
        return '';
    };

    return <Input type="date" {...field} className={getExpiryDateStyle(field.value)} min={format(new Date(), 'yyyy-MM-dd')} />;
};
