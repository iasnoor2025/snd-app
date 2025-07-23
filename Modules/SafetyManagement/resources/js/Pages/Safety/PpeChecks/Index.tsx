import { Card, Table, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';

import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/Core/layouts/AppLayout';

interface PpeCheck {
    id: number;
    check_date: string;
    status: string;
}

interface Props {
    ppeChecks: PpeCheck[];
}

const PpeChecksIndex: React.FC<Props> = ({ ppeChecks }) => {
    const { t } = useTranslation();
    // Defensive: ensure ppeChecks is always an array
    const safePpeChecks = Array.isArray(ppeChecks) ? ppeChecks : [];
    return (
        <AppLayout>
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('safety:ppe_checks.title')}</h1>
                    <Button asChild>
                        <Link href="/safety/ppe-checks/create">{t('safety:ppe_checks.create')}</Link>
                    </Button>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <th>{t('safety:ppe_checks.check_date')}</th>
                            <th>{t('safety:ppe_checks.status')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {safePpeChecks.map((ppeCheck) => (
                            <tr key={ppeCheck.id}>
                                <td>{ppeCheck.check_date}</td>
                                <td>{t(`safety:ppe_checks.status_${ppeCheck.status}`)}</td>
                                <td>
                                    <Button asChild>
                                        <Link href={`/safety/ppe-checks/${ppeCheck.id}`}>{t('safety:ppe_checks.view')}</Link>
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

export default PpeChecksIndex;
