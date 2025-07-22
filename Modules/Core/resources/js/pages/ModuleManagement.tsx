import React, { useState, useEffect } from 'react';
import { ModuleToggle } from '../../../components/Module/ModuleToggle';


import { RefreshCw, Settings } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui';

interface ModuleStatus {
    [key: string]: boolean;
}

interface ModuleInfo {
    name: string;
    displayName: string;
    description?: string;
}

const moduleInfo: ModuleInfo[] = [
    { name: 'Dashboard', displayName: 'Dashboard', description: 'Main dashboard functionality' },
    { name: 'Users', displayName: 'Users', description: 'User management system' },
    { name: 'Roles', displayName: 'Roles', description: 'Role and permission management' },
    { name: 'Core', displayName: 'Core', description: 'Core system functionality' },
    { name: 'EmployeeManagement', displayName: 'Employee Management', description: 'Employee management system' },
    { name: 'LeaveManagement', displayName: 'Leave Management', description: 'Leave request management' },
    { name: 'TimesheetManagement', displayName: 'Timesheet Management', description: 'Timesheet tracking system' },
    { name: 'PayrollManagement', displayName: 'Payroll Management', description: 'Payroll processing system' },
    { name: 'ProjectManagement', displayName: 'Project Management', description: 'Project tracking and management' },
    { name: 'RentalManagement', displayName: 'Rental Management', description: 'Rental equipment management' },
    { name: 'EquipmentManagement', displayName: 'Equipment Management', description: 'Equipment inventory system' },
    { name: 'Settings', displayName: 'Settings', description: 'System settings and configuration' },
    { name: 'Notifications', displayName: 'Notifications', description: 'Notification system' },
    { name: 'Reporting', displayName: 'Reporting', description: 'Reporting and analytics' },
    { name: 'MobileBridge', displayName: 'Mobile Bridge', description: 'Mobile app integration' },
    { name: 'Localization', displayName: 'Localization', description: 'Multi-language support' },
    { name: 'CustomerManagement', displayName: 'Customer Management', description: 'Customer relationship management' },
    { name: 'AuditCompliance', displayName: 'Audit & Compliance', description: 'Audit and compliance tracking' },
    { name: 'API', displayName: 'API', description: 'API management and documentation' },
    { name: 'SafetyManagement', displayName: 'Safety Management', description: 'Safety incident management' },
];

export default function ModuleManagement() {
    const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModuleStatuses = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/modules_statuses.json', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setModuleStatuses(data);
        } catch (err) {
            console.error('Error fetching module statuses:', err);
            setError(err instanceof Error ? err.message : 'Failed to load module statuses');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModule = async (moduleName: string, enabled: boolean) => {
        try {
            const response = await fetch(`/api/v1/modules/${moduleName}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                // Update local state
                setModuleStatuses(prev => ({
                    ...prev,
                    [moduleName]: enabled
                }));

                // Trigger a page refresh to update the sidebar
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(result.message || 'Failed to toggle module');
            }
        } catch (err) {
            console.error('Error toggling module:', err);
            throw err;
        }
    };

    const refreshAllModules = async () => {
        try {
            const response = await fetch('/api/v1/modules/refresh-status', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                setModuleStatuses(result.data);
            } else {
                throw new Error(result.message || 'Failed to refresh modules');
            }
        } catch (err) {
            console.error('Error refreshing modules:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchModuleStatuses();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchModuleStatuses}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Module Management</h1>
                    <p className="text-gray-600">Enable or disable system modules</p>
                </div>
                <Button onClick={refreshAllModules} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All
                </Button>
            </div>

            <div className="grid gap-4">
                {moduleInfo.map((module) => (
                    <ModuleToggle
                        key={module.name}
                        moduleName={module.name}
                        displayName={module.displayName}
                        isEnabled={moduleStatuses[module.name] || false}
                        onToggle={toggleModule}
                        onRefresh={refreshAllModules}
                    />
                ))}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Module Status Summary
                    </CardTitle>
                    <CardDescription>
                        Current status of all system modules
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {moduleInfo.map((module) => (
                            <div key={module.name} className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    moduleStatuses[module.name] ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <span className="text-sm font-medium">{module.displayName}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
