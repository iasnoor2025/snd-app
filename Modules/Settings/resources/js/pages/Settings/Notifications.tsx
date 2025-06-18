import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
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

interface Props {
    settings: NotificationSettings;
}

const Notifications: React.FC<Props> = ({ settings }) => {
    const { data, setData, post, processing, errors } = useForm<NotificationSettings>({
        email_notifications: settings.email_notifications || false,
        sms_notifications: settings.sms_notifications || false,
        push_notifications: settings.push_notifications || false,
        leave_request_notifications: settings.leave_request_notifications || false,
        timesheet_notifications: settings.timesheet_notifications || false,
        payroll_notifications: settings.payroll_notifications || false,
        project_notifications: settings.project_notifications || false,
        equipment_notifications: settings.equipment_notifications || false,
        rental_notifications: settings.rental_notifications || false,
        maintenance_notifications: settings.maintenance_notifications || false,
        overdue_notifications: settings.overdue_notifications || false,
        payment_notifications: settings.payment_notifications || false,
        system_notifications: settings.system_notifications || false,
        marketing_notifications: settings.marketing_notifications || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.notifications.update'), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Notification settings updated successfully.',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to update notification settings.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleSwitchChange = (key: keyof NotificationSettings, value: boolean) => {
        setData(key, value);
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

    return (
        <>
            <Head title="Notification Settings" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
                    <p className="text-muted-foreground">
                        Manage how and when you receive notifications from the system.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {notificationGroups.map((group, groupIndex) => (
                        <Card key={groupIndex}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {group.icon}
                                    {group.title}
                                </CardTitle>
                                <CardDescription>{group.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {group.settings.map((setting, settingIndex) => (
                                    <div key={settingIndex}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {setting.icon && (
                                                    <div className="text-muted-foreground">
                                                        {setting.icon}
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <Label htmlFor={setting.key} className="text-sm font-medium">
                                                        {setting.label}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {setting.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                id={setting.key}
                                                checked={data[setting.key]}
                                                onCheckedChange={(checked) => handleSwitchChange(setting.key, checked)}
                                            />
                                        </div>
                                        {settingIndex < group.settings.length - 1 && (
                                            <Separator className="mt-4" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Notifications;
