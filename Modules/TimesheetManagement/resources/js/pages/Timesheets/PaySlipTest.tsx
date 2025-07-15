import { AppLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Placeholder type
type PageProps = any;

interface Props extends PageProps {
    employeeId?: string;
    month?: string;
}

export default function PaySlipTest(props: any) {
    const { t } = useTranslation('TimesheetManagement');
    const { auth } = props;

    return (
        <AppLayout>
            <Head title={t('ttl_pay_slip_test')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_pay_slip_test_page')}</CardTitle>
                        <CardDescription>This is a test page to verify that the pay slip route is working.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Route Parameters:</h3>
                                <p>Employee ID: {props.employeeId || 'Not provided'}</p>
                                <p>Month: {props.month || 'Not provided'}</p>
                            </div>

                            <Button variant="outline" asChild>
                                <Link href="/hr/timesheets/monthly">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Back to Monthly View
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
