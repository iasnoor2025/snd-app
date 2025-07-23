import { Card, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

const IncidentsCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:incidents.create')}</h1>
            {/* Incident form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:incidents.save')}
            </Button>
        </Card>
    );
};

export default IncidentsCreate;
