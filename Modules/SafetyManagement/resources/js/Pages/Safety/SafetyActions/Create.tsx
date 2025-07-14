import React from 'react';
import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const SafetyActionsCreate: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('safety:safety_actions.create')}</h1>
      {/* Safety Action form goes here */}
      <Button type="submit" className="mt-4 w-full">{t('safety:safety_actions.save')}</Button>
    </Card>
  );
};

export default SafetyActionsCreate;
