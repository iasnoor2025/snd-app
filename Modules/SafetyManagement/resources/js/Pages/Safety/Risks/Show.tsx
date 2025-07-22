import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Core/components/ui';

interface Risk {
    id: number;
    title: string;
    risk_score: number;
    status: string;
    description: string;
}

interface Props {
    risk: Risk;
}

const RisksShow: React.FC<Props> = ({ risk }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:risks.details')}</h1>
            <div className="mb-2">
                <b>{t('safety:risks.title')}:</b> {risk.title}
            </div>
            <div className="mb-2">
                <b>{t('safety:risks.risk_score')}:</b> {risk.risk_score}
            </div>
            <div className="mb-2">
                <b>{t('safety:risks.status')}:</b> {t(`safety:risks.status_${risk.status}`)}
            </div>
            <div className="mb-2">
                <b>{t('safety:risks.description')}:</b> {risk.description}
            </div>
            <Button href={`/safety/risks/${risk.id}/edit`} className="mt-4 w-full">
                {t('safety:risks.edit')}
            </Button>
        </Card>
    );
};

export default RisksShow;
