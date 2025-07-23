import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Core/Components/ui';

const SafetyActionsCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:safety_actions.create')}</h1>
            {/* Safety Action form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:safety_actions.save')}
            </Button>
        </Card>
    );
};

export default SafetyActionsCreate;
