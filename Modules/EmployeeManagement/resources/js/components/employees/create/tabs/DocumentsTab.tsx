import { Alert, Button, Card, CardContent, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, AlertDescription } from '@/Core';
import { Info, Upload, X } from 'lucide-react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface DocumentsTabProps {
    form: UseFormReturn<any>;
    files: Record<string, File | null>;
    setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
}

export default function DocumentsTab({ form, files, setFiles }: DocumentsTabProps) {
    const { t } = useTranslation('employee');

    const handleFileChange = (key: string, file: File | null) => {
        setFiles((prev) => ({
            ...prev,
            [key]: file,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('documents')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>{t('documents_optional_info')}</AlertDescription>
                </Alert>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Iqama Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t('iqama')}</h3>
                            <FormField
                                control={form.control}
                                name="iqama_number"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>{t('iqama_number')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter iqama number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="iqama_expiry"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>{t('lbl_iqama_expiry_date')}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="iqama_cost"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>{t('iqama_cost')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('iqama', e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="iqama-file"
                                />
                                <Button type="button" variant="outline" onClick={() => document.getElementById('iqama-file')?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('upload_iqama')}
                                </Button>
                                {files.iqama && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{files.iqama.name}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleFileChange('iqama', null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Passport Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t('passport')}</h3>
                            <FormField
                                control={form.control}
                                name="passport_number"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>{t('lbl_passport_number')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter passport number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passport_expiry"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel>{t('lbl_passport_expiry_date')}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange('passport', e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="passport-file"
                                />
                                <Button type="button" variant="outline" onClick={() => document.getElementById('passport-file')?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('upload_passport')}
                                </Button>
                                {files.passport && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{files.passport.name}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleFileChange('passport', null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
