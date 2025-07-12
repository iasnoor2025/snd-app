import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const InspectionsCreate: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:inspections.create')}</h1>
      {/* Inspection form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:inspections.save')}</Button>
    </Card>
  );
};

export default InspectionsCreate;
