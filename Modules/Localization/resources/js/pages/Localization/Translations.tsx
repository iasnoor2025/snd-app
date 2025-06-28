import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Alert, AlertDescription } from "@/Core";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import {
    Search,
    Filter,
    Download,
    Upload,
    Save,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    RefreshCw,
    FileText,
    Globe,
    CheckCircle,
    AlertCircle,
    Copy,
    Eye,
    EyeOff
} from 'lucide-react';
import { useTranslation } from '@/Core/hooks/useTranslation';

interface Translation {
    [key: string]: string;
}

interface TranslationsProps {
    translations: Translation;
    translationGroups: string[];
    availableLocales: Record<string, string>;
    currentLocale: string;
    currentGroup: string;
    search: string;
}

export default function Translations({
    translations,
    translationGroups,
    availableLocales,
    currentLocale,
    currentGroup,
    search: initialSearch
}: TranslationsProps) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [selectedGroup, setSelectedGroup] = useState(currentGroup);
    const [selectedLocale, setSelectedLocale] = useState(currentLocale);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [showMissingOnly, setShowMissingOnly] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        locale: currentLocale,
        group: currentGroup,
        translations: translations,
        key: '',
        value: '',
        file: null as File | null,
    });

    const { data: newKeyData, setData: setNewKeyData, post: postNewKey, processing: addingKey, errors: newKeyErrors, reset: resetNewKey } = useForm({
        key: '',
        value: '',
        group: currentGroup,
        locale: currentLocale,
    });

    useEffect(() => {
        if (selectedLocale !== currentLocale || selectedGroup !== currentGroup) {
            router.get(route('localization.translations'), {
                locale: selectedLocale,
                group: selectedGroup,
                search: searchTerm
            }, {
                preserveState: true,
                preserveScroll: true
            });
        }
    }, [selectedLocale, selectedGroup]);

    const handleSearch = () => {
        router.get(route('localization.translations'), {
            locale: selectedLocale,
            group: selectedGroup,
            search: searchTerm
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleUpdateTranslations = () => {
        post(route('localization.translations.update'), {
            onSuccess: () => {
                setEditingKey(null);
            }
        });
    };

    const handleUpdateSingleTranslation = (key: string, value: string) => {
        const updatedTranslations = { ...data.translations, [key]: value };
        setData('translations', updatedTranslations);

        put(route('localization.translations.group.update', {
            locale: selectedLocale,
            group: selectedGroup
        }), {
            data: { translations: { [key]: value } },
            onSuccess: () => {
                setEditingKey(null);
            }
        });
    };

    const handleImport = () => {
        if (!data.file) return;

        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('locale', selectedLocale);
        formData.append('group', selectedGroup);

        router.post(route('localization.translations.import'), formData, {
            onSuccess: () => {
                setIsImportDialogOpen(false);
                reset('file');
            }
        });
    };

    const handleAddKey = () => {
        postNewKey(route('localization.translations.update'), {
            onSuccess: () => {
                setIsAddKeyDialogOpen(false);
                resetNewKey();
            }
        });
    };

    const handleExport = () => {
        window.open(route('localization.translations.export', selectedLocale));
    };

    const handleDeleteTranslation = (key: string) => {
        if (confirm(`Are you sure you want to delete the translation key "${key}"?`)) {
            const updatedTranslations = { ...data.translations };
            delete updatedTranslations[key];
            
            setData('translations', updatedTranslations);
            
            // Send delete request to server
            router.delete(route('localization.translations.delete', {
                locale: currentLocale,
                group: currentGroup,
                key: key
            }), {
                onSuccess: () => {
                    toast.success({
                        title: "Success",
                        description: "Translation deleted successfully",
                        duration: 3000,
                    });
                },
                onError: () => {
                    // Revert changes on error
                    setData('translations', data.translations);
                    toast.error({
                        title: "Error",
                        description: "Failed to delete translation",
                        duration: 3000,
                    });
                }
            });
        }
    };

    const filteredTranslations = Object.entries(translations).filter(([key, value]) => {
        const matchesSearch = !searchTerm ||
            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            value.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMissingFilter = !showMissingOnly || !value || value.trim() === '';

        return matchesSearch && matchesMissingFilter;
    });

    const missingTranslationsCount = Object.values(translations).filter(value => !value || value.trim() === '').length;
    const completionPercentage = Math.round(((Object.keys(translations).length - missingTranslationsCount) / Object.keys(translations).length) * 100);

    return (
        <>
            <Head title={t('localization:translation_management')} />

            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('localization.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('localization:back')}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{t('localization:translation_management')}</h1>
                            <p className="text-muted-foreground">
                                {t('localization:manage_translations_for') + ` ${availableLocales[selectedLocale]} - ${selectedGroup} group`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            {t('localization:export')}
                        </Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    {t('localization:import')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('localization:import_translations')}</DialogTitle>
                                    <DialogDescription>
                                        {t('localization:upload_translation_file') + ` ${availableLocales[selectedLocale]}`}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="import-file">{t('localization:translation_file')}</Label>
                                        <Input
                                            id="import-file"
                                            type="file"
                                            accept=".json,.php"
                                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                        />
                                        {errors.file && (
                                            <p className="text-sm text-red-600 mt-1">{t('localization:error_file')}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                        {t('localization:cancel')}
                                    </Button>
                                    <Button onClick={handleImport} disabled={!data.file || processing}>
                                        {processing ? t('localization:importing') : t('localization:import')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('localization:total_keys')}</p>
                                    <p className="text-2xl font-bold">{Object.keys(translations).length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('localization:translated')}</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {Object.keys(translations).length - missingTranslationsCount}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('localization:missing')}</p>
                                    <p className="text-2xl font-bold text-red-600">{missingTranslationsCount}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('localization:completion')}</p>
                                    <p className="text-2xl font-bold">{completionPercentage}%</p>
                                </div>
                                <Globe className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('localization:search_translations')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                                <SelectTrigger className="w-48">
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
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {translationGroups.map((group) => (
                                        <SelectItem key={group} value={group}>
                                            {group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch} variant="outline">
                                <Search className="h-4 w-4 mr-2" />
                                {t('localization:search')}
                            </Button>
                            <Button
                                onClick={() => setShowMissingOnly(!showMissingOnly)}
                                variant={showMissingOnly ? 'default' : 'outline'}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {t('localization:missing_only')}
                            </Button>
                            <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('localization:add_key')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Translation Key</DialogTitle>
                                        <DialogDescription>
                                            Add a new translation key to the {selectedGroup} group
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="new-key">{t('localization:translation_key')}</Label>
                                            <Input
                                                id="new-key"
                                                value={newKeyData.key}
                                                onChange={(e) => setNewKeyData('key', e.target.value)}
                                                placeholder="e.g., welcome_message"
                                            />
                                            {newKeyErrors.key && (
                                                <p className="text-sm text-red-600 mt-1">{newKeyErrors.key}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="new-value">{t('localization:translation_value')}</Label>
                                            <Textarea
                                                id="new-value"
                                                value={newKeyData.value}
                                                onChange={(e) => setNewKeyData('value', e.target.value)}
                                                placeholder="Enter the translation..."
                                                rows={3}
                                            />
                                            {newKeyErrors.value && (
                                                <p className="text-sm text-red-600 mt-1">{newKeyErrors.value}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddKeyDialogOpen(false)}>
                                            {t('localization:cancel')}
                                        </Button>
                                        <Button onClick={handleAddKey} disabled={addingKey}>
                                            {addingKey ? t('localization:adding') : t('localization:add_key')}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Translations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{t('localization:translations')} ({filteredTranslations.length})</span>
                            <Button onClick={handleUpdateTranslations} disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? t('localization:saving') : t('localization:save_all')}
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            {t('localization:click_to_edit_inline')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredTranslations.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">{t('localization:no_translations_found')}</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm ? t('localization:try_adjusting_search') : t('localization:no_translations_available')}
                                </p>
                                <Button onClick={() => setIsAddKeyDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('localization:add_first_translation')}
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Key</TableHead>
                                        <TableHead className="w-2/3">Translation</TableHead>
                                        <TableHead className="w-20">Status</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTranslations.map(([key, value]) => (
                                        <TableRow key={key}>
                                            <TableCell className="font-mono text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <span>{key}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigator.clipboard.writeText(key)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {editingKey === key ? (
                                                    <div className="flex items-center space-x-2">
                                                        <Textarea
                                                            value={data.translations[key] || ''}
                                                            onChange={(e) => setData('translations', {
                                                                ...data.translations,
                                                                [key]: e.target.value
                                                            })}
                                                            className="flex-1"
                                                            rows={2}
                                                        />
                                                        <div className="flex flex-col space-y-1">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    handleUpdateSingleTranslation(key, data.translations[key] || '');
                                                                }}
                                                            >
                                                                <Save className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingKey(null);
                                                                    setData('translations', {
                                                                        ...data.translations,
                                                                        [key]: value
                                                                    });
                                                                }}
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="cursor-pointer hover:bg-muted p-2 rounded min-h-[2rem] flex items-center"
                                                        onClick={() => setEditingKey(key)}
                                                    >
                                                        {value || (
                                                            <span className="text-muted-foreground italic">
                                                                {t('localization:click_to_add_translation')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {value && value.trim() ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        {t('localization:done')}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {t('localization:missing')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingKey(editingKey === key ? null : key)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteTranslation(key)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Help */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>{t('localization:tips')}</strong> {t('localization:tips_content')}
                    </AlertDescription>
                </Alert>
            </div>
        </>
    );
}














