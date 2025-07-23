import { Card, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Incident {
    id: number;
    date: string;
    location: string;
    description: string;
    severity: string;
    status: string;
}

interface Props {
    incident: Incident;
}

const IncidentsEdit: React.FC<Props> = ({ incident }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:incidents.edit')}</h1>
            {/* Incident edit form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:incidents.save')}
            </Button>
        </Card>
    );
};

export default IncidentsEdit;
