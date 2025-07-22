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

const PpeChecksEdit: React.FC<Props> = ({ ppeCheck }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:ppe_checks.edit')}</h1>
            {/* PPE Check edit form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:ppe_checks.save')}
            </Button>
        </Card>
    );
};

export default PpeChecksEdit;
