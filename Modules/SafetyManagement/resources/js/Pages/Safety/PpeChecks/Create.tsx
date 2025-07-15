import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Core/components/ui/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PpeChecksCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:ppe_checks.create')}</h1>
            {/* PPE Check form goes here */}
            <Button type="submit" className="mt-4 w-full">
                {t('safety:ppe_checks.save')}
            </Button>
        </Card>
    );
};

export default PpeChecksCreate;
