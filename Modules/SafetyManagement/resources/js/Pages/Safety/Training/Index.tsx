import React from 'react';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface TrainingRecord {
  id: number;
  date: string;
  expiry_date?: string;
  notes?: string;
}

interface Props {
  records: TrainingRecord[];
}

const TrainingIndex: React.FC<Props> = ({ records }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('safety:training.title')}</h1>
        <Button href="/safety/training-records/create">{t('safety:training.create')}</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>{t('safety:training.date')}</th>
            <th>{t('safety:training.expiry_date')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.expiry_date}</td>
              <td>
                <Button href={`/safety/training-records/${record.id}`}>{t('safety:training.view')}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default TrainingIndex;
