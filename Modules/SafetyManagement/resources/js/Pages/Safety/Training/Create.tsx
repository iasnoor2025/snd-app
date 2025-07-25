import { Card, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

const TrainingCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:training.create')}</h1>
            {/* Training form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:training.save')}
            </Button>
        </Card>
    );
};

export default TrainingCreate;
