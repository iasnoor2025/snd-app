import { Card, Table, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';

import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/Core/layouts/AppLayout';

interface Inspection {
    id: number;
    scheduled_date: string;
    status: string;
}

interface Props {
    inspections: Inspection[];
}

const InspectionsIndex: React.FC<Props> = ({ inspections }) => {
    const { t } = useTranslation();
    // Defensive: ensure inspections is always an array
    const safeInspections = Array.isArray(inspections) ? inspections : [];
    return (
        <AppLayout>
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('safety:inspections.title')}</h1>
                    <Button asChild>
                        <Link href="/safety/inspections/create">{t('safety:inspections.create')}</Link>
                    </Button>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <th>{t('safety:inspections.scheduled_date')}</th>
                            <th>{t('safety:inspections.status')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeInspections.map((inspection) => (
                            <tr key={inspection.id}>
                                <td>{inspection.scheduled_date}</td>
                                <td>{t(`safety:inspections.status_${inspection.status}`)}</td>
                                <td>
                                    <Button asChild>
                                        <Link href={`/safety/inspections/${inspection.id}`}>{t('safety:inspections.view')}</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </AppLayout>
    );
};

export default InspectionsIndex;
