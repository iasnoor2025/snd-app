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
    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('safety:ppe_checks.title')}</h1>
                <Button href="/safety/ppe-checks/create">{t('safety:ppe_checks.create')}</Button>
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
                    {ppeChecks.map((check) => (
                        <tr key={check.id}>
                            <td>{check.check_date}</td>
                            <td>{t(`safety:ppe_checks.status_${check.status}`)}</td>
                            <td>
                                <Button asChild>
                                    <Link href={`/safety/ppe-checks/${check.id}`}>{t('safety:ppe_checks.view')}</Link>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default PpeChecksIndex;
