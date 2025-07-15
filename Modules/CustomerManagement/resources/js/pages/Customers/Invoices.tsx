import { AppLayout, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Invoices() {
    const { t } = useTranslation(['CustomerManagement', 'common']);

    return (
        <AppLayout>
            <Card className="mx-auto mt-10 max-w-xl">
                <CardHeader>
                    <CardTitle>{t('customer:invoices', 'Customer Invoices')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        {t('customer:invoices_placeholder', 'Customer invoices will be displayed here.')}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
