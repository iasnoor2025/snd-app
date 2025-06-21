import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Bell, Mail, MessageSquare, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

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

export default function Notifications() {
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
        setSettings(prev => ({ ...prev, [key]: value }));
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/settings' },
        { title: 'Notifications', href: '/settings/notifications' },
    ];

    return (
        <AppLayout title="Notification Settings" breadcrumbs={breadcrumbs}>
            <Head title="Notification Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                        <p className="text-gray-600 mt-1">
                            Manage how and when you receive notifications from the system.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {notificationGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="bg-white rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
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
                                                    <label className="font-medium text-gray-900 cursor-pointer">
                                                        {setting.label}
                                                    </label>
                                                    <p className="text-sm text-gray-600">{setting.description}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings[setting.key]}
                                                    onChange={(e) => handleSwitchChange(setting.key, e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
} 
