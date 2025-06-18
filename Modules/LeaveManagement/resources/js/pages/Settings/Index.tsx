import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
    Settings,
    Save,
    RotateCcw,
    Download,
    Upload,
    Calendar,
    Clock,
    Users,
    Bell,
    Shield,
    DollarSign,
    AlertTriangle,
    Info
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Temporary inline implementation - replace with actual hook
const usePermission = () => ({
    can: (permission: string) => true // Placeholder implementation
});

interface LeaveSettings {
    // General Settings
    leave_year_start_month: number;
    leave_year_start_day: number;
    weekend_days: string[];
    public_holidays_affect_leave: boolean;
    allow_half_day_leave: boolean;
    allow_negative_balance: boolean;
    max_negative_balance_days: number;

    // Approval Settings
    auto_approve_sick_leave: boolean;
    require_medical_certificate_days: number;
    max_consecutive_days_without_approval: number;
    approval_hierarchy_levels: number;
    escalation_days: number;

    // Carry Forward Settings
    global_carry_forward_enabled: boolean;
    carry_forward_deadline_month: number;
    carry_forward_deadline_day: number;
    max_carry_forward_percentage: number;
    carry_forward_expiry_months: number;

    // Notification Settings
    notify_employee_on_approval: boolean;
    notify_employee_on_rejection: boolean;
    notify_manager_on_request: boolean;
    notify_hr_on_long_leave: boolean;
    long_leave_threshold_days: number;
    reminder_days_before_expiry: number[];

    // Probation Settings
    probation_leave_allowed: boolean;
    probation_period_months: number;
    probation_leave_types: string[];

    // Advanced Settings
    leave_encashment_enabled: boolean;
    encashment_percentage: number;
    min_encashment_days: number;
    max_encashment_days: number;
    leave_calendar_integration: boolean;
    employee_self_cancel_hours: number;
    manager_override_balance: boolean;
}

interface Props {
    settings: LeaveSettings;
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

const weekDays = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
];

export default function Index({ settings }: Props) {
  const { t } = useTranslation('leave');

    const { can } = usePermission();
    const [activeTab, setActiveTab] = useState('general');
    const [reminderDays, setReminderDays] = useState<string>(
        settings.reminder_days_before_expiry.join(', ')
    );
    const [probationTypes, setProbationTypes] = useState<string>(
        settings.probation_leave_types.join(', ')
    );

    const { data, setData, put, processing, errors, reset } = useForm<LeaveSettings>({
        ...settings,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse reminder days and probation types
        const formData = {
            ...data,
            reminder_days_before_expiry: reminderDays
                .split(',')
                .map(day => parseInt(day.trim()))
                .filter(day => !isNaN(day)),
            probation_leave_types: probationTypes
                .split(',')
                .map(type => type.trim())
                .filter(type => type.length > 0),
        };

        put(route('leaves.settings.update'), {
            data: formData,
            onSuccess: () => {
                toast.success('Leave settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update leave settings. Please check the form for errors.');
            },
        });
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            put(route('leaves.settings.reset'), {
                onSuccess: () => {
                    toast.success('Leave settings reset to defaults successfully!');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to reset leave settings.');
                },
            });
        }
    };

    const handleExport = () => {
        window.location.href = route('leaves.settings.export');
    };

    const handleWeekendDayToggle = (day: string) => {
        const currentDays = data.weekend_days || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        setData('weekend_days', newDays);
    };

    return (
        <>
            <Head title={t('leave_settings')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('leave_settings')}</h1>
                        <Breadcrumb className="mt-2">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('leaves.requests.index')}>Leave Management</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>Settings</BreadcrumbPage>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={processing}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            disabled={processing || !can('leave-settings.edit')}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>
                    </div>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="general" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="approval" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Approval
                            </TabsTrigger>
                            <TabsTrigger value="carryforward" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('carry_forward')}
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="probation" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Probation
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        General Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure basic leave management settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Leave Year Settings */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="leave_year_start_month">{t('lbl_leave_year_start_month')}</Label>
                                            <Select
                                                value={data.leave_year_start_month?.toString()}
                                                onValueChange={(value) => setData('leave_year_start_month', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('ph_select_month')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem key={month.value} value={month.value.toString()}>
                                                            {month.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.leave_year_start_month && (
                                                <p className="text-sm text-red-600">{errors.leave_year_start_month}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="leave_year_start_day">{t('lbl_leave_year_start_day')}</Label>
                                            <Input
                                                id="leave_year_start_day"
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={data.leave_year_start_day}
                                                onChange={(e) => setData('leave_year_start_day', parseInt(e.target.value))}
                                            />
                                            {errors.leave_year_start_day && (
                                                <p className="text-sm text-red-600">{errors.leave_year_start_day}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Weekend Days */}
                                    <div className="space-y-3">
                                        <Label>{t('lbl_weekend_days')}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {weekDays.map((day) => (
                                                <Badge
                                                    key={day.value}
                                                    variant={data.weekend_days?.includes(day.value) ? 'default' : 'outline'}
                                                    className="cursor-pointer"
                                                    onClick={() => handleWeekendDayToggle(day.value)}
                                                >
                                                    {day.label}
                                                </Badge>
                                            ))}
                                        </div>
                                        {errors.weekend_days && (
                                            <p className="text-sm text-red-600">{errors.weekend_days}</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Leave Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_public_holidays_affect_leave')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Whether public holidays should be excluded from leave calculations
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.public_holidays_affect_leave}
                                                onCheckedChange={(checked) => setData('public_holidays_affect_leave', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_allow_half_day_leave')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow employees to request half-day leave
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.allow_half_day_leave}
                                                onCheckedChange={(checked) => setData('allow_half_day_leave', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_allow_negative_balance')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow employees to take leave even with insufficient balance
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.allow_negative_balance}
                                                onCheckedChange={(checked) => setData('allow_negative_balance', checked)}
                                            />
                                        </div>

                                        {data.allow_negative_balance && (
                                            <div className="space-y-2">
                                                <Label htmlFor="max_negative_balance_days">Maximum Negative Balance (Days)</Label>
                                                <Input
                                                    id="max_negative_balance_days"
                                                    type="number"
                                                    min="0"
                                                    max="30"
                                                    value={data.max_negative_balance_days}
                                                    onChange={(e) => setData('max_negative_balance_days', parseInt(e.target.value))}
                                                />
                                                {errors.max_negative_balance_days && (
                                                    <p className="text-sm text-red-600">{errors.max_negative_balance_days}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Approval Settings */}
                        <TabsContent value="approval">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Approval Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure leave approval workflow and requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('lbl_auto_approve_sick_leave')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically approve sick leave requests
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.auto_approve_sick_leave}
                                            onCheckedChange={(checked) => setData('auto_approve_sick_leave', checked)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="require_medical_certificate_days">Medical Certificate Required After (Days)</Label>
                                            <Input
                                                id="require_medical_certificate_days"
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={data.require_medical_certificate_days}
                                                onChange={(e) => setData('require_medical_certificate_days', parseInt(e.target.value))}
                                            />
                                            {errors.require_medical_certificate_days && (
                                                <p className="text-sm text-red-600">{errors.require_medical_certificate_days}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_consecutive_days_without_approval">{t('lbl_max_consecutive_days_without_approval')}</Label>
                                            <Input
                                                id="max_consecutive_days_without_approval"
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={data.max_consecutive_days_without_approval}
                                                onChange={(e) => setData('max_consecutive_days_without_approval', parseInt(e.target.value))}
                                            />
                                            {errors.max_consecutive_days_without_approval && (
                                                <p className="text-sm text-red-600">{errors.max_consecutive_days_without_approval}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="approval_hierarchy_levels">{t('lbl_approval_hierarchy_levels')}</Label>
                                            <Input
                                                id="approval_hierarchy_levels"
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={data.approval_hierarchy_levels}
                                                onChange={(e) => setData('approval_hierarchy_levels', parseInt(e.target.value))}
                                            />
                                            {errors.approval_hierarchy_levels && (
                                                <p className="text-sm text-red-600">{errors.approval_hierarchy_levels}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="escalation_days">Escalation After (Days)</Label>
                                            <Input
                                                id="escalation_days"
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={data.escalation_days}
                                                onChange={(e) => setData('escalation_days', parseInt(e.target.value))}
                                            />
                                            {errors.escalation_days && (
                                                <p className="text-sm text-red-600">{errors.escalation_days}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Carry Forward Settings */}
                        <TabsContent value="carryforward">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        {t('carry_forward_settings')}
                                    </CardTitle>
                                    <CardDescription>
                                        Configure leave carry forward policies
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('lbl_enable_global_carry_forward')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow unused leave to be carried forward to next year
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.global_carry_forward_enabled}
                                            onCheckedChange={(checked) => setData('global_carry_forward_enabled', checked)}
                                        />
                                    </div>

                                    {data.global_carry_forward_enabled && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="carry_forward_deadline_month">{t('lbl_carry_forward_deadline_month')}</Label>
                                                    <Select
                                                        value={data.carry_forward_deadline_month?.toString()}
                                                        onValueChange={(value) => setData('carry_forward_deadline_month', parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('ph_select_month')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {months.map((month) => (
                                                                <SelectItem key={month.value} value={month.value.toString()}>
                                                                    {month.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.carry_forward_deadline_month && (
                                                        <p className="text-sm text-red-600">{errors.carry_forward_deadline_month}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="carry_forward_deadline_day">{t('lbl_carry_forward_deadline_day')}</Label>
                                                    <Input
                                                        id="carry_forward_deadline_day"
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        value={data.carry_forward_deadline_day}
                                                        onChange={(e) => setData('carry_forward_deadline_day', parseInt(e.target.value))}
                                                    />
                                                    {errors.carry_forward_deadline_day && (
                                                        <p className="text-sm text-red-600">{errors.carry_forward_deadline_day}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="max_carry_forward_percentage">Max Carry Forward Percentage (%)</Label>
                                                    <Input
                                                        id="max_carry_forward_percentage"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={data.max_carry_forward_percentage}
                                                        onChange={(e) => setData('max_carry_forward_percentage', parseInt(e.target.value))}
                                                    />
                                                    {errors.max_carry_forward_percentage && (
                                                        <p className="text-sm text-red-600">{errors.max_carry_forward_percentage}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="carry_forward_expiry_months">Carry Forward Expiry (Months)</Label>
                                                    <Input
                                                        id="carry_forward_expiry_months"
                                                        type="number"
                                                        min="1"
                                                        max="24"
                                                        value={data.carry_forward_expiry_months}
                                                        onChange={(e) => setData('carry_forward_expiry_months', parseInt(e.target.value))}
                                                    />
                                                    {errors.carry_forward_expiry_months && (
                                                        <p className="text-sm text-red-600">{errors.carry_forward_expiry_months}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notification Settings */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        Notification Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure notification preferences for leave events
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_notify_employee_on_approval')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Send notification when leave is approved
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.notify_employee_on_approval}
                                                onCheckedChange={(checked) => setData('notify_employee_on_approval', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_notify_employee_on_rejection')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Send notification when leave is rejected
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.notify_employee_on_rejection}
                                                onCheckedChange={(checked) => setData('notify_employee_on_rejection', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_notify_manager_on_request')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Send notification to manager when leave is requested
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.notify_manager_on_request}
                                                onCheckedChange={(checked) => setData('notify_manager_on_request', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_notify_hr_on_long_leave')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Send notification to HR for long leave requests
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.notify_hr_on_long_leave}
                                                onCheckedChange={(checked) => setData('notify_hr_on_long_leave', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="long_leave_threshold_days">Long Leave Threshold (Days)</Label>
                                            <Input
                                                id="long_leave_threshold_days"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={data.long_leave_threshold_days}
                                                onChange={(e) => setData('long_leave_threshold_days', parseInt(e.target.value))}
                                            />
                                            {errors.long_leave_threshold_days && (
                                                <p className="text-sm text-red-600">{errors.long_leave_threshold_days}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reminder_days">{t('lbl_reminder_days_before_expiry')}</Label>
                                            <Input
                                                id="reminder_days"
                                                placeholder={t('ph_eg_30_7_1')}
                                                value={reminderDays}
                                                onChange={(e) => setReminderDays(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Comma-separated list of days
                                            </p>
                                            {errors.reminder_days_before_expiry && (
                                                <p className="text-sm text-red-600">{errors.reminder_days_before_expiry}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Probation Settings */}
                        <TabsContent value="probation">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Probation Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure leave policies for employees on probation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('lbl_allow_probation_leave')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow employees on probation to take leave
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.probation_leave_allowed}
                                            onCheckedChange={(checked) => setData('probation_leave_allowed', checked)}
                                        />
                                    </div>

                                    {data.probation_leave_allowed && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="probation_period_months">Probation Period (Months)</Label>
                                                <Input
                                                    id="probation_period_months"
                                                    type="number"
                                                    min="1"
                                                    max="24"
                                                    value={data.probation_period_months}
                                                    onChange={(e) => setData('probation_period_months', parseInt(e.target.value))}
                                                />
                                                {errors.probation_period_months && (
                                                    <p className="text-sm text-red-600">{errors.probation_period_months}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="probation_leave_types">{t('lbl_allowed_leave_types_during_probation')}</Label>
                                                <Input
                                                    id="probation_leave_types"
                                                    placeholder={t('ph_eg_sick_emergency_maternity')}
                                                    value={probationTypes}
                                                    onChange={(e) => setProbationTypes(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Comma-separated list of leave types
                                                </p>
                                                {errors.probation_leave_types && (
                                                    <p className="text-sm text-red-600">{errors.probation_leave_types}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Advanced Settings */}
                        <TabsContent value="advanced">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Advanced Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure advanced leave features and integrations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Leave Encashment */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_enable_leave_encashment')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow employees to encash unused leave
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.leave_encashment_enabled}
                                                onCheckedChange={(checked) => setData('leave_encashment_enabled', checked)}
                                            />
                                        </div>

                                        {data.leave_encashment_enabled && (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="encashment_percentage">Encashment Percentage (%)</Label>
                                                    <Input
                                                        id="encashment_percentage"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={data.encashment_percentage}
                                                        onChange={(e) => setData('encashment_percentage', parseInt(e.target.value))}
                                                    />
                                                    {errors.encashment_percentage && (
                                                        <p className="text-sm text-red-600">{errors.encashment_percentage}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="min_encashment_days">{t('lbl_min_encashment_days')}</Label>
                                                    <Input
                                                        id="min_encashment_days"
                                                        type="number"
                                                        min="1"
                                                        max="365"
                                                        value={data.min_encashment_days}
                                                        onChange={(e) => setData('min_encashment_days', parseInt(e.target.value))}
                                                    />
                                                    {errors.min_encashment_days && (
                                                        <p className="text-sm text-red-600">{errors.min_encashment_days}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="max_encashment_days">{t('lbl_max_encashment_days')}</Label>
                                                    <Input
                                                        id="max_encashment_days"
                                                        type="number"
                                                        min="1"
                                                        max="365"
                                                        value={data.max_encashment_days}
                                                        onChange={(e) => setData('max_encashment_days', parseInt(e.target.value))}
                                                    />
                                                    {errors.max_encashment_days && (
                                                        <p className="text-sm text-red-600">{errors.max_encashment_days}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Other Advanced Settings */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_leave_calendar_integration')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Integrate with external calendar systems
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.leave_calendar_integration}
                                                onCheckedChange={(checked) => setData('leave_calendar_integration', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>{t('lbl_manager_override_balance')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow managers to override leave balance restrictions
                                                </p>
                                            </div>
                                            <Switch
                                                checked={data.manager_override_balance}
                                                onCheckedChange={(checked) => setData('manager_override_balance', checked)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="employee_self_cancel_hours">Employee Self-Cancel Period (Hours)</Label>
                                            <Input
                                                id="employee_self_cancel_hours"
                                                type="number"
                                                min="0"
                                                max="168"
                                                value={data.employee_self_cancel_hours}
                                                onChange={(e) => setData('employee_self_cancel_hours', parseInt(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Hours before leave start date when employees can self-cancel
                                            </p>
                                            {errors.employee_self_cancel_hours && (
                                                <p className="text-sm text-red-600">{errors.employee_self_cancel_hours}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => reset()}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !can('leave-settings.edit')}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </Tabs>
                </form>
            </div>
        </>
    );
}
