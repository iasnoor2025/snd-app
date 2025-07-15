import { AppLayout } from '@/Core';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Bell, Calendar, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    leave_request_notifications: boolean;
    timesheet_notifications: boolean;
    payroll_notifications: boolean;
    project_notifications: boolean;
    equipment_notifications: boolean;
    rental_notifications: boolean;
    maintenance_notifications: boolean;
    overdue_notifications: boolean;
    payment_notifications: boolean;
    system_notifications: boolean;
    marketing_notifications: boolean;
}

export default function NotificationSettings() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<NotificationSettings>({
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        leave_request_notifications: true,
        timesheet_notifications: true,
        payroll_notifications: true,
        project_notifications: false,
        equipment_notifications: true,
        rental_notifications: true,
        maintenance_notifications: true,
        overdue_notifications: true,
        payment_notifications: true,
        system_notifications: true,
        marketing_notifications: false,
    });

    const handleSwitchChange = (key: keyof NotificationSettings, value: boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        alert('Notification settings updated successfully!');
    };

    const notificationGroups = [
        {
            title: 'Communication Channels',
            description: 'Choose how you want to receive notifications',
            icon: <Bell className="h-5 w-5" />,
            settings: [
                {
                    key: 'email_notifications' as keyof NotificationSettings,
                    label: 'Email Notifications',
                    description: 'Receive notifications via email',
                    icon: <Mail className="h-4 w-4" />,
                },
                {
                    key: 'sms_notifications' as keyof NotificationSettings,
                    label: 'SMS Notifications',
                    description: 'Receive notifications via SMS',
                    icon: <MessageSquare className="h-4 w-4" />,
                },
                {
                    key: 'push_notifications' as keyof NotificationSettings,
                    label: 'Push Notifications',
                    description: 'Receive browser push notifications',
                    icon: <Bell className="h-4 w-4" />,
                },
            ],
        },
        {
            title: 'HR & Payroll',
            description: 'Notifications related to human resources and payroll',
            icon: <Calendar className="h-5 w-5" />,
            settings: [
                {
                    key: 'leave_request_notifications' as keyof NotificationSettings,
                    label: 'Leave Requests',
                    description: 'Notifications for leave requests and approvals',
                },
                {
                    key: 'timesheet_notifications' as keyof NotificationSettings,
                    label: 'Timesheet Updates',
                    description: 'Notifications for timesheet submissions and approvals',
                },
                {
                    key: 'payroll_notifications' as keyof NotificationSettings,
                    label: 'Payroll Processing',
                    description: 'Notifications for payroll runs and payslips',
                },
            ],
        },
        {
            title: 'Operations',
            description: 'Notifications related to projects and equipment',
            icon: <CheckCircle className="h-5 w-5" />,
            settings: [
                {
                    key: 'project_notifications' as keyof NotificationSettings,
                    label: 'Project Updates',
                    description: 'Notifications for project milestones and updates',
                },
                {
                    key: 'equipment_notifications' as keyof NotificationSettings,
                    label: 'Equipment Status',
                    description: 'Notifications for equipment availability and issues',
                },
                {
                    key: 'rental_notifications' as keyof NotificationSettings,
                    label: 'Rental Activities',
                    description: 'Notifications for rental bookings and returns',
                },
                {
                    key: 'maintenance_notifications' as keyof NotificationSettings,
                    label: 'Maintenance Alerts',
                    description: 'Notifications for scheduled and emergency maintenance',
                },
            ],
        },
        {
            title: 'Financial & System',
            description: 'Notifications related to payments and system alerts',
            icon: <AlertTriangle className="h-5 w-5" />,
            settings: [
                {
                    key: 'overdue_notifications' as keyof NotificationSettings,
                    label: 'Overdue Alerts',
                    description: 'Notifications for overdue payments and returns',
                },
                {
                    key: 'payment_notifications' as keyof NotificationSettings,
                    label: 'Payment Updates',
                    description: 'Notifications for payment confirmations and failures',
                },
                {
                    key: 'system_notifications' as keyof NotificationSettings,
                    label: 'System Alerts',
                    description: 'Important system updates and maintenance notices',
                },
                {
                    key: 'marketing_notifications' as keyof NotificationSettings,
                    label: 'Marketing Communications',
                    description: 'Promotional emails and product updates',
                },
            ],
        },
    ];

    const breadcrumbs = [
        { title: t('ui.titles.settings'), href: route('settings.index') },
        { title: t('settings.notifications'), href: route('settings.notifications') },
    ];

    return (
        <AppLayout title={t('settings.notifications')} breadcrumbs={breadcrumbs}>
            <Head title={t('settings.notifications')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <h2 className="text-lg font-medium text-gray-900">{t('settings.notification_preferences')}</h2>

                        <p className="mt-1 text-sm text-gray-600">{t('settings.notification_preferences_description')}</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {notificationGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="rounded-lg bg-white p-6 shadow">
                                    <div className="mb-4">
                                        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                                            {group.icon}
                                            {group.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{group.description}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {group.settings.map((setting, settingIndex) => (
                                            <div key={settingIndex} className="flex items-center justify-between py-2">
                                                <div className="flex items-start gap-3">
                                                    {setting.icon && <div className="mt-0.5">{setting.icon}</div>}
                                                    <div>
                                                        <label className="cursor-pointer font-medium text-gray-900">{setting.label}</label>
                                                        <p className="text-sm text-gray-600">{setting.description}</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={settings[setting.key]}
                                                        onChange={(e) => handleSwitchChange(setting.key, e.target.checked)}
                                                    />
                                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    {t('settings.save_settings')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
