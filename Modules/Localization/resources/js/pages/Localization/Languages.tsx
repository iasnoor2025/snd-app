import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Globe,
    Languages as LanguagesIcon,
    CheckCircle,
    AlertCircle,
    Settings,
    Flag,
    Users,
    Calendar,
    DollarSign,
    Clock
} from 'lucide-react';

interface Language {
    code: string;
    name: string;
    native_name: string;
    direction: 'ltr' | 'rtl';
    enabled: boolean;
    is_default: boolean;
    completion_percentage?: number;
    last_updated?: string;
}

interface LanguagesProps {
    languages: Record<string, Language>;
    defaultLanguage: string;
}

export default function Languages({ languages, defaultLanguage }: LanguagesProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingLanguage, setDeletingLanguage] = useState<Language | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        native_name: '',
        direction: 'ltr' as 'ltr' | 'rtl',
        enabled: true,
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        native_name: '',
        direction: 'ltr' as 'ltr' | 'rtl',
        enabled: true,
    });

    const handleAddLanguage = () => {
        post(route('localization.languages.store'), {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                reset();
            }
        });
    };

    const handleEditLanguage = () => {
        if (!editingLanguage) return;

        put(route('localization.languages.update', editingLanguage.code), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingLanguage(null);
                resetEdit();
            }
        });
    };

    const handleDeleteLanguage = () => {
        if (!deletingLanguage) return;

        router.delete(route('localization.languages.destroy', deletingLanguage.code), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeletingLanguage(null);
            }
        });
    };

    const openEditDialog = (language: Language) => {
        setEditingLanguage(language);
        setEditData({
            name: language.name,
            native_name: language.native_name,
            direction: language.direction,
            enabled: language.enabled,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (language: Language) => {
        setDeletingLanguage(language);
        setIsDeleteDialogOpen(true);
    };

    const languagesList = Object.entries(languages).map(([code, lang]) => ({
        ...lang,
        code
    }));

    const enabledLanguages = languagesList.filter(lang => lang.enabled);
    const totalLanguages = languagesList.length;
    const averageCompletion = Math.round(
        languagesList.reduce((sum, lang) => sum + (lang.completion_percentage || 0), 0) / totalLanguages
    );

    return (
        <>
            <Head title="Language Management" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Language Management</h1>
                            <p className="text-muted-foreground">
                                Configure available languages and regional settings
                            </p>
                        </div>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Language
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Language</DialogTitle>
                                <DialogDescription>
                                    Add a new language to your application
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="code">Language Code</Label>
                                        <Input
                                            id="code"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            placeholder="e.g., en, es, fr"
                                            maxLength={5}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="direction">Text Direction</Label>
                                        <Select value={data.direction} onValueChange={(value: 'ltr' | 'rtl') => setData('direction', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                                                <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.direction && (
                                            <p className="text-sm text-red-600 mt-1">{errors.direction}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="name">English Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., English, Spanish, French"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="native_name">Native Name</Label>
                                    <Input
                                        id="native_name"
                                        value={data.native_name}
                                        onChange={(e) => setData('native_name', e.target.value)}
                                        placeholder="e.g., English, Español, Français"
                                    />
                                    {errors.native_name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.native_name}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enabled"
                                        checked={data.enabled}
                                        onCheckedChange={(checked) => setData('enabled', checked)}
                                    />
                                    <Label htmlFor="enabled">Enable this language</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddLanguage} disabled={processing}>
                                    {processing ? 'Adding...' : 'Add Language'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Languages</p>
                                    <p className="text-2xl font-bold">{totalLanguages}</p>
                                </div>
                                <LanguagesIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Enabled</p>
                                    <p className="text-2xl font-bold text-green-600">{enabledLanguages.length}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Default</p>
                                    <p className="text-2xl font-bold">{languages[defaultLanguage]?.name || 'N/A'}</p>
                                </div>
                                <Flag className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                                    <p className="text-2xl font-bold">{averageCompletion}%</p>
                                </div>
                                <Globe className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Languages Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Languages</CardTitle>
                        <CardDescription>
                            Manage languages available in your application
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {languagesList.length === 0 ? (
                            <div className="text-center py-8">
                                <LanguagesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No languages configured</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add your first language to get started with localization
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Language
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Language</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Direction</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Completion</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {languagesList.map((language) => (
                                        <TableRow key={language.code}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                            {language.code.toUpperCase().slice(0, 2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{language.name}</span>
                                                            {language.is_default && (
                                                                <Badge variant="default">Default</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {language.native_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {language.code.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {language.direction === 'rtl' ? (
                                                        <span className="text-sm">RTL →</span>
                                                    ) : (
                                                        <span className="text-sm">← LTR</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {language.enabled ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Enabled
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Disabled
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${language.completion_percentage || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {language.completion_percentage || 0}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {language.last_updated || 'Never'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openEditDialog(language)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {!language.is_default && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openDeleteDialog(language)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Date Formats
                            </CardTitle>
                            <CardDescription>
                                Configure date display formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm">MM/DD/YYYY</span>
                                    <Badge variant="outline">US</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm">DD/MM/YYYY</span>
                                    <Badge variant="outline">EU</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm">YYYY-MM-DD</span>
                                    <Badge variant="outline">ISO</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Time Formats
                            </CardTitle>
                            <CardDescription>
                                Configure time display formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm">12-hour (AM/PM)</span>
                                    <Badge variant="outline">12H</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm">24-hour</span>
                                    <Badge variant="outline">24H</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Currencies
                            </CardTitle>
                            <CardDescription>
                                Configure currency formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm">US Dollar</span>
                                    <Badge variant="outline">USD</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm">Euro</span>
                                    <Badge variant="outline">EUR</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm">British Pound</span>
                                    <Badge variant="outline">GBP</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Language</DialogTitle>
                            <DialogDescription>
                                Update language settings for {editingLanguage?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-name">English Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                    />
                                    {editErrors.name && (
                                        <p className="text-sm text-red-600 mt-1">{editErrors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="edit-direction">Text Direction</Label>
                                    <Select value={editData.direction} onValueChange={(value: 'ltr' | 'rtl') => setEditData('direction', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                                            <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="edit-native-name">Native Name</Label>
                                <Input
                                    id="edit-native-name"
                                    value={editData.native_name}
                                    onChange={(e) => setEditData('native_name', e.target.value)}
                                />
                                {editErrors.native_name && (
                                    <p className="text-sm text-red-600 mt-1">{editErrors.native_name}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-enabled"
                                    checked={editData.enabled}
                                    onCheckedChange={(checked) => setEditData('enabled', checked)}
                                />
                                <Label htmlFor="edit-enabled">Enable this language</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditLanguage} disabled={editProcessing}>
                                {editProcessing ? 'Updating...' : 'Update Language'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Language</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete {deletingLanguage?.name}? This action cannot be undone and will remove all translations for this language.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteLanguage}>
                                Delete Language
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Help */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Note:</strong> The default language cannot be deleted.
                        Disabling a language will hide it from users but preserve all translations.
                        RTL languages require additional CSS support for proper text direction.
                    </AlertDescription>
                </Alert>
            </div>
        </>
    );
}














