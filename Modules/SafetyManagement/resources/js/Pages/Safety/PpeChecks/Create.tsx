import AppLayout from '@/Core/layouts/AppLayout';
import { Card, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PpeChecksCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Card className="mx-auto max-w-xl p-6">
                <h1 className="mb-4 text-2xl font-bold">{t('safety:ppe_checks.create')}</h1>
                {/* PPE Check form goes here */}
                <form>
                    <div className="mb-4">
                        <label className="block mb-1">{t('safety:ppe_checks.check_date')}</label>
                        <input type="date" className="w-full border rounded px-3 py-2" />
                    </div>
                    <Button type="submit" className="mt-4 w-full">{t('safety:ppe_checks.save')}</Button>
                </form>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/safety/ppe-checks">{t('common:back')}</Link>
                    </Button>
                </div>
            </Card>
        </AppLayout>
    );
};

export default PpeChecksCreate;
