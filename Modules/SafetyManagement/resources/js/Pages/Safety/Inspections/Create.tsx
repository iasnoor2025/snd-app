import AppLayout from '@/Core/layouts/AppLayout';
import { Card, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const InspectionsCreate: React.FC = () => {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Card className="mx-auto max-w-xl p-6">
                <h1 className="mb-4 text-2xl font-bold">{t('safety:inspections.create')}</h1>
                {/* Inspection form goes here */}
                <form>
                    <div className="mb-4">
                        <label className="block mb-1">{t('safety:inspections.scheduled_date')}</label>
                        <input type="date" className="w-full border rounded px-3 py-2" />
                    </div>
                    <Button type="submit" className="mt-4 w-full">{t('safety:inspections.save')}</Button>
                </form>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/safety/inspections">{t('common:back')}</Link>
                    </Button>
                </div>
            </Card>
        </AppLayout>
    );
};

export default InspectionsCreate;
