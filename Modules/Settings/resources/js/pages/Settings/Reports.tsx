import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { FileText, Calendar, Mail, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ReportSettings {
    auto_generate_reports: boolean;
    report_frequency: string;
    report_format: string;
    email_reports: boolean;
    report_recipients: string;
    include_charts: boolean;
    include_summary: boolean;
    include_details: boolean;
    retention_period: number;
    compress_reports: boolean;
    watermark_reports: boolean;
    custom_logo: boolean;
    report_timezone: string;
    date_range_default: string;
}

interface Props {
    settings: ReportSettings;
    timezones: Record<string, string>;
}

const Reports: React.FC<Props> = ({ settings, timezones }) => {
    const { data, setData, post, processing, errors } = useForm<ReportSettings>({
        auto_generate_reports: settings.auto_generate_reports || false,
        report_frequency: settings.report_frequency || 'monthly',
        report_format: settings.report_format || 'pdf',
        email_reports: settings.email_reports || false,
        report_recipients: settings.report_recipients || '',
        include_charts: settings.include_charts || true,
        include_summary: settings.include_summary || true,
        include_details: settings.include_details || true,
        retention_period: settings.retention_period || 12,
        compress_reports: settings.compress_reports || false,
        watermark_reports: settings.watermark_reports || true,
        custom_logo: settings.custom_logo || true,
        report_timezone: settings.report_timezone || 'UTC',
        date_range_default: settings.date_range_default || 'last_month',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.reports.update'), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Report settings updated successfully.',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to update report settings.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleSwitchChange = (key: keyof ReportSettings, value: boolean) => {
        setData(key, value);
    };

    const handleSelectChange = (key: keyof ReportSettings, value: string) => {
        setData(key, value);
    };

    const handleInputChange = (key: keyof ReportSettings, value: string | number) => {
        setData(key, value);
    };

    const frequencyOptions = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
    ];

    const formatOptions = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel (XLSX)' },
        { value: 'csv', label: 'CSV' },
        { value: 'html', label: 'HTML' },
    ];

    const dateRangeOptions = [
        { value: 'last_week', label: 'Last Week' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_quarter', label: 'Last Quarter' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'current_month', label: 'Current Month' },
        { value: 'current_quarter', label: 'Current Quarter' },
        { value: 'current_year', label: 'Current Year' },
    ];

    return (
        <>
            <Head title="Report Settings" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Report Settings</h2>
                    <p className="text-muted-foreground">
                        Configure how reports are generated, formatted, and distributed.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Automatic Report Generation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Automatic Report Generation
                            </CardTitle>
                            <CardDescription>
                                Configure automatic report generation and scheduling
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label htmlFor="auto_generate_reports" className="text-sm font-medium">
                                        Enable Automatic Reports
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically generate reports based on schedule
                                    </p>
                                </div>
                                <Switch
                                    id="auto_generate_reports"
                                    checked={data.auto_generate_reports}
                                    onCheckedChange={(checked) => handleSwitchChange('auto_generate_reports', checked)}
                                />
                            </div>

                            {data.auto_generate_reports && (
                                <>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="report_frequency">Report Frequency</Label>
                                            <Select
                                                value={data.report_frequency}
                                                onValueChange={(value) => handleSelectChange('report_frequency', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {frequencyOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_range_default">Default Date Range</Label>
                                            <Select
                                                value={data.date_range_default}
                                                onValueChange={(value) => handleSelectChange('date_range_default', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select date range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dateRangeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Report Format & Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Report Format & Content
                            </CardTitle>
                            <CardDescription>
                                Configure report format and included content
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="report_format">Default Format</Label>
                                    <Select
                                        value={data.report_format}
                                        onValueChange={(value) => handleSelectChange('report_format', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formatOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="report_timezone">Report Timezone</Label>
                                    <Select
                                        value={data.report_timezone}
                                        onValueChange={(value) => handleSelectChange('report_timezone', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(timezones).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Include in Reports</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="include_summary"
                                            checked={data.include_summary}
                                            onCheckedChange={(checked) => handleSwitchChange('include_summary', checked)}
                                        />
                                        <Label htmlFor="include_summary" className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4" />
                                            Summary
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="include_charts"
                                            checked={data.include_charts}
                                            onCheckedChange={(checked) => handleSwitchChange('include_charts', checked)}
                                        />
                                        <Label htmlFor="include_charts" className="flex items-center gap-2">
                                            <PieChart className="h-4 w-4" />
                                            Charts
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="include_details"
                                            checked={data.include_details}
                                            onCheckedChange={(checked) => handleSwitchChange('include_details', checked)}
                                        />
                                        <Label htmlFor="include_details" className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Details
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Distribution
                            </CardTitle>
                            <CardDescription>
                                Configure automatic email distribution of reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label htmlFor="email_reports" className="text-sm font-medium">
                                        Email Reports Automatically
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send generated reports via email
                                    </p>
                                </div>
                                <Switch
                                    id="email_reports"
                                    checked={data.email_reports}
                                    onCheckedChange={(checked) => handleSwitchChange('email_reports', checked)}
                                />
                            </div>

                            {data.email_reports && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label htmlFor="report_recipients">Email Recipients</Label>
                                        <Textarea
                                            id="report_recipients"
                                            placeholder="Enter email addresses separated by commas"
                                            value={data.report_recipients}
                                            onChange={(e) => handleInputChange('report_recipients', e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Enter multiple email addresses separated by commas
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Advanced Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Advanced Settings
                            </CardTitle>
                            <CardDescription>
                                Additional report configuration options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="retention_period">Retention Period (months)</Label>
                                        <Input
                                            id="retention_period"
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={data.retention_period}
                                            onChange={(e) => handleInputChange('retention_period', parseInt(e.target.value))}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            How long to keep generated reports
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="compress_reports" className="text-sm font-medium">
                                                Compress Reports
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Compress large reports to save space
                                            </p>
                                        </div>
                                        <Switch
                                            id="compress_reports"
                                            checked={data.compress_reports}
                                            onCheckedChange={(checked) => handleSwitchChange('compress_reports', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="watermark_reports" className="text-sm font-medium">
                                                Add Watermark
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Add company watermark to reports
                                            </p>
                                        </div>
                                        <Switch
                                            id="watermark_reports"
                                            checked={data.watermark_reports}
                                            onCheckedChange={(checked) => handleSwitchChange('watermark_reports', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="custom_logo" className="text-sm font-medium">
                                                Include Company Logo
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Include company logo in report headers
                                            </p>
                                        </div>
                                        <Switch
                                            id="custom_logo"
                                            checked={data.custom_logo}
                                            onCheckedChange={(checked) => handleSwitchChange('custom_logo', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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

export default Reports;
