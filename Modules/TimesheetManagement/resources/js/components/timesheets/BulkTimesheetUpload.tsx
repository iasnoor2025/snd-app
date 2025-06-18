import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useLoadingState from '../../hooks/useLoadingState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';

interface BulkTimesheetUploadProps {
  onUploadComplete: () => void;
}

interface UploadSummary {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

const uploadSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Please select a file')
    .refine(
      (files) => {
        const file = files[0];
        return file && file.type === 'text/csv';
      },
      'Please select a CSV file'
    ),
})

const BulkTimesheetUpload: React.FC<BulkTimesheetUploadProps> = ({ onUploadComplete }) => {
  const { t } = useTranslation('timesheet');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const { isLoading: isUploading, error: uploadError, withLoading } = useLoadingState('bulkUpload');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(uploadSchema),
  })

  const onSubmit = async (data: any) => {
    await withLoading(async () => {
      const file = data.file[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadProgress(0);
        const response = await axios.post('/api/timesheets/bulk-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        })

        setUploadSummary({
          total: response.data.total,
          successful: response.data.successful,
          failed: response.data.failed,
          errors: response.data.errors || [],
        })

        if (response.data.successful > 0) {
          onUploadComplete();
        }

        // Reset the form
        reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: any) {
        console.error('Error uploading timesheets:', error);

        // Set a default error summary if the server doesn't return one
        setUploadSummary({
          total: 0,
          successful: 0,
          failed: 0,
          errors: [error.response?.data?.message || 'Failed to upload timesheets'],
        })

        throw error;
      }
    })
  };

  const downloadTemplate = () => {
    // Create a template CSV content
    const csvContent = [
      'employee_id,date,regular_hours,overtime_hours,project_id,location,notes',
      '1,2023-05-10,8,1,101,Site A,Regular shift',
      '2,2023-05-10,7.5,0,,Office,Half day',
    ].join('\n');

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' })

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timesheet_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{t('upload_timesheets')}</h3>
                  <p className="text-sm text-gray-500">
                    Upload a CSV file containing timesheet data
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Template
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">{t('lbl_select_csv_file')}</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    {...register('file')}
                    ref={el => {
                      register('file').ref(el);
                      fileInputRef.current = el;
                    }}
                    disabled={isUploading}
                  />
                  {errors.file && (
                    <p className="text-sm text-red-500">{String(errors.file.message)}</p>
                  )}
                </div>

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('ttl_upload_error')}</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {t('upload_timesheets')}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{t('format_instructions')}</h3>
                <p className="text-sm text-gray-500">
                  Ensure your CSV file follows this format
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Columns:</h4>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>
                    <strong>employee_id</strong> - Employee ID (number)
                  </li>
                  <li>
                    <strong>date</strong> - Date in YYYY-MM-DD format
                  </li>
                  <li>
                    <strong>regular_hours</strong> - Regular hours worked (number)
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Optional Columns:</h4>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>
                    <strong>overtime_hours</strong> - Overtime hours (number)
                  </li>
                  <li>
                    <strong>project_id</strong> - Project ID (number)
                  </li>
                  <li>
                    <strong>location</strong> - Work location (text)
                  </li>
                  <li>
                    <strong>notes</strong> - Additional notes (text)
                  </li>
                </ul>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  <FileText className="h-4 w-4 inline mr-1" />
                  Download the template for a quick start
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {uploadSummary && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{t('upload_results')}</h3>
                {uploadSummary.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">{t('total_records')}</p>
                  <p className="text-2xl font-bold">{uploadSummary.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-600">Successful</p>
                  <p className="text-2xl font-bold text-green-700">
                    {uploadSummary.successful}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">
                    {uploadSummary.failed}
                  </p>
                </div>
              </div>

              {uploadSummary.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {uploadSummary.errors.map((error, index) => (
                        <li key={index} className="text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkTimesheetUpload;



