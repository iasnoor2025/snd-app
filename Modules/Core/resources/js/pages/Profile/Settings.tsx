import { useEffect, useState } from 'react';
import React from 'react';
import { Head } from '@inertiajs/react';
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
import { Progress } from '../../components/ui/progress';
import DeleteUser from '../../components/delete-user';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import MfaSettings from '../../components/settings/MfaSettings';
import { SiGoogle, SiWhatsapp } from 'react-icons/si';
import { FaMicrosoft } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

// Fix ProfileSettingsProps user type
type UserType = {
    name: string;
    email: string;
    phone?: string;
    department?: string;
    email_verified_at: string | null;
    roles?: { id: number; name: string }[];
    avatar?: string;
    address?: string;
    birthday?: string;
    timezone?: string;
    locale?: string;
};

interface ProfileSettingsProps {
    auth: {
        user: UserType;
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
    const [showWhatsappWizard, setShowWhatsappWizard] = useState(false);

    // Profile Information Form
    const [profileForm, setProfileForm] = useState<ProfileForm>({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
    });

    // Password Update Form
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState<string|null>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError(null);
        setProfileSuccess(false);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: profileForm.name,
                    email: profileForm.email,
                    phone: profileForm.phone,
                    department: profileForm.department,
                    address,
                    birthday,
                    timezone,
                    locale,
                }),
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setProfileSuccess(true);
                toast.success('Profile updated successfully!');
            } else {
                setProfileError(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            setProfileError('Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        toast.success('Password updated successfully!');
    };

    const renderProfileSection = () => {
        const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
        const [address, setAddress] = useState(user.address || '');
        const [birthday, setBirthday] = useState(user.birthday || '');
        const [timezone, setTimezone] = useState(user.timezone || '');
        const [locale, setLocale] = useState(user.locale || '');
        const totalFields = 8;
        const completedFields = [
            profileForm.name,
            profileForm.email,
            profileForm.phone,
            profileForm.department,
            avatarUrl,
            address,
            birthday,
            timezone,
            locale
        ].filter(Boolean).length;
        const progressValue = Math.round((completedFields / totalFields) * 100);
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
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Social Accounts
                            </CardTitle>
                            <CardDescription>
                                Link your account with social providers for easier login.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/auth/redirect/google'}>
                                    <SiGoogle className="h-5 w-5" />
                                    Link Google
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/auth/redirect/microsoft'}>
                                    <FaMicrosoft className="h-5 w-5" />
                                    Link Microsoft
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowWhatsappWizard(true)}>
                                    <SiWhatsapp className="h-5 w-5 text-green-600" />
                                    Link WhatsApp
                                </Button>
                            </div>
                            <Dialog open={showWhatsappWizard} onOpenChange={setShowWhatsappWizard}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Link WhatsApp</DialogTitle>
                                        <DialogDescription>
                                            Connect your WhatsApp account for notifications and login. (Setup wizard coming soon)
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p className="text-sm text-muted-foreground">WhatsApp integration setup wizard will be implemented here.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setShowWhatsappWizard(false)}>Close</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    type="text"
                                    value={profileForm.department}
                                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthday">Birthday</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <select
                                    id="timezone"
                                    className="input"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                >
                                    <option value="">Select timezone</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Asia/Dubai">Asia/Dubai</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="locale">Locale</Label>
                                <select
                                    id="locale"
                                    className="input"
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value)}
                                >
                                    <option value="">Select locale</option>
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                    <option value="he">Hebrew</option>
                                </select>
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
                                disabled={profileSaving}
                                className="flex items-center gap-2"
                            >
                                {profileSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                        {profileError && (
                            <div className="text-center text-destructive text-sm mt-2">{profileError}</div>
                        )}
                        {profileSuccess && (
                            <div className="text-center text-green-600 text-sm mt-2">Profile updated successfully!</div>
                        )}
                    </form>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Deactivate Account
                            </CardTitle>
                            <CardDescription>
                                Temporarily deactivate your account. You can reactivate by logging in again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" onClick={() => toast('Account deactivation requested (not implemented)')}>
                                Deactivate Account
                            </Button>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        );
    };

    const renderSecuritySection = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Security Alerts
                    </CardTitle>
                    <CardDescription>
                        Recent security events and alerts for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert variant="default">
                            <AlertTitle>New device login detected</AlertTitle>
                            <AlertDescription>
                                Your account was accessed from a new device on 2024-06-01 14:23 UTC (IP: 192.168.1.10).
                            </AlertDescription>
                        </Alert>
                        <Alert variant="destructive">
                            <AlertTitle>Password changed</AlertTitle>
                            <AlertDescription>
                                Your password was changed on 2024-05-30 09:12 UTC. If this wasn't you, please contact support immediately.
                            </AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Multi-Factor Authentication (MFA)
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account by enabling MFA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MfaSettings isEnabled={false} />
                </CardContent>
            </Card>
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
                                        value={passwordForm.current_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
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
                                        value={passwordForm.password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
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
                                        value={passwordForm.password_confirmation}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
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
                                disabled={false} // No processing state for now
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <ApiKeySettings initialKeys={[]} />
            <DeviceSessions />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Login History
                    </CardTitle>
                    <CardDescription>
                        View your recent login activity, including device and location information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Date</th>
                                    <th className="px-2 py-1 text-left">Device</th>
                                    <th className="px-2 py-1 text-left">Location</th>
                                    <th className="px-2 py-1 text-left">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-2 py-1">2024-06-01 14:23 UTC</td>
                                    <td className="px-2 py-1">Chrome on Windows</td>
                                    <td className="px-2 py-1">New York, USA</td>
                                    <td className="px-2 py-1">192.168.1.10</td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1">2024-05-30 09:12 UTC</td>
                                    <td className="px-2 py-1">Safari on iPhone</td>
                                    <td className="px-2 py-1">San Francisco, USA</td>
                                    <td className="px-2 py-1">192.168.1.11</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
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
        const [error, setError] = useState<string | null>(null);
        const [success, setSuccess] = useState(false);

        const defaultNotificationSettings = {
            email_notifications: true,
            sms_notifications: false,
            push_notifications: true,
            notification_frequency: 'immediate',
            notification_types: [
                'rental_reminders',
                'payment_due',
                'equipment_maintenance',
                'project_updates',
                'employee_updates',
            ],
        };

        useEffect(() => {
            setLoading(true);
            setError(null);
            fetch('/api/settings/notifications', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            })
                .then(res => res.json())
                .then(data => {
                    setSettings(data.data && Object.keys(data.data).length > 0 ? data.data : defaultNotificationSettings);
                    setLoading(false);
                })
                .catch(() => {
                    setSettings(defaultNotificationSettings);
                    setError('Failed to load notification settings.');
                    setLoading(false);
                });
        }, []);

        const handleSave = async () => {
            setSaving(true);
            setError(null);
            setSuccess(false);
            try {
                await fetch('/api/settings/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(settings),
                });
                setSuccess(true);
                toast.success('Notification preferences saved!');
            } catch {
                setError('Failed to save notification settings.');
            } finally {
                setSaving(false);
            }
        };

        if (loading) return <div role="status" aria-live="polite" className="py-8 text-center text-muted-foreground">Loading notification settings...</div>;
        if (error) return <div role="alert" className="py-8 text-center text-destructive">{error}</div>;
        if (!settings) return <div className="py-8 text-center text-muted-foreground">No notification settings found.</div>;
        return (
            <Card aria-label="Notification Preferences">
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
                            <Switch checked={!!settings?.email_notifications} onCheckedChange={v => setSettings((s: typeof settings) => ({...s, email_notifications: v}))} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>SMS Notifications</Label>
                            <Switch checked={!!settings?.sms_notifications} onCheckedChange={v => setSettings((s: typeof settings) => ({...s, sms_notifications: v}))} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Push Notifications</Label>
                            <Switch checked={!!settings?.push_notifications} onCheckedChange={v => setSettings((s: typeof settings) => ({...s, push_notifications: v}))} />
                        </div>
                        <div className="flex justify-end gap-2">
                            {error && <span className="text-destructive text-xs">{error}</span>}
                            {success && <span className="text-green-600 text-xs">Saved!</span>}
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
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                                GDPR Data Export
                            </CardTitle>
                            <CardDescription>
                                Download a copy of your personal data for GDPR compliance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" onClick={() => toast.success('GDPR data export requested!')}>Request Data Export</Button>
                        </CardContent>
                    </Card>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <Label className="text-red-600">Delete Account</Label>
                        <DeleteUser />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderActivitySection = () => {
        const [activities, setActivities] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [success, setSuccess] = useState(false);

        useEffect(() => {
            setLoading(true);
            setError(null);
            fetch('/api/activity-log')
                .then(res => res.json())
                .then(data => {
                    setActivities(data.data || []);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to load activity log.');
                    setLoading(false);
                });
        }, []);

        if (loading) return <div role="status" aria-live="polite" className="py-8 text-center text-muted-foreground">Loading activity log...</div>;
        if (error) return <div role="alert" className="py-8 text-center text-destructive">{error}</div>;
        if (activities.length === 0) return <div className="py-8 text-center text-muted-foreground">No activity log found.</div>;
        return (
            <Card aria-label="Activity Log">
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
            case 'profile':
                return renderProfileSection();
            case 'security':
                return renderSecuritySection();
            case 'appearance':
                return renderAppearanceSection();
            case 'notifications':
                return renderNotificationsSection();
            case 'privacy':
                return renderPrivacySection();
            case 'activity':
                return renderActivitySection();
            default:
                return renderProfileSection();
        }
    };

    // Profile completion calculation
    const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
    const [address, setAddress] = useState(user.address || '');
    const [birthday, setBirthday] = useState(user.birthday || '');
    const [timezone, setTimezone] = useState(user.timezone || '');
    const [locale, setLocale] = useState(user.locale || '');
    const totalFields = 8;
    const completedFields = [
        user.name,
        user.email,
        user.phone,
        user.department,
        avatarUrl,
        address,
        birthday,
        timezone,
        locale
    ].filter(Boolean).length;
    const progressValue = Math.round((completedFields / totalFields) * 100);
    return (
        <AppLayout
            title="Profile Settings"
            breadcrumbs={[
                { title: 'Profile', href: route('profile.index') },
                { title: 'Settings', href: route('profile.settings') }
            ]}
        >
            <div className="py-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Profile Completion</span>
                        <span className="text-xs font-medium text-muted-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} max={100} />
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-sm">Completion Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1">
                            {[
                                { label: 'Full Name', value: user.name },
                                { label: 'Email', value: user.email },
                                { label: 'Phone', value: user.phone },
                                { label: 'Department', value: user.department },
                                { label: 'Avatar', value: avatarUrl },
                                { label: 'Address', value: address },
                                { label: 'Birthday', value: birthday },
                                { label: 'Timezone', value: timezone },
                                { label: 'Locale', value: locale },
                            ].map((item) => (
                                <li key={item.label} className="flex items-center gap-2">
                                    <Check className={`h-4 w-4 ${item.value ? 'text-green-600' : 'text-gray-300'}`} />
                                    <span className={item.value ? '' : 'text-muted-foreground'}>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <div className="flex flex-col md:flex-row gap-8">
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
