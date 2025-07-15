import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Incident {
  id: number;
  date: string;
  location: string;
  description: string;
  severity: string;
  status: string;
  photos?: string[];
}

interface Props {
  incident: Incident;
}

const IncidentsShow: React.FC<Props> = ({ incident }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:incidents.details')}</h1>
      <div className="mb-2"><b>{t('safety:incidents.date')}:</b> {incident.date}</div>
      <div className="mb-2"><b>{t('safety:incidents.location')}:</b> {incident.location}</div>
      <div className="mb-2"><b>{t('safety:incidents.severity')}:</b> {t(`safety:incidents.severity_${incident.severity}`)}</div>
      <div className="mb-2"><b>{t('safety:incidents.status')}:</b> {t(`safety:incidents.status_${incident.status}`)}</div>
      <div className="mb-2"><b>{t('safety:incidents.description')}:</b> {incident.description}</div>
      {incident.photos && incident.photos.length > 0 && (
        <div className="mb-2">
          <b>{t('safety:incidents.photos')}:</b>
          <div className="flex gap-2 mt-1">
            {incident.photos.map((url, idx) => (
              <img key={idx} src={url} alt="Incident" className="w-24 h-24 object-cover rounded" />
            ))}
          </div>
        </div>
      )}
      <Button href={`/safety/incidents/${incident.id}/edit`} className="mt-4 w-full">{t('safety:incidents.edit')}</Button>
    </Card>
  );
};

export default IncidentsShow;
