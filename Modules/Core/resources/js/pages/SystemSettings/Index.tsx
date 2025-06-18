import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AdminLayout from '@/layouts/AdminLayout';
import { toast } from 'sonner';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import {
  Settings,
  Shield,
  Zap,
  Bell,
  Wrench,
  Save,
  RotateCcw,
  Download,
  Upload,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

// Components
import SettingsForm from '../../components/SystemSettings/SettingsForm';
import SystemHealth from '../../components/SystemSettings/SystemHealth';
import ImportExport from '../../components/SystemSettings/ImportExport';

interface SystemSettings {
  [category: string]: {
    [key: string]: {
      value: any;
      type: string;
      description: string;
      is_public: boolean;
      updated_at: string;
    };
  };
}

interface SettingsCategory {
  label: string;
  description: string;
  icon: string;
  fields: string[];
}

interface Props extends PageProps {
  settings: SystemSettings;
  categories: { [key: string]: SettingsCategory };
}

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'unhealthy';
      message: string;
    };
  };
  last_checked: string;
}

const iconMap = {
  Settings,
  Shield,
  Zap,
  Bell,
  Wrench,
};

export default function SystemSettingsIndex({ auth, settings, categories }: Props) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetCategory, setResetCategory] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);
    setHasChanges(hasChanges);
  }, [formData, settings]);

  // Load system health on mount
  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const response = await fetch('/admin/system-settings/health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleInputChange = (category: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      router.put('/admin/system-settings', formData, {
        onSuccess: () => {
          toast.success('System settings updated successfully');
          setHasChanges(false);
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
          toast.error('Failed to update settings. Please check the form for errors.');
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleReset = async (category?: string) => {
    setIsSubmitting(true);
    try {
      const url = category
        ? `/admin/system-settings/reset?category=${category}`
        : '/admin/system-settings/reset';

      router.post(url, {}, {
        onSuccess: () => {
          toast.success(
            category
              ? `${categories[category]?.label} settings reset to defaults`
              : 'All settings reset to defaults'
          );
          setShowResetDialog(false);
          setResetCategory(null);
          setHasChanges(false);
        },
        onError: () => {
          toast.error('Failed to reset settings');
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            System Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportExport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSystemHealth}
            disabled={isLoadingHealth}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isLoadingHealth ? 'Checking...' : 'Health Check'}
          </Button>
        </div>
      </div>
      <AdminLayout title="System Settings">
        <Head title="System Settings" />

        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* System Health Alert */}
            {systemHealth && systemHealth.overall_status !== 'healthy' && (
              <Alert className={`mb-6 ${getStatusColor(systemHealth.overall_status)}`}>
                {getStatusIcon(systemHealth.overall_status)}
                <AlertDescription className="ml-2">
                  <strong>System Health Warning:</strong> Some system components need attention.
                  Check the Health tab for details.
                </AlertDescription>
              </Alert>
            )}

            {/* Unsaved Changes Alert */}
            {hasChanges && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="ml-2 text-blue-800">
                  You have unsaved changes. Don't forget to save your settings.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    {Object.entries(categories).map(([key, category]) => {
                      const IconComponent = iconMap[category.icon as keyof typeof iconMap];
                      return (
                        <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          <span className="hidden sm:inline">{category.label}</span>
                        </TabsTrigger>
                      );
                    })}
                    <TabsTrigger value="health" className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Health</span>
                      {systemHealth && (
                        <Badge
                          variant="outline"
                          className={`ml-1 ${getStatusColor(systemHealth.overall_status)}`}
                        >
                          {systemHealth.overall_status}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Settings Categories */}
                  {Object.entries(categories).map(([categoryKey, category]) => (
                    <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                {iconMap[category.icon as keyof typeof iconMap] &&
                                  React.createElement(iconMap[category.icon as keyof typeof iconMap], { className: "h-5 w-5" })
                                }
                                <span>{category.label}</span>
                              </CardTitle>
                              <CardDescription>{category.description}</CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResetCategory(categoryKey);
                                setShowResetDialog(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reset
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <SettingsForm
                            category={categoryKey}
                            settings={formData[categoryKey] || {}}
                            fields={category.fields}
                            onChange={handleInputChange}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}

                  {/* System Health Tab */}
                  <TabsContent value="health" className="mt-6">
                    {systemHealth ? (
                      <SystemHealth
                        healthData={{
                          overall_status: systemHealth.overall_status === 'unhealthy' ? 'critical' : systemHealth.overall_status,
                          last_updated: systemHealth.last_checked,
                          metrics: {
                            database: systemHealth.checks.database ? {
                              name: 'database',
                              status: systemHealth.checks.database.status === 'unhealthy' ? 'critical' : systemHealth.checks.database.status,
                              message: systemHealth.checks.database.message
                            } : { name: 'database', status: 'healthy', message: '' },
                            cache: systemHealth.checks.cache ? {
                              name: 'cache',
                              status: systemHealth.checks.cache.status === 'unhealthy' ? 'critical' : systemHealth.checks.cache.status,
                              message: systemHealth.checks.cache.message
                            } : { name: 'cache', status: 'healthy', message: '' },
                            storage: systemHealth.checks.storage ? {
                              name: 'storage',
                              status: systemHealth.checks.storage.status === 'unhealthy' ? 'critical' : systemHealth.checks.storage.status,
                              message: systemHealth.checks.storage.message
                            } : { name: 'storage', status: 'healthy', message: '' },
                            memory: systemHealth.checks.memory ? {
                              name: 'memory',
                              status: systemHealth.checks.memory.status === 'unhealthy' ? 'critical' : systemHealth.checks.memory.status,
                              message: systemHealth.checks.memory.message
                            } : { name: 'memory', status: 'healthy', message: '' },
                            cpu: systemHealth.checks.cpu ? {
                              name: 'cpu',
                              status: systemHealth.checks.cpu.status === 'unhealthy' ? 'critical' : systemHealth.checks.cpu.status,
                              message: systemHealth.checks.cpu.message
                            } : { name: 'cpu', status: 'healthy', message: '' },
                            queue: systemHealth.checks.queue ? {
                              name: 'queue',
                              status: systemHealth.checks.queue.status === 'unhealthy' ? 'critical' : systemHealth.checks.queue.status,
                              message: systemHealth.checks.queue.message
                            } : { name: 'queue', status: 'healthy', message: '' },
                            mail: systemHealth.checks.mail ? {
                              name: 'mail',
                              status: systemHealth.checks.mail.status === 'unhealthy' ? 'critical' : systemHealth.checks.mail.status,
                              message: systemHealth.checks.mail.message
                            } : { name: 'mail', status: 'healthy', message: '' },
                            security: systemHealth.checks.security ? {
                              name: 'security',
                              status: systemHealth.checks.security.status === 'unhealthy' ? 'critical' : systemHealth.checks.security.status,
                              message: systemHealth.checks.security.message
                            } : { name: 'security', status: 'healthy', message: '' },
                          },
                          uptime: { days: 0, hours: 0, minutes: 0 }, // Placeholder
                          version: { app: '', php: '', laravel: '' } // Placeholder
                        }}
                        isRefreshing={isLoadingHealth}
                        onRefresh={loadSystemHealth}
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-8">No health data available.</div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setResetCategory(null);
                        setShowResetDialog(true);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData(settings);
                        setHasChanges(false);
                      }}
                      disabled={!hasChanges}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!hasChanges || isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Settings</DialogTitle>
              <DialogDescription>
                {resetCategory
                  ? `Are you sure you want to reset all ${categories[resetCategory]?.label} settings to their default values?`
                  : 'Are you sure you want to reset ALL system settings to their default values?'
                }
                <br />
                <strong>This action cannot be undone.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setResetCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReset(resetCategory || undefined)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Settings'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import/Export Dialog */}
        <ImportExport
          onExport={(categories, format) => {
            // Implement export logic here (e.g., call API or download file)
            console.log('Export requested:', categories, format);
          }}
          onImport={(data, options) => {
            // Implement import logic here (e.g., call API to import settings)
            console.log('Import requested:', data, options);
          }}
          isExporting={false}
          isImporting={false}
        />
      </AdminLayout>
    </>
  );
}
