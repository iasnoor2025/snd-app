import { useEffect, useState } from 'react';
import React from 'react';
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
    Palette,
    Bell,
    Shield,
    CreditCard,
    Activity
} from 'lucide-react';
import { DeviceSessions } from '../../components/settings/DeviceSessions';
import ApiKeySettings from '../../components/settings/ApiKeySettings';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { SmartAvatar } from '../../components/ui/smart-avatar';
import AvatarUploader from '../../components/Avatar/AvatarUploader';
import { Badge } from '../../components/ui/badge';

interface ProfileSettingsProps {
    auth: {
        user: {
            name: string;
            email: string;
            phone?: string;
            department?: string;
            email_verified_at: string | null;
            roles?: { id: number; name: string }[];
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

    const renderProfileSection = () => {
        const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
        return (
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
                    <div className="flex items-center gap-4 mb-6">
                        <SmartAvatar user={{...user, avatar: avatarUrl}} size="xl" />
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.roles && user.roles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.roles.map((role) => (
                                        <Badge key={role.id} variant="outline" className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-6">
                        <AvatarUploader user={{...user, avatar: avatarUrl}} onAvatarUpdate={setAvatarUrl} />
                    </div>
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
    };

    const renderSecuritySection = () => (
        <div className="space-y-6">
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
            <ApiKeySettings initialKeys={[]} />
            <DeviceSessions />
        </div>
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

    const renderNotificationsSection = () => {
        const [settings, setSettings] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);

        useEffect(() => {
            fetch('/api/settings/notifications')
                .then(res => res.json())
                .then(data => {
                    setSettings(data.data);
                    setLoading(false);
                });
        }, []);

        const handleSave = async () => {
            setSaving(true);
            await fetch('/api/settings/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            setSaving(false);
            toast.success('Notification preferences saved!');
        };

        if (loading) return <div>Loading...</div>;
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Manage how you receive notifications (email, SMS, in-app, etc.).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Email Notifications</Label>
                            <Switch checked={!!settings?.email_notifications} onCheckedChange={v => setSettings(s => ({...s, email_notifications: v}))} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>SMS Notifications</Label>
                            <Switch checked={!!settings?.sms_notifications} onCheckedChange={v => setSettings(s => ({...s, sms_notifications: v}))} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Push Notifications</Label>
                            <Switch checked={!!settings?.push_notifications} onCheckedChange={v => setSettings(s => ({...s, push_notifications: v}))} />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderPrivacySection = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                </CardTitle>
                <CardDescription>
                    Control your privacy, data export, and account deletion options.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Show profile to others</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Export my data</Label>
                        <Button variant="outline" onClick={() => toast.success('Data export started!')}>Export</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <Label className="text-red-600">Delete Account</Label>
                        <Button variant="destructive" onClick={() => toast('Account deletion requested (not implemented)', {description: 'This is a placeholder.'})}>Delete</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderBillingSection = () => {
        const [invoices, setInvoices] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        useEffect(() => {
            fetch('/api/invoices')
                .then(res => res.json())
                .then(data => {
                    setInvoices(data.data || []);
                    setLoading(false);
                });
        }, []);
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Billing
                    </CardTitle>
                    <CardDescription>
                        Manage your billing information, payment methods, and invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div>Loading...</div> : (
                        <div className="space-y-4">
                            {invoices.length === 0 ? <div>No invoices found.</div> : (
                                <ul className="space-y-2">
                                    {invoices.map(inv => (
                                        <li key={inv.id} className="flex justify-between border-b pb-2">
                                            <span>#{inv.invoice_number} - {inv.status}</span>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/invoices/${inv.id}`}>View</a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const renderActivitySection = () => {
        const [activities, setActivities] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        useEffect(() => {
            fetch('/api/activity-log')
                .then(res => res.json())
                .then(data => {
                    setActivities(data.data || []);
                    setLoading(false);
                });
        }, []);
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activity Log
                    </CardTitle>
                    <CardDescription>
                        View your recent account activity and security events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div>Loading...</div> : <ActivityFeed activities={activities} onRemove={() => {}} />}
                </CardContent>
            </Card>
        );
    };

    const renderContent = () => {
        switch (tab) {
            case 'security':
                return renderSecuritySection();
            case 'appearance':
                return renderAppearanceSection();
            case 'notifications':
                return renderNotificationsSection();
            case 'privacy':
                return renderPrivacySection();
            case 'billing':
                return renderBillingSection();
            case 'activity':
                return renderActivitySection();
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
                <div className="flex flex-col gap-8 md:flex-row">
                    <aside className="md:w-1/4">
                        <ProfileNav />
                    </aside>
                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
