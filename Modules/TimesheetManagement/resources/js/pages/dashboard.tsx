import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/Core';

export default function DashboardPage() {
  const { t } = useTranslation('TimesheetManagement');
  const breadcrumbs: any[] = [];

  return (
    <AppLayout title={t('dashboard', 'Dashboard')} breadcrumbs={breadcrumbs}>
      <></>
    </AppLayout>
  );
}
