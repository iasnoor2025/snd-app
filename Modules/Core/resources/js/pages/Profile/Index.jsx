import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SmartAvatar } from '../../components/ui/smart-avatar';
import { Link } from '@inertiajs/react';
import {
    User,
    Settings,
    Camera,
    Mail,
    Calendar,
    Shield,
    Edit
} from 'lucide-react';
import { formatDateMedium } from '@/Core/utils/dateFormatter';

const ProfileIndex = ({ auth }) => {
    const user = auth.user;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return formatDateMedium(dateString);
    };

    const breadcrumbs = [
        { title: 'Profile', href: route('profile.index') }
    ];

    return (
        <AppLayout
            title="Profile"
            breadcrumbs={breadcrumbs}
        >
            <div className="py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Welcome Section */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <SmartAvatar user={user} size="2xl" className="h-32 w-32" />
                                <div className="flex-grow text-center md:text-left">
                                    <h1 className="text-2xl font-bold mb-2">
                                        Welcome back, {user.name}!
                                    </h1>
                                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                                        {user.email}
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        <Badge variant={user.is_active ? "success" : "secondary"}>
                                            Status: {user.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant="outline">
                                            Last login: {formatDate(user.last_login_at)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link href={route('profile.settings')}>
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Button>
                                    </Link>
                                    <Link href={route('profile.avatar')}>
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <Camera className="h-4 w-4" />
                                            Change Avatar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </div>
                                <Link href={route('profile.settings')}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                Update your account's profile information and email address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Name
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {user.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Email
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {user.email}
                                        </p>
                                        {user.email_verified_at && (
                                            <Badge variant="success" size="sm">Verified</Badge>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Joined
                                    </label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Role
                                    </label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {user.roles?.map((role) => (
                                            <Badge key={role.id} variant="outline" className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" />
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href={route('profile.settings')}>
                            <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Settings className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Account Settings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Manage your account preferences
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href={route('profile.avatar')}>
                            <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Camera className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Avatar Settings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Customize your profile picture
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href={route('profile.settings') + '?tab=security'}>
                            <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Shield className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Security Settings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Update password and security
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfileIndex;
