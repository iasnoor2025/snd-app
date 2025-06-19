import React from 'react';
import { Head } from '@inertiajs/react';
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
    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'PWA Management', href: '/pwa' }
    ];

    const features = [
        {
            icon: <Download className="h-8 w-8 text-blue-600" />,
            title: 'App Installation',
            description: 'Install the app on your device for quick access and native-like experience.',
            benefits: ['Faster loading', 'Home screen access', 'Full-screen experience']
        },
        {
            icon: <Wifi className="h-8 w-8 text-green-600" />,
            title: 'Offline Support',
            description: 'Continue working even without internet connection with automatic data sync.',
            benefits: ['Offline functionality', 'Auto-sync when online', 'Data persistence']
        },
        {
            icon: <Bell className="h-8 w-8 text-purple-600" />,
            title: 'Push Notifications',
            description: 'Stay updated with real-time notifications for important events and updates.',
            benefits: ['Real-time alerts', 'Customizable categories', 'Smart scheduling']
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-600" />,
            title: 'Performance',
            description: 'Optimized performance with caching and background sync capabilities.',
            benefits: ['Fast loading', 'Background updates', 'Efficient caching']
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Head title="PWA Management" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">PWA Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your Progressive Web App features and settings
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
                                    <p className="text-sm font-medium text-gray-600">Install Rate</p>
                                    <p className="text-2xl font-bold">{stats.installRate}%</p>
                                </div>
                                <Download className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                                </div>
                                <Smartphone className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Offline Usage</p>
                                    <p className="text-2xl font-bold">{stats.offlineUsage}%</p>
                                </div>
                                <Wifi className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Notification Rate</p>
                                    <p className="text-2xl font-bold">{stats.notificationEngagement}%</p>
                                </div>
                                <Bell className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* PWA Features Overview */}
                <div class='bg-white rounded-lg shadow'>
                    <div class='p-6 pb-4'>
                        <h3 class='text-lg font-semibold'>
                            <Shield className="h-5 w-5" />
                            PWA Features
                        </h3>
                        <p class='text-gray-600 text-sm mt-2'>
                            Progressive Web App capabilities that enhance your user experience
                        </p>
                    </div>
                    <div class='p-6 pt-0'>
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
                                Dashboard
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Wifi className="h-4 w-4" />
                                Offline Sync
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-200">
                                <Download className="h-4 w-4" />
                                Installation
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">PWA Dashboard</h3>
                                <p className="text-gray-600 text-sm mb-4">Monitor your PWA performance and usage</p>
                                <p className="text-muted-foreground">PWA dashboard content will be implemented here.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
                                <p className="text-gray-600 text-sm mb-4">Configure push notification preferences</p>
                                <p className="text-muted-foreground">Notification settings will be implemented here.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">Offline Synchronization</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Manage offline data and synchronization settings
                                </p>
                                <p className="text-muted-foreground">Offline sync will be implemented here.</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">App Installation</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Install the app on your device for the best experience
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Why Install?</h3>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                Faster loading and better performance
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                Works offline with automatic sync
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                Push notifications for important updates
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                Native app-like experience
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-muted-foreground mb-4">
                                            The install prompt will appear automatically when available, or you can trigger it manually from the PWA Dashboard.
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





