import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TrainingCreate: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:training.create')}</h1>
      {/* Training form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:training.save')}</Button>
    </Card>
  );
};

export default TrainingCreate;
