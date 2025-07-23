import { Card, Table, Button } from '@/Core/Components/ui';
import { Link } from '@inertiajs/react';

import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/Core/layouts/AppLayout';

interface Risk {
    id: number;
    title: string;
    risk_score: number;
    status: string;
}

interface Props {
    risks: Risk[];
}

const RisksIndex: React.FC<Props> = ({ risks }) => {
    const { t } = useTranslation();
    // Defensive: ensure risks is always an array
    const safeRisks = Array.isArray(risks) ? risks : [];
    return (
        <AppLayout>
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('safety:risks.title')}</h1>
                    <Button asChild>
                        <Link href="/safety/risks/create">{t('safety:risks.create')}</Link>
                    </Button>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <th>{t('safety:risks.title')}</th>
                            <th>{t('safety:risks.risk_score')}</th>
                            <th>{t('safety:risks.status')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeRisks.map((risk) => (
                            <tr key={risk.id}>
                                <td>{risk.title}</td>
                                <td>{risk.risk_score}</td>
                                <td>{t(`safety:risks.status_${risk.status}`)}</td>
                                <td>
                                    <Button asChild>
                                        <Link href={`/safety/risks/${risk.id}`}>{t('safety:risks.view')}</Link>
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

export default RisksIndex;
