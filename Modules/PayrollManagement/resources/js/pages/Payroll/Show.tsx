import { AppLayout, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
    currency: string;
}

interface Props {
    payroll: any;
    employee?: any;
    items?: any[];
    approver?: any;
    payer?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export default function Show({ payroll, employee = {}, items = [], approver = {}, payer = {}, created_at, updated_at, deleted_at }: Props) {
    const { t } = useTranslation('payrolls');

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            paid: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getCurrencySymbol = (currency: string) => {
        const symbols: Record<string, string> = {
            SAR: '﷼',
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            AED: 'د.إ',
        };
        return symbols[currency] || currency;
    };

    return (
        <AppLayout user={payroll.employee} header={<h2 className="text-xl leading-tight font-semibold text-gray-800">{t('ttl_payroll_details')}</h2>}>
            <Head title={t('ttl_payroll_details')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="outline" onClick={() => window.history.back()}>
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_payroll_information')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Employee</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{employee.name || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('lbl_payroll_month')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{format(new Date(payroll.payroll_month), 'MMMM yyyy')}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">{getStatusBadge(payroll.status)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('created_at')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{format(new Date(created_at || payroll.created_at), 'PPpp')}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('last_updated')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{format(new Date(updated_at || payroll.updated_at), 'PPpp')}</dd>
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
                                            {getCurrencySymbol(payroll.currency)}
                                            {payroll.base_salary.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Overtime</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {payroll.overtime_hours} hours × {getCurrencySymbol(payroll.currency)}
                                            {payroll.overtime_rate.toFixed(2)} = {getCurrencySymbol(payroll.currency)}
                                            {(payroll.overtime_hours * payroll.overtime_rate).toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Bonus</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {getCurrencySymbol(payroll.currency)}
                                            {payroll.bonus_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Deductions</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {getCurrencySymbol(payroll.currency)}
                                            {payroll.deduction_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                    <div className="border-t pt-4">
                                        <dt className="text-sm font-medium text-gray-500">{t('final_amount')}</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                                            {getCurrencySymbol(payroll.currency)}
                                            {payroll.final_amount.toFixed(2)}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>

                    {items.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>{t('ttl_payroll_items')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{item.type}</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{item.description}</td>
                                                    <td className="px-6 py-4 text-right text-sm whitespace-nowrap text-gray-900">
                                                        {getCurrencySymbol(payroll.currency)}
                                                        {item.amount.toFixed(2)}
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
        </AppLayout>
    );
}
