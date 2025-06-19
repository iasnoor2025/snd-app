import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/Modules/Core/resources/js/types';
import { AdminLayout } from '@/Modules/Core/resources/js/layouts';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Modules/Core/resources/js/components/ui/card';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import { ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react';
import { route } from 'ziggy-js';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    basic_salary?: number;
}

interface Props extends PageProps {
    employees: Employee[];
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Salary Advances',
        href: '/salary-advances',
    },
    {
        title: 'Request Advance',
        href: '/salary-advances/create',
    },
];

export default function Create({ auth, employees }: Props) {
  const { t } = useTranslation('payroll');

    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        amount: '',
        advance_date: format(new Date(), 'yyyy-MM-dd'),
        deduction_start_date: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/salary-advances');
    };

    const handleEmployeeChange = (employeeId: string) => {
        setData('employee_id', employeeId);
    };

    const selectedEmployee = employees.find(emp => emp.id === parseInt(data.employee_id));
    const maxAdvanceAmount = selectedEmployee?.basic_salary ? selectedEmployee.basic_salary * 0.5 : 0;

    return (
        <AdminLayout
            title={t('request_salary_advance')}
            breadcrumbs={breadcrumbs}
            requiredPermission="salary-advances.create"
        >
            <Head title={t('request_salary_advance')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/salary-advances">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('request_salary_advance')}</h1>
                        <p className="text-muted-foreground">
                            Submit a new salary advance request
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Salary Advance Request
                            </CardTitle>
                            <CardDescription>
                                Fill out the form below to request a salary advance. All requests require approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Employee Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Employee *</Label>
                                    <Select
                                        value={data.employee_id}
                                        onValueChange={handleEmployeeChange}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_employee_1')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem
                                                    key={employee.id}
                                                    value={employee.id.toString()}
                                                >
                                                    {employee.first_name} {employee.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && (
                                        <p className="text-sm text-destructive">{errors.employee_id}</p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={maxAdvanceAmount || undefined}
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {maxAdvanceAmount > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Maximum advance: ${maxAdvanceAmount.toLocaleString()} (50% of basic salary)
                                        </p>
                                    )}
                                    {errors.amount && (
                                        <p className="text-sm text-destructive">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Advance Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="advance_date">Advance Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="advance_date"
                                            type="date"
                                            value={data.advance_date}
                                            onChange={(e) => setData('advance_date', e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.advance_date && (
                                        <p className="text-sm text-destructive">{errors.advance_date}</p>
                                    )}
                                </div>

                                {/* Deduction Start Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="deduction_start_date">Deduction Start Date *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="deduction_start_date"
                                            type="date"
                                            value={data.deduction_start_date}
                                            onChange={(e) => setData('deduction_start_date', e.target.value)}
                                            className="pl-10"
                                            min={data.advance_date}
                                            required
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        When should the deduction from salary begin?
                                    </p>
                                    {errors.deduction_start_date && (
                                        <p className="text-sm text-destructive">{errors.deduction_start_date}</p>
                                    )}
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason *</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="reason"
                                            placeholder={t('ph_please_provide_a_reason_for_the_salary_advance')}
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            className="min-h-[100px] pl-10 pt-3"
                                            maxLength={500}
                                            required
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {data.reason.length}/500 characters
                                    </p>
                                    {errors.reason && (
                                        <p className="text-sm text-destructive">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Important Notes */}
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <h4 className="font-medium text-amber-800">Important Notes:</h4>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
                                        <li>{t('all_salary_advance_requests_require_approval_from')}</li>
                                        <li>{t('the_advance_amount_will_be_deducted_from_your_sala')}</li>
                                        <li>Maximum advance amount is typically 50% of your basic salary</li>
                                        <li>Processing may take 2-3 business days after approval</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/salary-advances">
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}














