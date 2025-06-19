import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { PageProps } from '../../types';
import { AdminLayout } from '@/Modules/Core/resources/js';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { format } from 'date-fns';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface PayrollItem {
    id: number;
    type: string;
    description: string;
    amount: number;
}

interface Payroll {
    id: number;
    employee: {
        id: number;
        name: string;
    };
    payroll_month: string;
    base_salary: number;
    overtime_hours: number;
    overtime_rate: number;
    bonus_amount: number;
    deduction_amount: number;
    final_amount: number;
    status: string;
    notes: string;
    items: PayrollItem[];
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    payroll: Payroll;
    auth?: any;
}

export default function Show({ auth, payroll }: Props) {
  const { t } = useTranslation('payrolls');

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            paid: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('ttl_payroll_details')}</h2>}
        >
            <Head title={t('ttl_payroll_details')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Back to Payrolls
                        </Button>
                        {payroll.status === 'pending' && (
                            <div className="space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to cancel this payroll?')) {
                                            // Handle cancel
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to approve this payroll?')) {
                                            // Handle approve
                                        }
                                    }}
                                >
                                    Approve
                                </Button>
                            </div>
                        )}
                        {payroll.status === 'approved' && (
                            <Button
                                onClick={() => {
                                    if (confirm('Are you sure you want to mark this payroll as paid?')) {
                                        // Handle mark as paid
                                    }
                                }}
                            >
                                Mark as Paid
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_payroll_information')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Employee</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{payroll.employee.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('lbl_payroll_month')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(payroll.payroll_month), 'MMMM yyyy')}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">{getStatusBadge(payroll.status)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('created_at')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(payroll.created_at), 'PPpp')}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('last_updated')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(new Date(payroll.updated_at), 'PPpp')}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_salary_details')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('base_salary')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            ${payroll.base_salary.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Overtime</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {payroll.overtime_hours} hours × ${payroll.overtime_rate.toFixed(2)} = ${(payroll.overtime_hours * payroll.overtime_rate).toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Bonus</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            ${payroll.bonus_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Deductions</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            ${payroll.deduction_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <dt className="text-sm font-medium text-gray-500">{t('final_amount')}</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                                            ${payroll.final_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>

                    {payroll.items.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>{t('ttl_payroll_items')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {payroll.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                        ${item.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {payroll.notes && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-900">{payroll.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}














