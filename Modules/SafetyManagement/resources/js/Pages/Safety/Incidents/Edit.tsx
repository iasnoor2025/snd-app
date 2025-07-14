import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Incident {
  id: number;
  date: string;
  location: string;
  description: string;
  severity: string;
  status: string;
}

interface Props {
  incident: Incident;
}

const IncidentsEdit: React.FC<Props> = ({ incident }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:incidents.edit')}</h1>
      {/* Incident edit form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:incidents.save')}</Button>
    </Card>
  );
};

export default IncidentsEdit;
