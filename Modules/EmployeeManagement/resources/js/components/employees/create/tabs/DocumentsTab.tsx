import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Modules/Core/resources/js/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { X, Upload, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/Modules/Core/resources/js/components/ui/alert';

interface DocumentsTabProps {
  form: UseFormReturn<any>
  files: Record<string, File | null>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>
}

export default function DocumentsTab({ form, files, setFiles }: DocumentsTabProps) {
  const { t } = useTranslation('employee');

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [key]: file
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            These fields are optional. You can update them later after creating the employee.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Iqama Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Iqama</h3>
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
                    <FormLabel>Iqama Cost (SAR)</FormLabel>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('iqama-file')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Iqama
                </Button>
                {files.iqama && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{files.iqama.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('iqama', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Passport Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Passport</h3>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('passport-file')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Passport
                </Button>
                {files.passport && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{files.passport.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('passport', null)}
                    >
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

















