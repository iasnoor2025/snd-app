import { Card } from '@/../../Modules/Core/resources/js/components/ui/card';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DashboardIndex: React.FC = () => {
    const { t } = useTranslation();
    const [kpis, setKpis] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/safety/kpis').then((res) => {
            setKpis(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>{t('safety:dashboard.loading')}</div>;

    const data = [
        { name: t('safety:dashboard.incident_rate'), value: kpis.incident_rate },
        { name: t('safety:dashboard.overdue_actions'), value: kpis.overdue_actions },
        { name: t('safety:dashboard.training_compliance'), value: kpis.training_compliance },
    ];

    return (
        <Card className="p-6">
            <h1 className="mb-4 text-2xl font-bold">{t('safety:dashboard.title')}</h1>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default DashboardIndex;
