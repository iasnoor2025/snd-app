import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Link from '@/Core/components/text-link';
import { Button } from "@/Core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { Separator } from "@/Core";
import { ArrowLeft, Check, X, Calendar, Edit, User, DollarSign, TrendingUp, FileText, Clock } from 'lucide-react';
import { AppLayout } from '@/Core';
import { PageProps } from '@/Core/types';
import { getTranslation } from "@/Core";
import { route } from 'ziggy-js';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
    phone?: string;
    hire_date: string;
    department: {
        name: string;
    };
    position: {
        title: string;
    };
}

interface SalaryIncrement {
    id: number;
    employee: Employee;
    increment_type: string;
    increment_percentage?: number;
    increment_amount?: number;
    current_base_salary: number;
    current_food_allowance: number;
    current_housing_allowance: number;
    current_transport_allowance: number;
    current_total_salary: number;
    new_base_salary: number;
    new_food_allowance: number;
    new_housing_allowance: number;
    new_transport_allowance: number;
    new_total_salary: number;
    effective_date: string;
    status: 'pending' | 'approved' | 'rejected' | 'applied';
    reason: string;
    notes?: string;
    requested_by: {
        name: string;
        email: string;
    };
    approved_by?: {
        name: string;
        email: string;
    };
    rejected_by?: {
        name: string;
        email: string;
    };
    applied_by?: {
        name: string;
        email: string;
    };
    approval_date?: string;
    rejection_date?: string;
    rejection_reason?: string;
    applied_date?: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    increment: SalaryIncrement;
}

export default function Show({ increment }: Props) {
  const { t } = useTranslation('employees');

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle null, undefined, or NaN values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            applied: 'bg-blue-100 text-blue-800',
        };
        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this salary increment?')) {
            router.post(route('salary-increments.approve', increment.id));
        }
    };

    const handleReject = () => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(route('salary-increments.reject', increment.id), {
                rejection_reason: reason,
            });
        }
    };

    const handleApply = () => {
        if (confirm('Are you sure you want to apply this salary increment? This action cannot be undone.')) {
            router.post(route('salary-increments.apply', increment.id));
        }
    };

    const increaseAmount = (increment.new_total_salary || 0) - (increment.current_total_salary || 0);
    const increasePercentage = increment.current_total_salary && increment.current_total_salary > 0
        ? ((increaseAmount / increment.current_total_salary) * 100).toFixed(2)
        : '0.00';

    return (
        <AppLayout
            title={t('ttl_salary_increment_details')}
            breadcrumbs={[
                { title: 'Salary Increments', href: route('salary-increments.index') },
                { title: `${increment.employee.first_name} ${increment.employee.last_name}` }
            ]}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href={route('salary-increments.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('ttl_salary_increment_details')}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {increment.employee.first_name} {increment.employee.last_name} - {increment.employee.employee_id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(increment.status)}
                    {increment.status === 'pending' && (
                        <>
                            <Link href={route('salary-increments.edit', increment.id)}>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleApprove}
                                className="text-green-600 hover:text-green-700"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReject}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </>
                    )}
                    {increment.status === 'approved' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleApply}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Apply Increment
                        </Button>
                    )}
                </div>
            </div>
            <Head title={`Salary Increment - ${increment.employee.first_name} ${increment.employee.last_name}`} />

            <div className="py-12">
                <div className="sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Employee & Increment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Employee Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        {t('employee_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('full_name')}</label>
                                            <p className="text-lg font-medium">
                                                {increment.employee.first_name} {increment.employee.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('employee_id')}</label>
                                            <p className="text-lg font-medium">{increment.employee.employee_id}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Department</label>
                                            <p className="text-lg font-medium">{getTranslation(increment.employee.department.name)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Position</label>
                                            <p className="text-lg font-medium">{getTranslation(increment.employee.position.name)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-lg font-medium">{increment.employee.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('hire_date')}</label>
                                            <p className="text-lg font-medium">{formatDate(increment.employee.hire_date)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Increment Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        {t('ttl_increment_details')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_increment_type')}</label>
                                            <p className="text-lg font-medium">
                                                <Badge variant="outline">
                                                    {increment.increment_type.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_effective_date')}</label>
                                            <p className="text-lg font-medium">{formatDate(increment.effective_date)}</p>
                                        </div>
                                        {increment.increment_percentage && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">{t('lbl_increment_percentage')}</label>
                                                <p className="text-lg font-medium text-green-600">
                                                    +{increment.increment_percentage}%
                                                </p>
                                            </div>
                                        )}
                                        {increment.increment_amount && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">{t('lbl_increment_amount')}</label>
                                                <p className="text-lg font-medium text-green-600">
                                                    +{formatCurrency(increment.increment_amount)}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_total_increase')}</label>
                                            <p className="text-lg font-medium text-green-600">
                                                +{formatCurrency(increaseAmount)} (+{increasePercentage}%)
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_annual_impact')}</label>
                                            <p className="text-lg font-medium text-blue-600">
                                                +{formatCurrency(increaseAmount * 12)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Salary Breakdown Comparison */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Salary Breakdown Comparison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Current Salary */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">{t('current_salary')}</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Base Salary:</span>
                                                    <span className="font-medium">{formatCurrency(increment.current_base_salary)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Food Allowance:</span>
                                                    <span className="font-medium">{formatCurrency(increment.current_food_allowance)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Housing Allowance:</span>
                                                    <span className="font-medium">{formatCurrency(increment.current_housing_allowance)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Transport Allowance:</span>
                                                    <span className="font-medium">{formatCurrency(increment.current_transport_allowance)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Total:</span>
                                                    <span className="font-bold">{formatCurrency(increment.current_total_salary)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* New Salary */}
                                        <div>
                                            <h4 className="font-medium text-green-900 mb-3">{t('new_salary')}</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Base Salary:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(increment.new_base_salary)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Food Allowance:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(increment.new_food_allowance)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Housing Allowance:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(increment.new_housing_allowance)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Transport Allowance:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(increment.new_transport_allowance)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Total:</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(increment.new_total_salary)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reason and Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Justification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">{t('lbl_reason_for_increment')}</label>
                                        <p className="mt-1 text-gray-900 whitespace-pre-wrap">{increment.reason}</p>
                                    </div>
                                    {increment.notes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_additional_notes')}</label>
                                            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{increment.notes}</p>
                                        </div>
                                    )}
                                    {increment.rejection_reason && (
                                        <div>
                                            <label className="text-sm font-medium text-red-600">{t('lbl_rejection_reason')}</label>
                                            <p className="mt-1 text-red-900 whitespace-pre-wrap bg-red-50 p-3 rounded-md">
                                                {increment.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Status & Timeline */}
                        <div className="space-y-6">
                            {/* Status Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Status & Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        {getStatusBadge(increment.status)}
                                    </div>

                                    <Separator />

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div>
                                                <p className="font-medium">{t('request_created')}</p>
                                                <p className="text-sm text-gray-600">{formatDate(increment.created_at)}</p>
                                                <p className="text-sm text-gray-500">by {increment.requested_by.name}</p>
                                            </div>
                                        </div>

                                        {increment.approval_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-green-600">Approved</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.approval_date)}</p>
                                                    {increment.approved_by && (
                                                        <p className="text-sm text-gray-500">by {increment.approved_by.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {increment.rejection_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-red-600">Rejected</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.rejection_date)}</p>
                                                    {increment.rejected_by && (
                                                        <p className="text-sm text-gray-500">by {increment.rejected_by.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {increment.applied_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-blue-600">Applied</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.applied_date)}</p>
                                                    {increment.applied_by && (
                                                        <p className="text-sm text-gray-500">by {increment.applied_by.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('quick_actions')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={route('employees.show', increment.employee.id)} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="h-4 w-4 mr-2" />
                                            {t('view_employee_profile')}
                                        </Button>
                                    </Link>
                                    <Link href={route('employees.salary-history', increment.employee.id)} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            {t('view_salary_history')}
                                        </Button>
                                    </Link>
                                    <Link href={route('salary-increments.index')} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            {t('all_salary_increments')}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
















