import React from 'react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { useTranslation } from 'react-i18next';

export default function Import() {
  const { t } = useTranslation(['CustomerManagement', 'common']);

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>{t('customer:import_customers', 'Import Customers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {t('customer:import_placeholder', 'Customer import functionality will be implemented soon.')}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
