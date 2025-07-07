import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';
import {
    Smartphone,
    Bell,
    Wifi,
    Settings,
    Download,
    Shield,
    Zap
} from 'lucide-react';

interface PWAIndexProps {
    stats?: {
        installRate: number;
        activeUsers: number;
        offlineUsage: number;
        notificationEngagement: number;
    };
}

const PWAIndex: React.FC<PWAIndexProps> = ({ stats }) => {
    const { t } = useTranslation(['mobilebridge', 'common']);

    const breadcrumbs = [
        { label: t('common:dashboard'), href: '/dashboard' },
        { label: t('pwa_management'), href: '/pwa' }
    ];

    const features = [
        {
            icon: <Download className="h-8 w-8 text-blue-600" />,
            title: t('app_installation'),
            description: t('app_installation_desc'),
            benefits: [t('faster_loading'), t('home_screen_access'), t('fullscreen_experience')]
        },
        {
            icon: <Wifi className="h-8 w-8 text-green-600" />,
            title: t('offline_support'),
            description: t('offline_support_desc'),
            benefits: [t('offline_functionality'), t('auto_sync'), t('data_persistence')]
        },
        {
            icon: <Bell className="h-8 w-8 text-purple-600" />,
            title: t('push_notifications'),
            description: t('push_notifications_desc'),
            benefits: [t('realtime_alerts'), t('customizable_categories'), t('smart_scheduling')]
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-600" />,
            title: t('performance'),
            description: t('performance_desc'),
            benefits: [t('fast_loading'), t('background_updates'), t('efficient_caching')]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Head title={t('pwa_management')} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('pwa_management')}</h1>
                        <p className="text-muted-foreground mt-2">
                            {t('pwa_management_desc')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">PWA</span>
                    </div>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('install_rate')}</p>
                                    <p className="text-2xl font-bold">{stats.installRate}%</p>
                                </div>
                                <Download className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('active_users')}</p>
                                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                                </div>
                                <Smartphone className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('offline_usage')}</p>
                                    <p className="text-2xl font-bold">{stats.offlineUsage}%</p>
                                </div>
                                <Wifi className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('notification_rate')}</p>
                                    <p className="text-2xl font-bold">{stats.notificationEngagement}%</p>
                                </div>
                                <Bell className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* PWA Features Overview */}
                <div className='bg-white rounded-lg shadow'>
                    <div className='p-6 pb-4'>
                        <h3 className='text-lg font-semibold'>
                            <Shield className="h-5 w-5" />
                            {t('pwa_features')}
                        </h3>
                        <p className='text-gray-600 text-sm mt-2'>
                            {t('pwa_features_desc')}
                        </p>
                    </div>
                    <div className='p-6 pt-0'>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground mb-3">{feature.description}</p>
                                        <ul className="space-y-1">
                                            {feature.benefits.map((benefit, benefitIndex) => (
                                                <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main PWA Management Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white">
                                <Settings className="h-4 w-4" />
                                {t('dashboard')}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Bell className="h-4 w-4" />
                                {t('notifications')}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Wifi className="h-4 w-4" />
                                {t('offline_sync')}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Download className="h-4 w-4" />
                                {t('installation')}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">{t('pwa_dashboard')}</h3>
                                <p className="text-gray-600 text-sm mb-4">{t('pwa_dashboard_desc')}</p>
                                <p className="text-muted-foreground">{t('pwa_dashboard_content')}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">{t('notification_settings')}</h3>
                                <p className="text-gray-600 text-sm mb-4">{t('notification_settings_desc')}</p>
                                <p className="text-muted-foreground">{t('notification_settings_content')}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">{t('offline_synchronization')}</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {t('offline_synchronization_desc')}
                                </p>
                                <p className="text-muted-foreground">{t('offline_sync_content')}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">{t('app_installation')}</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {t('app_installation_page_desc')}
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">{t('why_install')}</h3>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                {t('why_install_1')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                {t('why_install_2')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                {t('why_install_3')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                {t('why_install_4')}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-muted-foreground mb-4">
                                            {t('install_prompt_info')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAIndex;





