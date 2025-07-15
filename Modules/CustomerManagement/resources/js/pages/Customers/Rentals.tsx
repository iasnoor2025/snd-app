import { AppLayout, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Rentals() {
    const { t } = useTranslation(['CustomerManagement', 'common']);

    return (
        <AppLayout>
            <Card className="mx-auto mt-10 max-w-xl">
                <CardHeader>
                    <CardTitle>{t('customer:rentals', 'Customer Rentals')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        {t('customer:rentals_placeholder', 'Customer rentals will be displayed here.')}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
