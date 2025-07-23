import { Card, Table, Button } from '@/Core/Components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/Core/layouts/AppLayout';

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
        <AppLayout>
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('safety:safety_actions.title')}</h1>
                    <Button href="/safety/safety-actions/create">{t('safety:safety_actions.create')}</Button>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <th>{t('safety:safety_actions.due_date')}</th>
                            <th>{t('safety:safety_actions.status')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeActions.map((action) => (
                            <tr key={action.id}>
                                <td>{action.due_date}</td>
                                <td>{t(`safety:safety_actions.status_${action.status}`)}</td>
                                <td>
                                    <Button href={`/safety/safety-actions/${action.id}`}>{t('safety:safety_actions.view')}</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </AppLayout>
    );
};

export default SafetyActionsIndex;
