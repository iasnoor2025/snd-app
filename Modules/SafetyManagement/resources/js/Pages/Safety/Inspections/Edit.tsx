import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Inspection {
  id: number;
  scheduled_date: string;
  completed_date?: string;
  status: string;
  findings?: string;
}

interface Props {
  inspection: Inspection;
}

const InspectionsEdit: React.FC<Props> = ({ inspection }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:inspections.edit')}</h1>
      {/* Inspection edit form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:inspections.save')}</Button>
    </Card>
  );
};

export default InspectionsEdit;
