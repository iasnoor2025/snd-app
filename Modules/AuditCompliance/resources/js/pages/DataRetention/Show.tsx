import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataRetentionShow() {
    const { t } = useTranslation(['common', 'audit']);

    return (
        <AppLayout>
            <Head title={t('audit:data_retention_report')} />
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <Link
                        href="/audit-compliance/reports"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('audit:back_to_reports')}
                    </Link>
                </div>
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold">{t('audit:data_retention_report')}</h1>
                    <p className="mb-4 text-muted-foreground">{t('audit:data_retention_description')}</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('audit:retention_policy_overview')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('common:no_data_available')}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
