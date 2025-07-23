import AppLayout from '@/Core/layouts/AppLayout';
import { Card, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const IncidentsCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Card className="mx-auto max-w-xl p-6">
                <h1 className="mb-4 text-2xl font-bold">{t('safety:incidents.create')}</h1>
                {/* Incident form goes here */}
                <form>
                    <div className="mb-4">
                        <label className="block mb-1">{t('safety:incidents.date')}</label>
                        <input type="date" className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">{t('safety:incidents.location')}</label>
                        <input type="text" className="w-full border rounded px-3 py-2" />
                    </div>
                    <Button type="submit" className="mt-4 w-full">{t('safety:incidents.save')}</Button>
                </form>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/safety/incidents">{t('common:back')}</Link>
                    </Button>
                </div>
            </Card>
        </AppLayout>
    );
};

export default IncidentsCreate;
