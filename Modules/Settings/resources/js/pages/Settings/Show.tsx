import { AppLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
    setting: any;
    groups?: string[];
    types?: string[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export default function Show({ setting, groups = [], types = [], created_at, updated_at, deleted_at }: Props) {
    const { t } = useTranslation(['common', 'settings']);

    const breadcrumbs = [
        { title: t('common:dashboard'), href: '/dashboard' },
        { title: t('settings:settings'), href: '/settings' },
        { title: t('settings:view_setting'), href: '' },
    ];

    return (
        <AppLayout title={t('settings:setting_details')} breadcrumbs={breadcrumbs}>
            <Head title={`${t('settings:setting_details')}: ${setting?.key || 'Unknown'}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/settings">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('common:back')}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('settings:setting_details')}</h1>
                            <p className="text-muted-foreground">{setting?.key || t('common:unknown')}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/settings/${setting?.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                {t('common:edit')}
                            </Button>
                        </Link>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common:delete')}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings:setting_information')}</CardTitle>
                        <CardDescription>{t('settings:setting_details_description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">{t('settings:key')}</label>
                                <p className="text-sm text-muted-foreground">{setting?.key || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('settings:value')}</label>
                                <p className="text-sm text-muted-foreground">{setting?.value || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('settings:group')}</label>
                                <p className="text-sm text-muted-foreground">{setting?.group || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{t('settings:type')}</label>
                                <p className="text-sm text-muted-foreground">{setting?.type || '—'}</p>
                            </div>
                        </div>

                        {setting?.description && (
                            <div>
                                <label className="text-sm font-medium">{t('common:description')}</label>
                                <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                                <div>
                                    <label className="font-medium">{t('common:created_at')}</label>
                                    <p>{created_at || '—'}</p>
                                </div>
                                <div>
                                    <label className="font-medium">{t('common:updated_at')}</label>
                                    <p>{updated_at || '—'}</p>
                                </div>
                                {deleted_at && (
                                    <div>
                                        <label className="font-medium">{t('common:deleted_at')}</label>
                                        <p>{deleted_at}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
