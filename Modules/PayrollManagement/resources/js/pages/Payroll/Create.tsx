import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '../../types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { format } from 'date-fns';
import FileUpload from '@/components/FileUpload';

interface Employee {
    id: number;
    name: string;
    base_salary: number;
}

interface Props extends PageProps {
    auth?: any;
    employees: Employee[];
}

export default function Create({ auth, employees }: Props) {
  const { t } = useTranslation('payrolls');

    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        payroll_month: format(new Date(), 'yyyy-MM'),
        base_salary: 0,
        overtime_hours: 0,
        overtime_rate: 0,
        bonus_amount: 0,
        deduction_amount: 0,
        notes: '',
    });

    const currencyOptions = [
        { code: 'SAR', label: 'Saudi Riyal (SAR)' },
        { code: 'USD', label: 'US Dollar (USD)' },
        { code: 'EUR', label: 'Euro (EUR)' },
        { code: 'GBP', label: 'British Pound (GBP)' },
        { code: 'INR', label: 'Indian Rupee (INR)' },
        { code: 'AED', label: 'UAE Dirham (AED)' },
    ];

    const [currency, setCurrency] = React.useState('SAR');
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });
        formData.append('currency', currency);
        if (uploadedFile) {
            formData.append('document', uploadedFile);
        }
        post(route('payrolls.store'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                // Handle the response
            },
        });
    };

    const handleEmployeeChange = (employeeId: string) => {
        const employee = employees.find(emp => emp.id === parseInt(employeeId));
        setData({
            ...data,
            employee_id: employeeId,
            base_salary: employee?.base_salary || 0,
            overtime_rate: employee?.base_salary ? employee.base_salary / 160 : 0, // Assuming 160 hours per month
        });
    };

    return (
        <AppLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('ttl_create_payroll')}</h2>}
        >
            <Head title={t('ttl_create_payroll')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_create_new_payroll')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">{t('lbl_employee')}</Label>
                                        <Select
                                            value={data.employee_id}
                                            onValueChange={handleEmployeeChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ph_select_employee')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        {employee.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.employee_id && (
                                            <p className="text-sm text-red-500">{errors.employee_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payroll_month">{t('lbl_payroll_month')}</Label>
                                        <Input
                                            id="payroll_month"
                                            type="month"
                                            value={data.payroll_month}
                                            onChange={(e) => setData('payroll_month', e.target.value)}
                                        />
                                        {errors.payroll_month && (
                                            <p className="text-sm text-red-500">{errors.payroll_month}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="base_salary">{t('base_salary')}</Label>
                                        <Input
                                            id="base_salary"
                                            type="number"
                                            value={data.base_salary}
                                            onChange={(e) => setData('base_salary', parseFloat(e.target.value))}
                                        />
                                        {errors.base_salary && (
                                            <p className="text-sm text-red-500">{errors.base_salary}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="overtime_hours">{t('lbl_overtime_hours')}</Label>
                                        <Input
                                            id="overtime_hours"
                                            type="number"
                                            value={data.overtime_hours}
                                            onChange={(e) => setData('overtime_hours', parseFloat(e.target.value))}
                                        />
                                        {errors.overtime_hours && (
                                            <p className="text-sm text-red-500">{errors.overtime_hours}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="overtime_rate">{t('lbl_overtime_rate_per_hour')}</Label>
                                        <Input
                                            id="overtime_rate"
                                            type="number"
                                            value={data.overtime_rate}
                                            onChange={(e) => setData('overtime_rate', parseFloat(e.target.value))}
                                        />
                                        {errors.overtime_rate && (
                                            <p className="text-sm text-red-500">{errors.overtime_rate}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bonus_amount">{t('lbl_bonus_amount')}</Label>
                                        <Input
                                            id="bonus_amount"
                                            type="number"
                                            value={data.bonus_amount}
                                            onChange={(e) => setData('bonus_amount', parseFloat(e.target.value))}
                                        />
                                        {errors.bonus_amount && (
                                            <p className="text-sm text-red-500">{errors.bonus_amount}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deduction_amount">{t('lbl_deduction_amount')}</Label>
                                        <Input
                                            id="deduction_amount"
                                            type="number"
                                            value={data.deduction_amount}
                                            onChange={(e) => setData('deduction_amount', parseFloat(e.target.value))}
                                        />
                                        {errors.deduction_amount && (
                                            <p className="text-sm text-red-500">{errors.deduction_amount}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="notes">{t('lbl_notes')}</Label>
                                        <Input
                                            id="notes"
                                            type="text"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-red-500">{errors.notes}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select value={currency} onValueChange={setCurrency} name="currency">
                                            <SelectTrigger id="currency">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencyOptions.map(opt => (
                                                    <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">Upload Payroll Document</label>
                                        <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        {t('btn_cancel')}
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Submitting...' : t('btn_create_payroll')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}














