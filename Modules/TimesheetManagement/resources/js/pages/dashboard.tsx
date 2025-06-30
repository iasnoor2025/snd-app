import { useTranslation } from 'react-i18next';

const { t } = useTranslation('TimesheetManagement');

title: t('dashboard', 'Dashboard'),

console.error(t('fetch_statuses_error', 'Error fetching module statuses:'), error);

console.error(t('load_modules_error', 'Error loading modules:'), error);

<AppLayout title={t('dashboard', 'Dashboard')} breadcrumbs={breadcrumbs}>
