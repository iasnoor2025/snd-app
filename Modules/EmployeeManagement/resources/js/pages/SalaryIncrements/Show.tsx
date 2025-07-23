import { AppLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle, getTranslation, Separator } from '@/Core';
import Link from '@/Core/Components/text-link';
import { PageProps } from '@/Core/types';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, Clock, DollarSign, Edit, FileText, TrendingUp, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('employee');

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle null, undefined, or NaN values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    const formatDate = (dateString: string) => {
        return formatDateMedium(dateString);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            applied: 'bg-blue-100 text-blue-800',
        };
        return <Badge className={variants[status as keyof typeof variants]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
    const increasePercentage =
        increment.current_total_salary && increment.current_total_salary > 0
            ? ((increaseAmount / increment.current_total_salary) * 100).toFixed(2)
            : '0.00';

    return (
        <AppLayout
            title={t('ttl_salary_increment_details')}
            breadcrumbs={[
                { title: 'Salary Increments', href: route('salary-increments.index') },
                { title: `${increment.employee?.first_name || ''} ${increment.employee?.last_name || ''}` },
            ]}
        >
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('salary-increments.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800">{t('ttl_salary_increment_details')}</h2>
                        <p className="text-sm text-gray-600">
                            {increment.employee?.first_name || ''} {increment.employee?.last_name || ''} - {increment.employee?.employee_id || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(increment.status)}
                    {increment.status === 'pending' && (
                        <>
                            <Link href={route('salary-increments.edit', increment.id)}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleApprove} className="text-green-600 hover:text-green-700">
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleReject} className="text-red-600 hover:text-red-700">
                                <X className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </>
                    )}
                    {increment.status === 'approved' && (
                        <Button variant="outline" size="sm" onClick={handleApply} className="text-blue-600 hover:text-blue-700">
                            <Calendar className="mr-2 h-4 w-4" />
                            Apply Increment
                        </Button>
                    )}
                </div>
            </div>
            <Head title={`Salary Increment - ${increment.employee?.first_name || ''} ${increment.employee?.last_name || ''}`} />

            <div className="py-12">
                <div className="w-full sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Employee & Increment Info */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Employee Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        {t('employee_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('full_name')}</label>
                                            <p className="text-lg font-medium">
                                                {increment.employee?.first_name || ''} {increment.employee?.last_name || ''}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('employee_id')}</label>
                                            <p className="text-lg font-medium">{increment.employee?.employee_id || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Department</label>
                                            <p className="text-lg font-medium">{increment.employee.department ? getTranslation(increment.employee.department.name) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Position</label>
                                            <p className="text-lg font-medium">{increment.employee.position ? getTranslation(increment.employee.position.title) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-lg font-medium">{increment.employee?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('hire_date')}</label>
                                            <p className="text-lg font-medium">{increment.employee?.hire_date ? formatDate(increment.employee.hire_date) : 'N/A'}</p>
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
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_increment_type')}</label>
                                            <p className="text-lg font-medium">
                                                <Badge variant="outline">{increment.increment_type.replace('_', ' ').toUpperCase()}</Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_effective_date')}</label>
                                            <p className="text-lg font-medium">{formatDate(increment.effective_date)}</p>
                                        </div>
                                        {increment.increment_percentage && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">{t('lbl_increment_percentage')}</label>
                                                <p className="text-lg font-medium text-green-600">+{increment.increment_percentage}%</p>
                                            </div>
                                        )}
                                        {increment.increment_amount && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">{t('lbl_increment_amount')}</label>
                                                <p className="text-lg font-medium text-green-600">+{formatCurrency(increment.increment_amount)}</p>
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
                                            <p className="text-lg font-medium text-blue-600">+{formatCurrency(increaseAmount * 12)}</p>
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
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Current Salary */}
                                        <div>
                                            <h4 className="mb-3 font-medium text-gray-900">{t('current_salary')}</h4>
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
                                            <h4 className="mb-3 font-medium text-green-900">{t('new_salary')}</h4>
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
                                                    <span className="font-medium text-green-600">
                                                        {formatCurrency(increment.new_housing_allowance)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Transport Allowance:</span>
                                                    <span className="font-medium text-green-600">
                                                        {formatCurrency(increment.new_transport_allowance)}
                                                    </span>
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
                                        <p className="mt-1 whitespace-pre-wrap text-gray-900">{increment.reason}</p>
                                    </div>
                                    {increment.notes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">{t('lbl_additional_notes')}</label>
                                            <p className="mt-1 whitespace-pre-wrap text-gray-900">{increment.notes}</p>
                                        </div>
                                    )}
                                    {increment.rejection_reason && (
                                        <div>
                                            <label className="text-sm font-medium text-red-600">{t('lbl_rejection_reason')}</label>
                                            <p className="mt-1 rounded-md bg-red-50 p-3 whitespace-pre-wrap text-red-900">
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
                                    <div className="text-center">{getStatusBadge(increment.status)}</div>

                                    <Separator />

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                            <div>
                                                <p className="font-medium">{t('request_created')}</p>
                                                <p className="text-sm text-gray-600">{formatDate(increment.created_at)}</p>
                                                <p className="text-sm text-gray-500">by {increment.requested_by?.name || 'Unknown'}</p>
                                            </div>
                                        </div>

                                        {increment.approval_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                                                <div>
                                                    <p className="font-medium text-green-600">Approved</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.approval_date)}</p>
                                                    {increment.approved_by && (
                                                        <p className="text-sm text-gray-500">by {increment.approved_by?.name || 'Unknown'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {increment.rejection_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="mt-2 h-2 w-2 rounded-full bg-red-500"></div>
                                                <div>
                                                    <p className="font-medium text-red-600">Rejected</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.rejection_date)}</p>
                                                    {increment.rejected_by && (
                                                        <p className="text-sm text-gray-500">by {increment.rejected_by?.name || 'Unknown'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {increment.applied_date && (
                                            <div className="flex items-start gap-3">
                                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                                <div>
                                                    <p className="font-medium text-blue-600">Applied</p>
                                                    <p className="text-sm text-gray-600">{formatDate(increment.applied_date)}</p>
                                                    {increment.applied_by && <p className="text-sm text-gray-500">by {increment.applied_by?.name || 'Unknown'}</p>}
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
                                    <Link href={route('employees.show', increment.employee?.id || 0)} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="mr-2 h-4 w-4" />
                                            {t('view_employee_profile')}
                                        </Button>
                                    </Link>
                                    <Link href={route('employees.salary-history', increment.employee?.id || 0)} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            {t('view_salary_history')}
                                        </Button>
                                    </Link>
                                    <Link href={route('salary-increments.index')} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <TrendingUp className="mr-2 h-4 w-4" />
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
