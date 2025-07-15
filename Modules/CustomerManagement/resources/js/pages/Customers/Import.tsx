import { AppLayout, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Import() {
    const { t } = useTranslation(['CustomerManagement', 'common']);

    return (
        <AppLayout>
            <Card className="mx-auto mt-10 max-w-xl">
                <CardHeader>
                    <CardTitle>{t('customer:import_customers', 'Import Customers')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        {t('customer:import_placeholder', 'Customer import functionality will be implemented soon.')}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
