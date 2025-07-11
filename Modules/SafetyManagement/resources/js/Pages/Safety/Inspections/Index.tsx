import React from 'react';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Inspection {
  id: number;
  scheduled_date: string;
  status: string;
}

interface Props {
  inspections: Inspection[];
}

const InspectionsIndex: React.FC<Props> = ({ inspections }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('safety:inspections.title')}</h1>
        <Button href="/safety/inspections/create">{t('safety:inspections.create')}</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>{t('safety:inspections.scheduled_date')}</th>
            <th>{t('safety:inspections.status')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((inspection) => (
            <tr key={inspection.id}>
              <td>{inspection.scheduled_date}</td>
              <td>{t(`safety:inspections.status_${inspection.status}`)}</td>
              <td>
                <Button href={`/safety/inspections/${inspection.id}`}>{t('safety:inspections.view')}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default InspectionsIndex;
