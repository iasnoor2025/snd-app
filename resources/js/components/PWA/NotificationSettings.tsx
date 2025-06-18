import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Bell,
    BellOff,
    Settings,
    Smartphone,
    AlertCircle,
    CheckCircle,
    Clock,
    Volume2,
    VolumeX
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useTranslation } from 'react-i18next';

interface NotificationCategory {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationStats {
    total: number;
    delivered: number;
    clicked: number;
    delivery_rate: number;
    click_rate: number;
}

const NotificationSettings: React.FC = () => {
    const { t } = useTranslation('common');
    const {
        notificationPermission,
        requestNotificationPermission,
        isSubscribed,
        subscribeToNotifications,
        unsubscribeFromNotifications,
        loading,
        error
    } = usePWA();

    const [categories, setCategories] = useState<NotificationCategory[]>([
        {
            id: 'system',
            name: t('notifications.categories.system.name', 'System Notifications'),
            description: t('notifications.categories.system.description', 'Important system updates and maintenance alerts'),
            enabled: true,
            priority: 'high'
        },
        {
            id: 'transactional',
            name: t('notifications.categories.transactional.name', 'Transaction Alerts'),
            description: t('notifications.categories.transactional.description', 'Payment confirmations, booking updates, and receipts'),
            enabled: true,
            priority: 'high'
        },
        {
            id: 'reminder',
            name: t('notifications.categories.reminder.name', 'Reminders'),
            description: t('notifications.categories.reminder.description', 'Upcoming bookings, due dates, and scheduled events'),
            enabled: true,
            priority: 'normal'
        },
        {
            id: 'marketing',
            name: t('notifications.categories.marketing.name', 'Promotional Offers'),
            description: t('notifications.categories.marketing.description', 'Special deals, discounts, and new features'),
            enabled: false,
            priority: 'low'
        },
        {
            id: 'alert',
            name: t('notifications.categories.alert.name', 'Emergency Alerts'),
            description: t('notifications.categories.alert.description', 'Urgent security and safety notifications'),
            enabled: true,
            priority: 'urgent'
        }
    ]);

    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [testNotificationSent, setTestNotificationSent] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [quietHours, setQuietHours] = useState({
        enabled: false,
        start: '22:00',
        end: '08:00'
    });

    useEffect(() => {
        loadNotificationStats();
        loadUserPreferences();
    }, []);

    const loadNotificationStats = async () => {
        try {
            const response = await fetch('/api/push-notifications/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to load notification stats:', error);
        }
    };

    const loadUserPreferences = () => {
        // Load preferences from localStorage or API
        const savedPreferences = localStorage.getItem('notification_preferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            setCategories(prev => prev.map(cat => ({
                ...cat,
                enabled: preferences.categories?.[cat.id] ?? cat.enabled
            })));
            setSoundEnabled(preferences.sound ?? true);
            setVibrationEnabled(preferences.vibration ?? true);
            setQuietHours(preferences.quietHours ?? quietHours);
        }
    };

    const saveUserPreferences = () => {
        const preferences = {
            categories: categories.reduce((acc, cat) => {
                acc[cat.id] = cat.enabled;
                return acc;
            }, {} as Record<string, boolean>),
            sound: soundEnabled,
            vibration: vibrationEnabled,
            quietHours
        };

        localStorage.setItem('notification_preferences', JSON.stringify(preferences));

        // Also sync with server
        fetch('/api/push-notifications/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        }).catch(console.error);
    };

    const handleCategoryToggle = (categoryId: string) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
        ));
    };

    const handleEnableNotifications = async () => {
        try {
            await requestNotificationPermission();
            if (notificationPermission === 'granted') {
                await subscribeToNotifications();
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        }
    };

    const handleDisableNotifications = async () => {
        try {
            await unsubscribeFromNotifications();
        } catch (error) {
            console.error('Failed to disable notifications:', error);
        }
    };

    const sendTestNotification = async () => {
        try {
            const response = await fetch('/api/push-notifications/test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setTestNotificationSent(true);
                setTimeout(() => setTestNotificationSent(false), 3000);
            }
        } catch (error) {
            console.error('Failed to send test notification:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPermissionStatus = () => {
        switch (notificationPermission) {
            case 'granted':
                return {
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    text: t('notifications.status.enabled', 'Notifications Enabled'),
                    color: 'text-green-700'
                };
            case 'denied':
                return {
                    icon: <BellOff className="h-5 w-5 text-red-500" />,
                    text: t('notifications.status.blocked', 'Notifications Blocked'),
                    color: 'text-red-700'
                };
            default:
                return {
                    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
                    text: t('notifications.status.permission_required', 'Permission Required'),
                    color: 'text-yellow-700'
                };
        }
    };

    useEffect(() => {
        saveUserPreferences();
    }, [categories, soundEnabled, vibrationEnabled, quietHours]);

    const permissionStatus = getPermissionStatus();

    return (
        <div className="space-y-6">
            {/* Permission Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t('notifications.status.title', 'Notification Status')}
                    </CardTitle>
                    <CardDescription>
                        {t('notifications.status.description', 'Manage your push notification preferences and permissions')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {permissionStatus.icon}
                            <span className={`font-medium ${permissionStatus.color}`}>
                                {permissionStatus.text}
                            </span>
                            {isSubscribed && (
                                <Badge variant="secondary" className="ml-2">
                                    <Smartphone className="h-3 w-3 mr-1" />
                                    {t('notifications.status.subscribed', 'Subscribed')}
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {notificationPermission !== 'granted' ? (
                                <Button
                                    onClick={handleEnableNotifications}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {t('notifications.actions.enable', 'Enable Notifications')}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={sendTestNotification}
                                        disabled={loading || !isSubscribed}
                                    >
                                        {t('notifications.actions.send_test', 'Send Test')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDisableNotifications}
                                        disabled={loading}
                                    >
                                        {t('notifications.actions.disable', 'Disable')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {testNotificationSent && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('notifications.messages.test_sent', 'Test notification sent! Check your device for the notification.')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Notification Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t('notifications.categories.title', 'Notification Categories')}
                    </CardTitle>
                    <CardDescription>
                        {t('notifications.categories.description', 'Choose which types of notifications you want to receive')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {categories.map((category, index) => (
                        <div key={category.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{category.name}</h4>
                                        <Badge
                                            variant="secondary"
                                            className={getPriorityColor(category.priority)}
                                        >
                                            {t(`notifications.priority.${category.priority}`, category.priority)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {category.description}
                                    </p>
                                </div>
                                <Switch
                                    checked={category.enabled}
                                    onCheckedChange={() => handleCategoryToggle(category.id)}
                                    disabled={notificationPermission !== 'granted'}
                                />
                            </div>
                            {index < categories.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Sound & Vibration Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('notifications.sound_vibration.title', 'Sound & Vibration')}</CardTitle>
                    <CardDescription>
                        {t('notifications.sound_vibration.description', 'Configure how notifications alert you')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {soundEnabled ? (
                                <Volume2 className="h-5 w-5 text-blue-500" />
                            ) : (
                                <VolumeX className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                                <h4 className="font-medium">{t('notifications.sound_vibration.sound', 'Sound')}</h4>
                                <p className="text-sm text-gray-600">
                                    {t('notifications.sound_vibration.sound_description', 'Play sound when notifications arrive')}
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={soundEnabled}
                            onCheckedChange={setSoundEnabled}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-blue-500" />
                            <div>
                                <h4 className="font-medium">{t('notifications.sound_vibration.vibration', 'Vibration')}</h4>
                                <p className="text-sm text-gray-600">
                                    {t('notifications.sound_vibration.vibration_description', 'Vibrate device for notifications')}
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={vibrationEnabled}
                            onCheckedChange={setVibrationEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t('notifications.quiet_hours.title', 'Quiet Hours')}
                    </CardTitle>
                    <CardDescription>
                        {t('notifications.quiet_hours.description', 'Set times when you don\'t want to receive notifications')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{t('notifications.quiet_hours.enable', 'Enable Quiet Hours')}</h4>
                            <p className="text-sm text-gray-600">
                                {t('notifications.quiet_hours.enable_description', 'Silence non-urgent notifications during specified hours')}
                            </p>
                        </div>
                        <Switch
                            checked={quietHours.enabled}
                            onCheckedChange={(enabled) =>
                                setQuietHours(prev => ({ ...prev, enabled }))
                            }
                        />
                    </div>

                    {quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {t('notifications.quiet_hours.start_time', 'Start Time')}
                                </label>
                                <input
                                    type="time"
                                    value={quietHours.start}
                                    onChange={(e) =>
                                        setQuietHours(prev => ({ ...prev, start: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {t('notifications.quiet_hours.end_time', 'End Time')}
                                </label>
                                <input
                                    type="time"
                                    value={quietHours.end}
                                    onChange={(e) =>
                                        setQuietHours(prev => ({ ...prev, end: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Statistics */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('notifications.statistics.title', 'Notification Statistics')}</CardTitle>
                        <CardDescription>
                            {t('notifications.statistics.description', 'Your notification activity over the last 30 days')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.total}
                                </div>
                                <div className="text-sm text-gray-600">{t('notifications.statistics.total_sent', 'Total Sent')}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.delivered}
                                </div>
                                <div className="text-sm text-gray-600">{t('notifications.statistics.delivered', 'Delivered')}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.clicked}
                                </div>
                                <div className="text-sm text-gray-600">{t('notifications.statistics.clicked', 'Clicked')}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {stats.click_rate}%
                                </div>
                                <div className="text-sm text-gray-600">{t('notifications.statistics.click_rate', 'Click Rate')}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default NotificationSettings;
