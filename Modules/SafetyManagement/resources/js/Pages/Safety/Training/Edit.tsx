import { Card, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface TrainingRecord {
    id: number;
    date: string;
    expiry_date?: string;
    notes?: string;
}

interface Props {
    trainingRecord: TrainingRecord;
}

const TrainingEdit: React.FC<Props> = ({ trainingRecord }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:training.edit')}</h1>
            {/* Training edit form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:training.save')}
            </Button>
        </Card>
    );
};

export default TrainingEdit;
