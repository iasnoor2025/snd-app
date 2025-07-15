import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Table } from '@/../../Modules/Core/resources/js/components/ui/table';
import { Button } from '@/Core/components/ui/button';
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
  incidents: Incident[];
}

const IncidentsIndex: React.FC<Props> = ({ incidents }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('safety:incidents.title')}</h1>
        <Button href="/safety/incidents/create">{t('safety:incidents.create')}</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>{t('safety:incidents.date')}</th>
            <th>{t('safety:incidents.location')}</th>
            <th>{t('safety:incidents.severity')}</th>
            <th>{t('safety:incidents.status')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.date}</td>
              <td>{incident.location}</td>
              <td>{t(`safety:incidents.severity_${incident.severity}`)}</td>
              <td>{t(`safety:incidents.status_${incident.status}`)}</td>
              <td>
                <Button href={`/safety/incidents/${incident.id}`}>{t('safety:incidents.view')}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default IncidentsIndex;
