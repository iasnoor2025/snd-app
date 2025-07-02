import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { ProfileNav } from '../../components/profile-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { AppearanceTabs } from '../../components/index';
import { toast } from 'sonner';
import {
    User,
    Lock,
    Save,
    AlertTriangle,
    Check,
    Eye,
    EyeOff,
    Palette
} from 'lucide-react';

interface ProfileSettingsProps {
    auth: {
        user: {
            name: string;
            email: string;
            phone?: string;
            department?: string;
            email_verified_at: string | null;
        };
    };
    mustVerifyEmail?: boolean;
    status?: string;
    tab?: string;
}

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    department: string;
}

interface PasswordForm {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function Settings({ auth, mustVerifyEmail, status, tab = 'profile' }: ProfileSettingsProps) {
    const user = auth.user;
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile Information Form
    const profileForm = useForm<ProfileForm>({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
    });

    // Password Update Form
    const passwordForm = useForm<PasswordForm>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Profile updated successfully!');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.reset();
        toast.success('Password updated successfully!');
    };

    const renderProfileSection = () => (
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
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                required
                            />
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                type="text"
                                value={profileForm.data.department}
                                onChange={(e) => profileForm.setData('department', e.target.value)}
                            />
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
                                    onClick={() => toast.success('Verification link sent!')}
                                >
                                    Click here to re-send the verification email.
                                </Button>
                            </div>
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
    );

    const renderSecuritySection = () => (
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
                    <div className="space-y-4">
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
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {passwordForm.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );

    const renderAppearanceSection = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                </CardTitle>
                <CardDescription>
                    Customize how the application looks and feels.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Theme Preference</Label>
                        <p className="text-sm text-muted-foreground">
                            Choose how you want the application to look.
                        </p>
                        <AppearanceTabs className="mt-3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (tab) {
            case 'security':
                return renderSecuritySection();
            case 'appearance':
                return renderAppearanceSection();
            default:
                return renderProfileSection();
        }
    };

    return (
        <AppLayout
            title="Profile Settings"
            breadcrumbs={[
                { title: 'Profile', href: route('profile.index') },
                { title: 'Settings', href: route('profile.settings') }
            ]}
        >
            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-8 md:flex-row">
                        <aside className="md:w-1/4">
                            <ProfileNav />
                        </aside>
                        <main className="flex-1 md:max-w-2xl">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
