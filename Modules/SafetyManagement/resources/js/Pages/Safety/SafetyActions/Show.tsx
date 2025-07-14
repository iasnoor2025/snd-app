import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SafetyAction {
  id: number;
  due_date: string;
  status: string;
  action: string;
  completed_at?: string;
}

interface Props {
  safetyAction: SafetyAction;
}

const SafetyActionsShow: React.FC<Props> = ({ safetyAction }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:safety_actions.details')}</h1>
      <div className="mb-2"><b>{t('safety:safety_actions.due_date')}:</b> {safetyAction.due_date}</div>
      <div className="mb-2"><b>{t('safety:safety_actions.status')}:</b> {t(`safety:safety_actions.status_${safetyAction.status}`)}</div>
      <div className="mb-2"><b>{t('safety:safety_actions.action')}:</b> {safetyAction.action}</div>
      {safetyAction.completed_at && <div className="mb-2"><b>{t('safety:safety_actions.completed_at')}:</b> {safetyAction.completed_at}</div>}
      <Button href={`/safety/safety-actions/${safetyAction.id}/edit`} className="mt-4 w-full">{t('safety:safety_actions.edit')}</Button>
    </Card>
  );
};

export default SafetyActionsShow;
