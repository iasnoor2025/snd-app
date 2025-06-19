import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import { Switch } from '@/Modules/Core/resources/js/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Modules/Core/resources/js/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/Modules/Core/resources/js/components/ui/breadcrumb';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';

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
}

interface FormData {
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
}

interface Props {
    leaveType: LeaveType;
}

export default function EditLeaveType({ leaveType }: Props) {
  const { t } = useTranslation('leave');

    const { can } = usePermission();

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        name: leaveType.name || '',
        description: leaveType.description || '',
        max_days: leaveType.max_days || 0,
        requires_approval: leaveType.requires_approval || true,
        is_paid: leaveType.is_paid || true,
        is_active: leaveType.is_active || true,
        allow_carry_forward: leaveType.allow_carry_forward || false,
        carry_forward_max_days: leaveType.carry_forward_max_days || 0,
        notice_days: leaveType.notice_days || 1,
        gender_specific: leaveType.gender_specific || 'both',
        applicable_after_months: leaveType.applicable_after_months || 0,
        color: leaveType.color || '#3B82F6',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!can('leave-types.edit')) {
            toast.error('You do not have permission to edit leave types.');
            return;
        }

        put(route('leaves.types.update', leaveType.id), {
            onSuccess: () => {
                toast.success('Leave type updated successfully!');
                router.visit(route('leaves.types.index'));
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please check the form for errors.');
                }
            },
        });
    };

    const handleCancel = () => {
        router.visit(route('leaves.types.index'));
    };

    const handleReset = () => {
        reset();
        toast.info('Form has been reset to original values.');
    };

    return (
        <>
            <Head title={`Edit ${leaveType.name}`} />

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
                            <BreadcrumbPage>Edit {leaveType.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleCancel}>
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('edit_leave_type')}</h1>
                        <p className="text-muted-foreground">{t('update_the_leave_type_information')}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('ttl_basic_information')}</CardTitle>
                                    <CardDescription>
                                        Update the basic details for the leave type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder={t('ph_eg_annual_leave')}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="color">Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="color"
                                                    type="color"
                                                    value={data.color}
                                                    onChange={(e) => setData('color', e.target.value)}
                                                    className="w-16 h-10 p-1 border rounded"
                                                />
                                                <Input
                                                    type="text"
                                                    value={data.color}
                                                    onChange={(e) => setData('color', e.target.value)}
                                                    placeholder={t('ph_3b82f6')}
                                                    className="flex-1"
                                                />
                                            </div>
                                            {errors.color && (
                                                <p className="text-sm text-red-500">{errors.color}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder={t('ph_brief_description_of_the_leave_type')}
                                            rows={3}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Leave Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('ttl_leave_configuration')}</CardTitle>
                                    <CardDescription>
                                        Update the leave type settings and rules
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_days">Maximum Days *</Label>
                                            <Input
                                                id="max_days"
                                                type="number"
                                                min="0"
                                                value={data.max_days}
                                                onChange={(e) => setData('max_days', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className={errors.max_days ? 'border-red-500' : ''}
                                            />
                                            {errors.max_days && (
                                                <p className="text-sm text-red-500">{errors.max_days}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notice_days">Notice Days *</Label>
                                            <Input
                                                id="notice_days"
                                                type="number"
                                                min="0"
                                                value={data.notice_days}
                                                onChange={(e) => setData('notice_days', parseInt(e.target.value) || 0)}
                                                placeholder="1"
                                                className={errors.notice_days ? 'border-red-500' : ''}
                                            />
                                            {errors.notice_days && (
                                                <p className="text-sm text-red-500">{errors.notice_days}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="applicable_after_months">Applicable After (Months)</Label>
                                            <Input
                                                id="applicable_after_months"
                                                type="number"
                                                min="0"
                                                value={data.applicable_after_months}
                                                onChange={(e) => setData('applicable_after_months', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className={errors.applicable_after_months ? 'border-red-500' : ''}
                                            />
                                            {errors.applicable_after_months && (
                                                <p className="text-sm text-red-500">{errors.applicable_after_months}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender_specific">{t('gender_specific')}</Label>
                                        <Select
                                            value={data.gender_specific}
                                            onValueChange={(value) => setData('gender_specific', value)}
                                        >
                                            <SelectTrigger className={errors.gender_specific ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={t('ph_select_gender_applicability')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="both">Both</SelectItem>
                                                <SelectItem value="male">{t('opt_male_only')}</SelectItem>
                                                <SelectItem value="female">{t('opt_female_only')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender_specific && (
                                            <p className="text-sm text-red-500">{errors.gender_specific}</p>
                                        )}
                                    </div>

                                    {/* Carry Forward Settings */}
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="allow_carry_forward">{t('lbl_allow_carry_forward')}</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow unused leave days to be carried forward to next year
                                                </p>
                                            </div>
                                            <Switch
                                                id="allow_carry_forward"
                                                checked={data.allow_carry_forward}
                                                onCheckedChange={(checked) => setData('allow_carry_forward', checked)}
                                            />
                                        </div>

                                        {data.allow_carry_forward && (
                                            <div className="space-y-2">
                                                <Label htmlFor="carry_forward_max_days">{t('lbl_maximum_carry_forward_days')}</Label>
                                                <Input
                                                    id="carry_forward_max_days"
                                                    type="number"
                                                    min="0"
                                                    value={data.carry_forward_max_days}
                                                    onChange={(e) => setData('carry_forward_max_days', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className={errors.carry_forward_max_days ? 'border-red-500' : ''}
                                                />
                                                {errors.carry_forward_max_days && (
                                                    <p className="text-sm text-red-500">{errors.carry_forward_max_days}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Settings */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>
                                        Configure leave type behavior and permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="requires_approval">{t('lbl_requires_approval')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Leave requests need manager approval
                                            </p>
                                        </div>
                                        <Switch
                                            id="requires_approval"
                                            checked={data.requires_approval}
                                            onCheckedChange={(checked) => setData('requires_approval', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_paid">{t('lbl_paid_leave')}</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Employee receives salary during leave
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_paid"
                                            checked={data.is_paid}
                                            onCheckedChange={(checked) => setData('is_paid', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Active</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Leave type is available for use
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            {processing ? 'Updating...' : 'Update Leave Type'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReset}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleCancel}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}














