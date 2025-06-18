import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Show({ auth, payroll }) {
  const { t } = useTranslation('payroll');

    const { post, processing } = useForm();

    const handleApprove = () => {
        post(route('payrolls.approve', payroll.id));
    };

    const handleProcessPayment = () => {
        post(route('payrolls.process-payment', payroll.id));
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this payroll?')) {
            post(route('payrolls.cancel', payroll.id));
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={statusColors[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout
            title={t('ttl_payroll_details')}
        >
            <Head title={t('ttl_payroll_details')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_payroll_information')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                                        <p className="mt-1">{payroll.employee.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('lbl_payroll_month')}</h3>
                                        <p className="mt-1">{format(new Date(payroll.payroll_month), 'MMMM yyyy')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                        <p className="mt-1">{getStatusBadge(payroll.status)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('generated_at')}</h3>
                                        <p className="mt-1">{format(new Date(payroll.generated_at), 'PPpp')}</p>
                                    </div>
                                    {payroll.approver && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">{t('approved_by')}</h3>
                                            <p className="mt-1">{payroll.approver.name}</p>
                                        </div>
                                    )}
                                    {payroll.payer && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">{t('paid_by')}</h3>
                                            <p className="mt-1">{payroll.payer.name}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_salary_breakdown')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>{t('base_salary')}</span>
                                        <span>${payroll.base_salary.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('overtime_amount')}</span>
                                        <span>${payroll.overtime_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bonus</span>
                                        <span>${payroll.bonus.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deductions</span>
                                        <span>-${payroll.deduction.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>{t('net_salary')}</span>
                                            <span>${payroll.net_salary.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t('ttl_payroll_items')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payroll.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="capitalize">{item.type.replace('_', ' ')}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>${item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end space-x-4">
                        {payroll.status === 'pending' && (
                            <Button
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                Approve Payroll
                            </Button>
                        )}
                        {payroll.status === 'approved' && (
                            <Button
                                onClick={handleProcessPayment}
                                disabled={processing}
                            >
                                Process Payment
                            </Button>
                        )}
                        {['pending', 'approved'].includes(payroll.status) && (
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                Cancel Payroll
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
