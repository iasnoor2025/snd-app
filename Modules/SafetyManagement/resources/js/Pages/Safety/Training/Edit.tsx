import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface TrainingRecord {
  id: number;
  date: string;
  expiry_date?: string;
  notes?: string;
}

interface Props {
  trainingRecord: TrainingRecord;
}

const TrainingEdit: React.FC<Props> = ({ trainingRecord }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:training.edit')}</h1>
      {/* Training edit form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:training.save')}</Button>
    </Card>
  );
};

export default TrainingEdit;
