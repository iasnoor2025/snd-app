import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Invoices() {
  const { t } = useTranslation(['CustomerManagement', 'common']);

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>{t('customer:invoices', 'Customer Invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {t('customer:invoices_placeholder', 'Customer invoices will be displayed here.')}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
