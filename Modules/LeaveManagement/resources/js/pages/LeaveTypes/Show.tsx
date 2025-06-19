import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Separator } from '@/Modules/Core/resources/js/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/Modules/Core/resources/js/components/ui/breadcrumb';
import { ArrowLeftIcon, EditIcon, TrashIcon, CalendarIcon, ClockIcon, UsersIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Modules/Core/resources/js/components/ui/alert-dialog';

// Temporary inline permission hook
const usePermission = () => {
    return {
        can: (permission: string) => true, // Simplified for now
    };
};

interface LeaveType {
    id: number;
    name: string;
    description: string;
    max_days: number;
    requires_approval: boolean;
    is_paid: boolean;
    is_active: boolean;
    allow_carry_forward: boolean;
    carry_forward_max_days: number;
    notice_days: number;
    gender_specific: string;
    applicable_after_months: number;
    color: string;
    created_at: string;
    updated_at: string;
    requests_count?: number;
    active_requests_count?: number;
}

interface Props {
    leaveType: LeaveType;
}

export default function ShowLeaveType({ leaveType }: Props) {
  const { t } = useTranslation('leave');

    const { can } = usePermission();

    const handleEdit = () => {
        if (!can('leave-types.edit')) {
            toast.error('You do not have permission to edit leave types.');
            return;
        }
        router.visit(route('leaves.types.edit', leaveType.id));
    };

    const handleDelete = () => {
        if (!can('leave-types.delete')) {
            toast.error('You do not have permission to delete leave types.');
            return;
        }

        router.delete(route('leaves.types.destroy', leaveType.id), {
            onSuccess: () => {
                toast.success('Leave type deleted successfully!');
                router.visit(route('leaves.types.index'));
            },
            onError: () => {
                toast.error('Failed to delete leave type. It may be in use.');
            },
        });
    };

    const handleBack = () => {
        router.visit(route('leaves.types.index'));
    };

    const getGenderLabel = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'Male Only';
            case 'female':
                return 'Female Only';
            default:
                return 'Both';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title={leaveType.name} />

            <div className="space-y-6">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('leaves.requests.index')}>Leave Management</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('leaves.types.index')}>{t('leave_types')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{leaveType.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handleBack}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: leaveType.color }}
                                />
                                <h1 className="text-3xl font-bold tracking-tight">{leaveType.name}</h1>
                                <Badge variant={leaveType.is_active ? 'default' : 'secondary'}>
                                    {leaveType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                                {leaveType.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {can('leave-types.edit') && (
                            <Button onClick={handleEdit} className="gap-2">
                                <EditIcon className="h-4 w-4" />
                                Edit
                            </Button>
                        )}
                        {can('leave-types.delete') && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="gap-2">
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('ttl_delete_leave_type')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{leaveType.name}"? This action cannot be undone.
                                            {leaveType.requests_count && leaveType.requests_count > 0 && (
                                                <span className="block mt-2 text-red-600 font-medium">
                                                    Warning: This leave type has {leaveType.requests_count} associated requests.
                                                </span>
                                            )}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_basic_information')}</CardTitle>
                                <CardDescription>
                                    Core details and configuration of the leave type
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: leaveType.color }}
                                            />
                                            <span className="font-medium">{leaveType.name}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">{t('color_code')}</div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: leaveType.color }}
                                            />
                                            <span className="font-mono text-sm">{leaveType.color}</span>
                                        </div>
                                    </div>
                                </div>

                                {leaveType.description && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">Description</div>
                                        <p className="text-sm">{leaveType.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Leave Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_leave_configuration')}</CardTitle>
                                <CardDescription>
                                    Rules and limits for this leave type
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">{t('maximum_days')}</div>
                                            <div className="text-lg font-semibold">{leaveType.max_days}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ClockIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">{t('notice_days')}</div>
                                            <div className="text-lg font-semibold">{leaveType.notice_days}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">{t('gender_specific')}</div>
                                            <div className="text-lg font-semibold">{getGenderLabel(leaveType.gender_specific)}</div>
                                        </div>
                                    </div>

                                    {leaveType.applicable_after_months > 0 && (
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">{t('applicable_after')}</div>
                                                <div className="text-lg font-semibold">{leaveType.applicable_after_months} months</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {leaveType.allow_carry_forward && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">{t('carry_forward_settings')}</div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">{t('carry_forward_enabled')}</span>
                                                {leaveType.carry_forward_max_days > 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        (Max: {leaveType.carry_forward_max_days} days)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>
                                    Leave type behavior and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('lbl_requires_approval')}</span>
                                    {leaveType.requires_approval ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('lbl_paid_leave')}</span>
                                    {leaveType.is_paid ? (
                                        <div className="flex items-center gap-1">
                                            <CreditCardIcon className="h-4 w-4 text-green-600" />
                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        </div>
                                    ) : (
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('active_status')}</span>
                                    <Badge variant={leaveType.is_active ? 'default' : 'secondary'}>
                                        {leaveType.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        {(leaveType.requests_count !== undefined || leaveType.active_requests_count !== undefined) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('ttl_usage_statistics')}</CardTitle>
                                    <CardDescription>
                                        Leave requests using this type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {leaveType.requests_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{t('th_total_requests')}</span>
                                            <Badge variant="outline">{leaveType.requests_count}</Badge>
                                        </div>
                                    )}

                                    {leaveType.active_requests_count !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{t('active_requests')}</span>
                                            <Badge variant="default">{leaveType.active_requests_count}</Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                                <CardDescription>
                                    Creation and modification details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                                    <div className="text-sm">{formatDate(leaveType.created_at)}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">{t('last_updated')}</div>
                                    <div className="text-sm">{formatDate(leaveType.updated_at)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}














