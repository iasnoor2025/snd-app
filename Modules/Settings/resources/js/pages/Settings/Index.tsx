import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import {
    User,
    Lock,
    Bell,
    Palette,
    Globe,
    Shield,
    Database,
    Settings as SettingsIcon,
    ChevronRight
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SettingsIndex() {
    const { t } = useTranslation();

    const settingsGroups = [
        {
            title: 'Account',
            description: 'Manage your account settings and preferences',
            items: [
                {
                    title: 'Profile',
                    description: 'Update your personal information and contact details',
                    href: '/profile/settings',
                    icon: <User className="h-5 w-5" />,
                },
                {
                    title: 'Password',
                    description: 'Change your password and security settings',
                    href: '/settings/password',
                    icon: <Lock className="h-5 w-5" />,
                },
                {
                    title: 'Notifications',
                    description: 'Configure how you receive notifications',
                    href: '/settings/notifications',
                    icon: <Bell className="h-5 w-5" />,
                },
            ],
        },
        {
            title: 'Appearance',
            description: 'Customize how the application looks and feels',
            items: [
                {
                    title: 'Theme',
                    description: 'Switch between light and dark themes',
                    href: '/settings/appearance',
                    icon: <Palette className="h-5 w-5" />,
                },
                {
                    title: 'Language',
                    description: 'Change your preferred language',
                    href: '/settings/language',
                    icon: <Globe className="h-5 w-5" />,
                },
            ],
        },
        {
            title: 'Security',
            description: 'Manage your security and privacy settings',
            items: [
                {
                    title: 'Privacy',
                    description: 'Control your privacy and data sharing preferences',
                    href: '/settings/privacy',
                    icon: <Shield className="h-5 w-5" />,
                },
                {
                    title: 'Data Export',
                    description: 'Download your data and account information',
                    href: '/settings/data-export',
                    icon: <Database className="h-5 w-5" />,
                },
            ],
        },
    ];

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/settings' },
    ];

    return (
        <AppLayout title="Settings" breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <SettingsIcon className="h-8 w-8" />
                            Settings
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your account settings and preferences
                        </p>
                    </header>

                    <div className="space-y-8">
                        {settingsGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{group.title}</h2>
                                    <p className="text-gray-600 text-sm">{group.description}</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {group.items.map((item, itemIndex) => (
                                        <Link
                                            key={itemIndex}
                                            href={item.href}
                                            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-blue-600 group-hover:text-blue-700">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                        <p className="text-blue-800 text-sm mb-4">
                            If you need assistance with any settings or have questions about your account,
                            our support team is here to help.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
