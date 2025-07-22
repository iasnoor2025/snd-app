import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Core/components/ui';

interface TrainingRecord {
    id: number;
    date: string;
    expiry_date?: string;
    notes?: string;
}

interface Props {
    trainingRecord: TrainingRecord;
}

const TrainingShow: React.FC<Props> = ({ trainingRecord }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:training.details')}</h1>
            <div className="mb-2">
                <b>{t('safety:training.date')}:</b> {trainingRecord.date}
            </div>
            {trainingRecord.expiry_date && (
                <div className="mb-2">
                    <b>{t('safety:training.expiry_date')}:</b> {trainingRecord.expiry_date}
                </div>
            )}
            {trainingRecord.notes && (
                <div className="mb-2">
                    <b>{t('safety:training.notes')}:</b> {trainingRecord.notes}
                </div>
            )}
            <Button href={`/safety/training-records/${trainingRecord.id}/edit`} className="mt-4 w-full">
                {t('safety:training.edit')}
            </Button>
        </Card>
    );
};

export default TrainingShow;
