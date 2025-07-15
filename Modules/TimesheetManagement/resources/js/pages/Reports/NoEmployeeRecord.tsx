import { AppLayout, Button } from '@/Core';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function NoEmployeeRecord() {
    const { t } = useTranslation('TimesheetManagement');
    return (
        <AppLayout title={t('no_employee_record', 'No Employee Record')}>
            <Head title={t('no_employee_record', 'No Employee Record')} />
            <div className="flex h-full flex-col items-center justify-center py-24">
                <h1 className="mb-4 text-3xl font-bold">{t('no_employee_record', 'No Employee Record Found')}</h1>
                <p className="mb-8 text-lg text-muted-foreground">
                    {t('no_employee_record_message', 'You do not have an employee record in the system. Please contact your administrator.')}
                </p>
                <Button asChild variant="outline">
                    <a href="/dashboard">{t('back_to_dashboard', 'Back to Dashboard')}</a>
                </Button>
            </div>
        </AppLayout>
    );
}
