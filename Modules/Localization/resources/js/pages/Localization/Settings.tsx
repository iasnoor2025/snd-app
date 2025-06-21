import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Textarea } from "@/Core";
import { Switch } from "@/Core";
import { Separator } from "@/Core";
import { Alert, AlertDescription } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import {
    ArrowLeft,
    Save,
    Settings as SettingsIcon,
    Globe,
    Languages,
    Calendar,
    Clock,
    DollarSign,
    Users,
    Shield,
    Zap,
    AlertCircle,
    CheckCircle,
    Info,
    RefreshCw
} from 'lucide-react';

interface LocalizationSettings {
    default_language: string;
    fallback_language: string;
    auto_detect_language: boolean;
    cache_translations: boolean;
    cache_duration: number;
    default_currency: string;
    default_timezone: string;
    default_date_format: string;
    default_time_format: string;
    rtl_support: boolean;
    pluralization_rules: boolean;
    translation_missing_key_behavior: 'show_key' | 'show_fallback' | 'show_empty';
    enable_translation_logging: boolean;
    enable_user_language_preference: boolean;
    enable_browser_language_detection: boolean;
}

interface SettingsProps {
    settings: LocalizationSettings;
    languages: Record<string, any>;
    currencies: string[];
    timezones: string[];
    dateFormats: string[];
    timeFormats: string[];
}

export default function Settings({
    settings,
    languages,
    currencies,
    timezones,
    dateFormats,
    timeFormats
}: SettingsProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const { data, setData, post, processing, errors, isDirty } = useForm<LocalizationSettings>(settings);

    const handleSave = () => {
        setIsSaving(true);
        post(route('localization.settings.update'), {
            onSuccess: () => {
                setIsSaving(false);
            },
            onError: () => {
                setIsSaving(false);
            }
        });
    };

    const handleReset = () => {
        setData(settings);
    };

    const languageOptions = Object.entries(languages).map(([code, lang]) => ({
        value: code,
        label: `${lang.name} (${code.toUpperCase()})`
    }));

    return (
        <>
            <Head title="Localization Settings" />

            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('localization.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Localization Settings</h1>
                            <p className="text-muted-foreground">
                                Configure global localization preferences and behavior
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isDirty && (
                            <Button variant="outline" onClick={handleReset}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={processing || isSaving || !isDirty}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing || isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general" className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>General</span>
                        </TabsTrigger>
                        <TabsTrigger value="regional" className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Regional</span>
                        </TabsTrigger>
                        <TabsTrigger value="behavior" className="flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>Behavior</span>
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Advanced</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Languages className="h-5 w-5 mr-2" />
                                    Language Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure default and fallback languages for your application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="default_language">Default Language</Label>
                                        <Select
                                            value={data.default_language}
                                            onValueChange={(value) => setData('default_language', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select default language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {languageOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            The primary language for your application
                                        </p>
                                        {errors.default_language && (
                                            <p className="text-sm text-red-600">{errors.default_language}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fallback_language">Fallback Language</Label>
                                        <Select
                                            value={data.fallback_language}
                                            onValueChange={(value) => setData('fallback_language', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fallback language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {languageOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            Used when translations are missing
                                        </p>
                                        {errors.fallback_language && (
                                            <p className="text-sm text-red-600">{errors.fallback_language}</p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-detect Language</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically detect user's preferred language from browser settings
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.auto_detect_language}
                                            onCheckedChange={(checked) => setData('auto_detect_language', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>User Language Preference</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow users to set their own language preference
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.enable_user_language_preference}
                                            onCheckedChange={(checked) => setData('enable_user_language_preference', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Browser Language Detection</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Use browser's Accept-Language header for language detection
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.enable_browser_language_detection}
                                            onCheckedChange={(checked) => setData('enable_browser_language_detection', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Regional Settings */}
                    <TabsContent value="regional" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Currency & Timezone
                                    </CardTitle>
                                    <CardDescription>
                                        Configure default currency and timezone settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="default_currency">Default Currency</Label>
                                        <Select
                                            value={data.default_currency}
                                            onValueChange={(value) => setData('default_currency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem key={currency} value={currency}>
                                                        {currency}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.default_currency && (
                                            <p className="text-sm text-red-600">{errors.default_currency}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_timezone">Default Timezone</Label>
                                        <Select
                                            value={data.default_timezone}
                                            onValueChange={(value) => setData('default_timezone', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timezones.map((timezone) => (
                                                    <SelectItem key={timezone} value={timezone}>
                                                        {timezone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.default_timezone && (
                                            <p className="text-sm text-red-600">{errors.default_timezone}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Date & Time Formats
                                    </CardTitle>
                                    <CardDescription>
                                        Configure how dates and times are displayed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="default_date_format">Date Format</Label>
                                        <Select
                                            value={data.default_date_format}
                                            onValueChange={(value) => setData('default_date_format', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select date format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dateFormats.map((format) => (
                                                    <SelectItem key={format} value={format}>
                                                        {format}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.default_date_format && (
                                            <p className="text-sm text-red-600">{errors.default_date_format}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_time_format">Time Format</Label>
                                        <Select
                                            value={data.default_time_format}
                                            onValueChange={(value) => setData('default_time_format', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeFormats.map((format) => (
                                                    <SelectItem key={format} value={format}>
                                                        {format}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.default_time_format && (
                                            <p className="text-sm text-red-600">{errors.default_time_format}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Behavior Settings */}
                    <TabsContent value="behavior" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="h-5 w-5 mr-2" />
                                    Translation Behavior
                                </CardTitle>
                                <CardDescription>
                                    Configure how the application handles missing translations and errors
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="missing_key_behavior">Missing Translation Behavior</Label>
                                    <Select
                                        value={data.translation_missing_key_behavior}
                                        onValueChange={(value: 'show_key' | 'show_fallback' | 'show_empty') =>
                                            setData('translation_missing_key_behavior', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="show_key">Show Translation Key</SelectItem>
                                            <SelectItem value="show_fallback">Show Fallback Language</SelectItem>
                                            <SelectItem value="show_empty">Show Empty String</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        What to display when a translation is missing
                                    </p>
                                    {errors.translation_missing_key_behavior && (
                                        <p className="text-sm text-red-600">{errors.translation_missing_key_behavior}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>RTL Language Support</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enable right-to-left text direction support
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.rtl_support}
                                            onCheckedChange={(checked) => setData('rtl_support', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Pluralization Rules</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enable advanced pluralization rules for complex languages
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.pluralization_rules}
                                            onCheckedChange={(checked) => setData('pluralization_rules', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Translation Logging</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Log missing translations and errors for debugging
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.enable_translation_logging}
                                            onCheckedChange={(checked) => setData('enable_translation_logging', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced Settings */}
                    <TabsContent value="advanced" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Performance & Caching
                                </CardTitle>
                                <CardDescription>
                                    Advanced settings for performance optimization
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Cache Translations</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Cache translation files to improve performance
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.cache_translations}
                                        onCheckedChange={(checked) => setData('cache_translations', checked)}
                                    />
                                </div>

                                {data.cache_translations && (
                                    <div className="space-y-2">
                                        <Label htmlFor="cache_duration">Cache Duration (minutes)</Label>
                                        <Input
                                            id="cache_duration"
                                            type="number"
                                            value={data.cache_duration}
                                            onChange={(e) => setData('cache_duration', parseInt(e.target.value) || 0)}
                                            min="0"
                                            max="10080"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            How long to cache translations (0 = forever, max 7 days)
                                        </p>
                                        {errors.cache_duration && (
                                            <p className="text-sm text-red-600">{errors.cache_duration}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Cache Status</p>
                                            <p className="text-lg font-semibold text-green-600">Active</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Translation Files</p>
                                            <p className="text-lg font-semibold">24</p>
                                        </div>
                                        <Languages className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                            <p className="text-lg font-semibold">2 hours ago</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Help Information */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Configuration Tips:</strong> Changes to language settings may require clearing the application cache.
                        RTL support requires additional CSS configuration. Translation caching significantly improves performance
                        but may delay the appearance of new translations.
                    </AlertDescription>
                </Alert>
            </div>
        </>
    );
}














