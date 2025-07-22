import { Card, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface PpeCheck {
    id: number;
    check_date: string;
    status: string;
    notes?: string;
}

interface Props {
    ppeCheck: PpeCheck;
}

const PpeChecksShow: React.FC<Props> = ({ ppeCheck }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:ppe_checks.details')}</h1>
            <div className="mb-2">
                <b>{t('safety:ppe_checks.check_date')}:</b> {ppeCheck.check_date}
            </div>
            <div className="mb-2">
                <b>{t('safety:ppe_checks.status')}:</b> {t(`safety:ppe_checks.status_${ppeCheck.status}`)}
            </div>
            {ppeCheck.notes && (
                <div className="mb-2">
                    <b>{t('safety:ppe_checks.notes')}:</b> {ppeCheck.notes}
                </div>
            )}
            <Button href={`/safety/ppe-checks/${ppeCheck.id}/edit`} className="mt-4 w-full">
                {t('safety:ppe_checks.edit')}
            </Button>
        </Card>
    );
};

export default PpeChecksShow;
