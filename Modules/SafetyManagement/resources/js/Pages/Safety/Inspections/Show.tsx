import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const InspectionsShow: React.FC<Props> = ({ inspection }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:inspections.details')}</h1>
      <div className="mb-2"><b>{t('safety:inspections.scheduled_date')}:</b> {inspection.scheduled_date}</div>
      {inspection.completed_date && <div className="mb-2"><b>{t('safety:inspections.completed_date')}:</b> {inspection.completed_date}</div>}
      <div className="mb-2"><b>{t('safety:inspections.status')}:</b> {t(`safety:inspections.status_${inspection.status}`)}</div>
      {inspection.findings && <div className="mb-2"><b>{t('safety:inspections.findings')}:</b> {inspection.findings}</div>}
      <Button href={`/safety/inspections/${inspection.id}/edit`} className="mt-4 w-full">{t('safety:inspections.edit')}</Button>
    </Card>
  );
};

export default InspectionsShow;
