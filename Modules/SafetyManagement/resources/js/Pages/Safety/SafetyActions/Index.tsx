import { Card } from '@/../../Modules/Core/resources/js/Components/ui/card';
import { Table } from '@/Core/Components/ui/table';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Core/Components/ui';

interface SafetyAction {
    id: number;
    due_date: string;
    status: string;
}

interface Props {
    actions: SafetyAction[];
}

const SafetyActionsIndex: React.FC<Props> = ({ actions }) => {
    const { t } = useTranslation();
    // Defensive: ensure actions is always an array
    const safeActions = Array.isArray(actions) ? actions : [];
    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('safety:safety_actions.title')}</h1>
                <Button href="/safety/safety-actions/create">{t('safety:safety_actions.create')}</Button>
            </div>
            <Table>
                <thead>
                    <tr>
                        <th>{t('safety:safety_actions.details')}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {safeActions.map((action) => (
                        <tr key={action.id}>
                            <td>{action.details}</td>
                            <td>
                                <Button href={`/safety/safety-actions/${action.id}`}>{t('safety:safety_actions.view')}</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default SafetyActionsIndex;
