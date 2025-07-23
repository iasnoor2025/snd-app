import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Core/Components/ui';

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
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:safety_actions.edit')}</h1>
            {/* Safety Action edit form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:safety_actions.save')}
            </Button>
        </Card>
    );
};

export default SafetyActionsEdit;
