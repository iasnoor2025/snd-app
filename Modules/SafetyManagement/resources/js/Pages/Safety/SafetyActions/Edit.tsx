import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
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

const SafetyActionsEdit: React.FC<Props> = ({ safetyAction }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:safety_actions.edit')}</h1>
      {/* Safety Action edit form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:safety_actions.save')}</Button>
    </Card>
  );
};

export default SafetyActionsEdit;
