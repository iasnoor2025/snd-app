import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Table } from '@/../../Modules/Core/resources/js/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Risk {
  id: number;
  title: string;
  risk_score: number;
  status: string;
}

interface Props {
  risks: Risk[];
}

const RisksIndex: React.FC<Props> = ({ risks }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('safety:risks.title')}</h1>
        <Button href="/safety/risks/create">{t('safety:risks.create')}</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>{t('safety:risks.title')}</th>
            <th>{t('safety:risks.risk_score')}</th>
            <th>{t('safety:risks.status')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.id}>
              <td>{risk.title}</td>
              <td>{risk.risk_score}</td>
              <td>{t(`safety:risks.status_${risk.status}`)}</td>
              <td>
                <Button href={`/safety/risks/${risk.id}`}>{t('safety:risks.view')}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default RisksIndex;
