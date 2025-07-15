import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Rentals() {
  const { t } = useTranslation(['CustomerManagement', 'common']);

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>{t('customer:rentals', 'Customer Rentals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {t('customer:rentals_placeholder', 'Customer rentals will be displayed here.')}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
