import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '../../types';
import AdminLayout from '@/layouts/AdminLayout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Final Settlements',
        href: '/final-settlements',
    },
    {
        title: 'Create Settlement',
        href: '/final-settlements/create',
    },
];

interface Props extends PageProps {
    auth?: any;
    employee: {
        id: number;
        employee_id: string;
        first_name: string;
        last_name: string;
        basic_salary: number;
        leave_balance: number;
    };
    initialData: {
        last_working_day: string;
        leave_encashment: number;
        unpaid_salary: number;
        unpaid_overtime: number;
        deductions: number;
        gratuity: number;
        total_payable: number;
    };
}

export default function Create({ auth, employee, initialData }: Props) {
  const { t } = useTranslation('payroll');

    const { hasPermission } = usePermission();

    const { data, setData, post, processing, errors } = useForm({
        last_working_day: initialData.last_working_day,
        leave_encashment: initialData.leave_encashment,
        unpaid_salary: initialData.unpaid_salary,
        unpaid_overtime: initialData.unpaid_overtime,
        deductions: initialData.deductions,
        gratuity: initialData.gratuity,
        total_payable: initialData.total_payable,
        notes: '',
        agreement_terms: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('employees.final-settlement.store', employee.id));
    };

    return (
        <AdminLayout title={t('ttl_create_final_settlement')} breadcrumbs={breadcrumbs} requiredPermission="final-settlements.create">
            <Head title={t('ttl_create_final_settlement')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <a href={route('final-settlements.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('ttl_create_final_settlement')}
                        </h1>
                        <p className="text-muted-foreground">
                            For {employee.first_name} {employee.last_name} (ID: {employee.employee_id})
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('settlement_details')}</CardTitle>
                            <CardDescription>{t('enter_the_final_settlement_details')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="last_working_day">{t('last_working_day')}</Label>
                                    <Input
                                        id="last_working_day"
                                        type="date"
                                        value={data.last_working_day}
                                        onChange={e => setData('last_working_day', e.target.value)}
                                        required
                                    />
                                    {errors.last_working_day && (
                                        <p className="text-sm text-red-500">{errors.last_working_day}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leave_encashment">{t('lbl_leave_encashment')}</Label>
                                    <Input
                                        id="leave_encashment"
                                        type="number"
                                        step="0.01"
                                        value={data.leave_encashment}
                                        onChange={e => setData('leave_encashment', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.leave_encashment && (
                                        <p className="text-sm text-red-500">{errors.leave_encashment}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unpaid_salary">{t('lbl_unpaid_salary')}</Label>
                                    <Input
                                        id="unpaid_salary"
                                        type="number"
                                        step="0.01"
                                        value={data.unpaid_salary}
                                        onChange={e => setData('unpaid_salary', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.unpaid_salary && (
                                        <p className="text-sm text-red-500">{errors.unpaid_salary}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unpaid_overtime">{t('lbl_unpaid_overtime')}</Label>
                                    <Input
                                        id="unpaid_overtime"
                                        type="number"
                                        step="0.01"
                                        value={data.unpaid_overtime}
                                        onChange={e => setData('unpaid_overtime', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.unpaid_overtime && (
                                        <p className="text-sm text-red-500">{errors.unpaid_overtime}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deductions">Deductions</Label>
                                    <Input
                                        id="deductions"
                                        type="number"
                                        step="0.01"
                                        value={data.deductions}
                                        onChange={e => setData('deductions', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.deductions && (
                                        <p className="text-sm text-red-500">{errors.deductions}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gratuity">Gratuity</Label>
                                    <Input
                                        id="gratuity"
                                        type="number"
                                        step="0.01"
                                        value={data.gratuity}
                                        onChange={e => setData('gratuity', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.gratuity && (
                                        <p className="text-sm text-red-500">{errors.gratuity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_payable">{t('lbl_total_payable')}</Label>
                                    <Input
                                        id="total_payable"
                                        type="number"
                                        step="0.01"
                                        value={data.total_payable}
                                        onChange={e => setData('total_payable', parseFloat(e.target.value))}
                                        required
                                    />
                                    {errors.total_payable && (
                                        <p className="text-sm text-red-500">{errors.total_payable}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-500">{errors.notes}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agreement_terms">{t('agreement_terms')}</Label>
                                <Textarea
                                    id="agreement_terms"
                                    value={data.agreement_terms}
                                    onChange={e => setData('agreement_terms', e.target.value)}
                                    rows={5}
                                />
                                {errors.agreement_terms && (
                                    <p className="text-sm text-red-500">{errors.agreement_terms}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Settlement
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

