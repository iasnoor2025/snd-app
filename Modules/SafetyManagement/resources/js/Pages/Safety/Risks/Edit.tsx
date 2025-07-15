import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

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

const RisksEdit: React.FC<Props> = ({ risk }) => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:risks.edit')}</h1>
            {/* Risk edit form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:risks.save')}
            </Button>
        </Card>
    );
};

export default RisksEdit;
