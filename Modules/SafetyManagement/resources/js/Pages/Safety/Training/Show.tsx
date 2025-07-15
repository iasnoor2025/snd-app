import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
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

const TrainingShow: React.FC<Props> = ({ trainingRecord }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:training.details')}</h1>
      <div className="mb-2"><b>{t('safety:training.date')}:</b> {trainingRecord.date}</div>
      {trainingRecord.expiry_date && <div className="mb-2"><b>{t('safety:training.expiry_date')}:</b> {trainingRecord.expiry_date}</div>}
      {trainingRecord.notes && <div className="mb-2"><b>{t('safety:training.notes')}:</b> {trainingRecord.notes}</div>}
      <Button href={`/safety/training-records/${trainingRecord.id}/edit`} className="mt-4 w-full">{t('safety:training.edit')}</Button>
    </Card>
  );
};

export default TrainingShow;
