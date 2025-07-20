import { AppLayout, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart, Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProjectReportsIndex() {
    const { t } = useTranslation(['common', 'projects']);

    return (
        <AppLayout title={t('projects:project_reports')}>
            <Head title={t('projects:project_reports')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('projects:project_reports')}</h1>
                        <p className="text-muted-foreground">{t('projects:analytics_and_insights')}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/reports">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('projects:back_to_main_reports')}
                        </Link>
                    </Button>
                </div>

                {/* Coming Soon Card */}
                <Card className="py-16 text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Construction className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-2xl">{t('projects:project_reports_coming_soon')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="mx-auto max-w-md text-muted-foreground">
                            {t('projects:reports_development_message')}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button variant="outline" asChild>
                                <Link href="/projects">{t('projects:view_projects')}</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/reports">
                                    <BarChart className="mr-2 h-4 w-4" />
                                    {t('projects:main_reports_dashboard')}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
