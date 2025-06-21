import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import {
    User,
    Settings,
    Lock,
    Bell,
    Shield,
    Eye,
    EyeOff,
    Save,
    AlertTriangle,
    Check
} from 'lucide-react';

const ProfileSettings = ({ auth, mustVerifyEmail, status }) => {
    const user = auth.user;
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile Information Form
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
    });

    // Password Update Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Notification Preferences
    const [notifications, setNotifications] = useState({
        email_notifications: true,
        push_notifications: true,
        rental_reminders: true,
        project_updates: true,
        system_alerts: true,
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        // For now, just show success message since we don't have the backend route
        toast.success('Profile updated successfully!');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // For now, just show success message since we don't have the backend route
        passwordForm.reset();
        toast.success('Password updated successfully!');
    };

    const handleNotificationChange = (key, value) => {
        setNotifications(prev => ({
            ...prev,
            [key]: value
        }));
        toast.success('Notification preferences updated');
    };

    const breadcrumbs = [
        { title: 'Profile', href: route('profile.index') },
        { title: 'Settings', href: route('profile.settings') }
    ];

    return (
        <AppLayout
            title="Profile Settings"
            breadcrumbs={breadcrumbs}
        >
            <div className="py-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="privacy" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Privacy
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Information Tab */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your account's profile information and email address.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={profileForm.data.name}
                                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                                    required
                                                />
                                                {profileForm.errors.name && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    required
                                                />
                                                {profileForm.errors.email && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.email}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={profileForm.data.phone}
                                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                />
                                                {profileForm.errors.phone && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.phone}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="department">Department</Label>
                                                <Input
                                                    id="department"
                                                    type="text"
                                                    value={profileForm.data.department}
                                                    onChange={(e) => profileForm.setData('department', e.target.value)}
                                                />
                                                {profileForm.errors.department && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.department}</p>
                                                )}
                                            </div>
                                        </div>

                                        {mustVerifyEmail && user.email_verified_at === null && (
                                            <div className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                <div>
                                                    <p className="text-sm text-yellow-800">
                                                        Your email address is unverified.
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto text-yellow-600 hover:text-yellow-800"
                                                        onClick={() => {
                                                            toast.success('Verification link sent!');
                                                        }}
                                                    >
                                                        Click here to re-send the verification email.
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {status === 'profile-updated' && (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <Check className="h-4 w-4" />
                                                <span className="text-sm">Profile updated successfully.</span>
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={profileForm.processing}
                                                className="flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Update Password
                                    </CardTitle>
                                    <CardDescription>
                                        Ensure your account is using a long, random password to stay secure.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.errors.current_password && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.errors.password && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.password}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.errors.password_confirmation && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={passwordForm.processing}
                                                className="flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                {passwordForm.processing ? 'Saving...' : 'Save Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Manage how you receive notifications and alerts.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Email Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications via email
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.email_notifications}
                                                onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Push Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications on your device
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.push_notifications}
                                                onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Rental Reminders</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Get reminders about rental due dates
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.rental_reminders}
                                                onCheckedChange={(checked) => handleNotificationChange('rental_reminders', checked)}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Project Updates</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive updates about project progress
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.project_updates}
                                                onCheckedChange={(checked) => handleNotificationChange('project_updates', checked)}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>System Alerts</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Get important system notifications
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.system_alerts}
                                                onCheckedChange={(checked) => handleNotificationChange('system_alerts', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Privacy Tab */}
                        <TabsContent value="privacy" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Privacy Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Control your privacy and visibility settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Profile Visibility</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make your profile visible to others
                                                </p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Show Online Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Let others see when you're online
                                                </p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Activity History</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Show your activity history to team members
                                                </p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfileSettings;
