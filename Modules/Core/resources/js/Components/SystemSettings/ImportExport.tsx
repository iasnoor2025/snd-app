import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Settings,
  Shield,
  Info,
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ImportExportProps {
  onExport: (categories: string[], format: string) => void;
  onImport: (data: any, options: ImportOptions) => void;
  isExporting?: boolean;
  isImporting?: boolean;
}

interface ImportOptions {
  overwrite: boolean;
  backup: boolean;
  validate: boolean;
  categories: string[];
}

interface ExportData {
  metadata: {
    exported_at: string;
    version: string;
    categories: string[];
    total_settings: number;
  };
  settings: { [key: string]: any };
}

const ImportExport: React.FC<ImportExportProps> = ({
  onExport,
  onImport,
  isExporting = false,
  isImporting = false
}) => {
  const [exportCategories, setExportCategories] = useState<string[]>(['general']);
  const [exportFormat, setExportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwrite: false,
    backup: true,
    validate: true,
    categories: []
  });
  const [previewData, setPreviewData] = useState<ExportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'general', label: 'General Settings', icon: Settings },
    { value: 'security', label: 'Security Settings', icon: Shield },
    { value: 'performance', label: 'Performance Settings', icon: Settings },
    { value: 'notifications', label: 'Notification Settings', icon: Settings },
    { value: 'maintenance', label: 'Maintenance Settings', icon: Settings },
  ];

  const handleExport = () => {
    onExport(exportCategories, exportFormat);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setImportData(content);
          validateImportData(content);
        } catch (error) {
          setValidationErrors(['Failed to read file content']);
        }
      };
      reader.readAsText(file);
    }
  };

  const validateImportData = (data: string) => {
    const errors: string[] = [];

    try {
      const parsed = JSON.parse(data);

      // Check required structure
      if (!parsed.metadata) {
        errors.push('Missing metadata section');
      } else {
        if (!parsed.metadata.version) errors.push('Missing version information');
        if (!parsed.metadata.exported_at) errors.push('Missing export timestamp');
        if (!Array.isArray(parsed.metadata.categories)) errors.push('Invalid categories format');
      }

      if (!parsed.settings) {
        errors.push('Missing settings section');
      } else if (typeof parsed.settings !== 'object') {
        errors.push('Settings must be an object');
      }

      // Validate settings structure
      if (parsed.settings) {
        Object.entries(parsed.settings).forEach(([key, value]: [string, any]) => {
          if (!value || typeof value !== 'object') {
            errors.push(`Invalid setting format for: ${key}`);
          } else {
            if (value.value === undefined) errors.push(`Missing value for setting: ${key}`);
            if (!value.type) errors.push(`Missing type for setting: ${key}`);
          }
        });
      }

      if (errors.length === 0) {
        setPreviewData(parsed);
        setImportOptions(prev => ({
          ...prev,
          categories: parsed.metadata.categories || []
        }));
      }
    } catch (error) {
      errors.push('Invalid JSON format');
    }

    setValidationErrors(errors);
  };

  const handleImport = () => {
    if (importData && validationErrors.length === 0) {
      try {
        const parsed = JSON.parse(importData);
        onImport(parsed, importOptions);
      } catch (error) {
        setValidationErrors(['Failed to parse import data']);
      }
    }
  };

  const handleCopyToClipboard = () => {
    if (previewData) {
      navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Categories to Export</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = exportCategories.includes(category.value);
                return (
                  <Button
                    key={category.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-auto py-2"
                    onClick={() => {
                      if (isSelected) {
                        setExportCategories(prev => prev.filter(c => c !== category.value));
                      } else {
                        setExportCategories(prev => [...prev, category.value]);
                      }
                    }}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    <span className="text-xs">{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="yaml">YAML (.yaml)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Exported settings will include metadata and can be imported later.
              Sensitive values will be excluded for security.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleExport}
            disabled={isExporting || exportCategories.length === 0}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Settings ({exportCategories.length} categories)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Settings File</Label>
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {importFile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{importFile.name}</span>
                  <Badge variant="outline">{formatFileSize(importFile.size)}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label>Or Paste Settings Data</Label>
            <Textarea
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value);
                if (e.target.value) {
                  validateImportData(e.target.value);
                }
              }}
              placeholder="Paste your exported settings JSON here..."
              className="font-mono text-sm"
              rows={6}
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {previewData && validationErrors.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Valid Settings Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Version</p>
                    <p className="font-medium">{previewData.metadata.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Exported</p>
                    <p className="font-medium">{formatDate(previewData.metadata.exported_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Categories</p>
                    <p className="font-medium">{previewData.metadata.categories.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Settings</p>
                    <p className="font-medium">{previewData.metadata.total_settings}</p>
                  </div>
                </div>

                {showPreview && (
                  <div className="mt-4">
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Categories:</h4>
                      <div className="flex flex-wrap gap-1">
                        {previewData.metadata.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Options */}
          {previewData && validationErrors.length === 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Import Options</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Overwrite Existing Settings</Label>
                      <p className="text-xs text-gray-500">Replace current values with imported ones</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={importOptions.overwrite}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, overwrite: e.target.checked }))}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Create Backup</Label>
                      <p className="text-xs text-gray-500">Backup current settings before import</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={importOptions.backup}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, backup: e.target.checked }))}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Validate Settings</Label>
                      <p className="text-xs text-gray-500">Validate settings before applying</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={importOptions.validate}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, validate: e.target.checked }))}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                disabled={!importData || validationErrors.length > 0 || isImporting}
                className="w-full"
                variant={importOptions.overwrite ? "destructive" : "default"}
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Confirm Settings Import
                </DialogTitle>
                <DialogDescription>
                  You are about to import settings that will affect your system configuration.
                  {importOptions.overwrite && (
                    <span className="block mt-2 text-red-600 font-medium">
                      Warning: This will overwrite existing settings!
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Settings to import:</span>
                    <span className="font-medium">{previewData?.metadata.total_settings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <span className="font-medium">{previewData?.metadata.categories.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup current settings:</span>
                    <span className="font-medium">{importOptions.backup ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overwrite existing:</span>
                    <span className="font-medium">{importOptions.overwrite ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  variant={importOptions.overwrite ? "destructive" : "default"}
                >
                  Confirm Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExport;
