import { Card, Table, Button } from '@/Core/Components/ui';

import React from 'react';
import { useTranslation } from 'react-i18next';

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
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('safety:ppe_checks.title')}</h1>
                <Button href="/safety/ppe-checks/create">{t('safety:ppe_checks.create')}</Button>
            </div>
            <Table>
                <thead>
                    <tr>
                        <th>{t('safety:ppe_checks.details')}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {safePpeChecks.map((ppeCheck) => (
                        <tr key={ppeCheck.id}>
                            <td>{ppeCheck.details}</td>
                            <td>
                                <Button href={`/safety/ppe-checks/${ppeCheck.id}`}>{t('safety:ppe_checks.view')}</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default PpeChecksIndex;
