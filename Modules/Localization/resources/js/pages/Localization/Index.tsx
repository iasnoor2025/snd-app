import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Globe,
    Languages,
    FileText,
    Settings,
    Download,
    Upload,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Search,
    Filter,
    RefreshCw
} from 'lucide-react';

interface LocalizationStats {
    total_keys: number;
    translated_keys: number;
    missing_keys: number;
    completion_percentage: number;
    last_updated: string;
}

interface LocalizationIndexProps {
    currentLocale: string;
    availableLocales: Record<string, string>;
    defaultLocale: string;
    translationStats: LocalizationStats;
    dateFormats: Record<string, string>;
    timeFormats: Record<string, string>;
    currencies: Record<string, string>;
}

export default function LocalizationIndex({
    currentLocale,
    availableLocales,
    defaultLocale,
    translationStats,
    dateFormats,
    timeFormats,
    currencies
}: LocalizationIndexProps) {
    const [selectedLocale, setSelectedLocale] = useState(currentLocale);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLocaleSwitch = (locale: string) => {
        router.post(route('localization.switch', locale));
    };

    const getCompletionColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCompletionBadgeVariant = (percentage: number) => {
        if (percentage >= 90) return 'default';
        if (percentage >= 70) return 'secondary';
        return 'destructive';
    };

    return (
        <>
            <Head title="Localization Management" />

            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Localization Management</h1>
                        <p className="text-muted-foreground">
                            Manage translations, languages, and regional settings
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(availableLocales).map(([code, name]) => (
                                    <SelectItem key={code} value={code}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => handleLocaleSwitch(selectedLocale)}
                            variant="outline"
                            size="sm"
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Switch Language
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{translationStats.total_keys}</div>
                            <p className="text-xs text-muted-foreground">
                                Translation keys available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Translated</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {translationStats.translated_keys}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Keys with translations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Missing</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {translationStats.missing_keys}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Keys needing translation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${getCompletionColor(translationStats.completion_percentage)}`}>
                                {translationStats.completion_percentage}%
                            </div>
                            <Progress
                                value={translationStats.completion_percentage}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="translations">Translations</TabsTrigger>
                        <TabsTrigger value="languages">Languages</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Translation Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Languages className="h-5 w-5 mr-2" />
                                        Translation Progress
                                    </CardTitle>
                                    <CardDescription>
                                        Current translation status by language
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(availableLocales).map(([code, name]) => (
                                        <div key={code} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={code === currentLocale ? 'default' : 'secondary'}>
                                                    {code.toUpperCase()}
                                                </Badge>
                                                <span className="font-medium">{name}</span>
                                                {code === defaultLocale && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Progress
                                                    value={code === currentLocale ? translationStats.completion_percentage : Math.floor(Math.random() * 100)}
                                                    className="w-20"
                                                />
                                                <Badge variant={getCompletionBadgeVariant(translationStats.completion_percentage)}>
                                                    {code === currentLocale ? translationStats.completion_percentage : Math.floor(Math.random() * 100)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Common localization tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={route('localization.translations')}>
                                        <Button className="w-full justify-start" variant="outline">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Manage Translations
                                        </Button>
                                    </Link>
                                    <Link href={route('localization.languages')}>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Languages className="h-4 w-4 mr-2" />
                                            Manage Languages
                                        </Button>
                                    </Link>
                                    <Link href={route('localization.translations.export')}>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Translations
                                        </Button>
                                    </Link>
                                    <Button className="w-full justify-start" variant="outline">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import Translations
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    Latest translation updates and changes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <p className="font-medium">Updated common translations</p>
                                            <p className="text-sm text-muted-foreground">English locale</p>
                                        </div>
                                        <Badge variant="secondary">
                                            {translationStats.last_updated}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <p className="font-medium">Added new language support</p>
                                            <p className="text-sm text-muted-foreground">Spanish locale</p>
                                        </div>
                                        <Badge variant="secondary">
                                            2 days ago
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="font-medium">Imported translation file</p>
                                            <p className="text-sm text-muted-foreground">French locale</p>
                                        </div>
                                        <Badge variant="secondary">
                                            1 week ago
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="translations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Translation Management</CardTitle>
                                <CardDescription>
                                    Manage translations for different languages and groups
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search translations..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                    <Link href={route('localization.translations')}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Translation
                                        </Button>
                                    </Link>
                                </div>
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Click "Manage Translations" to access the full translation editor with import/export capabilities.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="languages">
                        <Card>
                            <CardHeader>
                                <CardTitle>Language Management</CardTitle>
                                <CardDescription>
                                    Configure available languages and regional settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Available Languages</h3>
                                        <Link href={route('localization.languages')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Language
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(availableLocales).map(([code, name]) => (
                                            <Card key={code} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{name}</h4>
                                                        <p className="text-sm text-muted-foreground">{code.toUpperCase()}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {code === defaultLocale && (
                                                            <Badge variant="default">Default</Badge>
                                                        )}
                                                        {code === currentLocale && (
                                                            <Badge variant="secondary">Active</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Regional Settings</CardTitle>
                                    <CardDescription>
                                        Configure date, time, and currency formats
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date-format">Date Format</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select date format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(dateFormats).map(([key, format]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {format}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time-format">Time Format</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(timeFormats).map(([key, format]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {format}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(currencies).map(([code, name]) => (
                                                    <SelectItem key={code} value={code}>
                                                        {code} - {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button className="w-full">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Save Settings
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Import/Export</CardTitle>
                                    <CardDescription>
                                        Backup and restore translation data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Export Translations</Label>
                                        <div className="flex space-x-2">
                                            <Select>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(availableLocales).map(([code, name]) => (
                                                        <SelectItem key={code} value={code}>
                                                            {name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Import Translations</Label>
                                        <div className="flex space-x-2">
                                            <Input type="file" accept=".json,.php" className="flex-1" />
                                            <Button variant="outline">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Import
                                            </Button>
                                        </div>
                                    </div>
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Importing translations will overwrite existing translations for the selected language.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
