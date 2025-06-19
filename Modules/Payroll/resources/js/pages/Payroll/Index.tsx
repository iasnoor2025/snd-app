import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/Modules/Core/resources/js/layouts';
import { PageProps } from '@/Modules/Core/resources/js/types';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Modules/Core/resources/js/components/ui/table';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Modules/Core/resources/js/components/ui/dialog';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Modules/Core/resources/js/components/ui/select';
import { format } from 'date-fns';
import { route } from 'ziggy-js';

interface Props extends PageProps {
    payrolls: {
        data: Payroll[];
        links: any;
    };
    employees: Employee[];
    filters: {
        employee_id?: number;
        month?: string;
        status?: string;
    };
    hasRecords: boolean;
}

// Inline type definitions for Payroll and Employee

type Employee = {
    id: number;
    name: string;
    [key: string]: any;
};

type Payroll = {
    id: number;
    employee: Employee;
    salary_month: string;
    base_salary: number;
    overtime_amount: number;
    bonus: number;
    deduction: number;
    advance_deduction?: number;
    net_salary: number;
    status: string;
    [key: string]: any;
};

export default function Index({ auth, payrolls, employees, filters, hasRecords }: Props) {
  const { t } = useTranslation('payrolls');

    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        month: new Date().toISOString().slice(0, 7),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payroll.generate'), {
            onSuccess: () => setShowModal(false),
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('payroll.index'),
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            paid: 'default',
            cancelled: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredEmployees = employees?.filter(employee => employee.id != null && employee.name && employee.name !== '');
    console.log('Filtered Employees for Select:', filteredEmployees);
    const validEmployees = Array.isArray(filteredEmployees)
        ? filteredEmployees.filter(e => typeof e.id === 'number' && !isNaN(e.id) && e.name && typeof e.name === 'string' && e.name.trim() !== '')
        : [];
    console.log('Valid Employees for Select:', validEmployees);

    const hasInvalidOriginalEmployee = Array.isArray(employees) && employees.some(e => typeof e.id !== 'number' || isNaN(e.id) || !e.name || typeof e.name !== 'string' || e.name.trim() === '');

    console.log('Employees for Select:', employees);

    return (
        <AdminLayout
            title={t('payroll_management')}
            breadcrumbs={[
                { title: 'Payroll', href: route('payroll.index') },
            ]}
            requiredPermission="payroll.view"
        >
            <Head title={t('payroll_management')} />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('ttl_payroll_records')}</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowModal(true)}>
                                {t('generate_payroll')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.post(route('payroll.generate-monthly'))}
                            >
                                Generate Monthly
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4">
                                <Input
                                    type="month"
                                    value={filters.month || ''}
                                    onChange={(e) => handleFilter('month', e.target.value)}
                                    className="w-48"
                                />
                                <Select
                                    value={filters.status || ''}
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder={t('all_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.employee_id?.toString() || ''}
                                    onValueChange={(value) => handleFilter('employee_id', value)}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder={t('ph_all_employees')} />
                                    </SelectTrigger>
                                    {hasInvalidOriginalEmployee ? (
                                        <div style={{ color: 'red', padding: 8 }}>
                                            Invalid employee data detected. Please copy the following and send to support:<br />
                                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fee', color: '#a00', padding: 8, borderRadius: 4 }}>{JSON.stringify(employees, null, 2)}</pre>
                                        </div>
                                    ) : (
                                        <SelectContent>
                                            {employees
                                                .filter(e => e.id && typeof e.id === 'number' && e.name && e.name.trim() !== '')
                                                .map(e => {
                                                    const value = e.id.toString();
                                                    if (!value) {
                                                        console.error('Invalid employee id:', e);
                                                        return null;
                                                    }
                                                    return (
                                                        <SelectItem key={e.id} value={value}>
                                                            {e.name}
                                                        </SelectItem>
                                                    );
                                                })}
                                        </SelectContent>
                                    )}
                                </Select>
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Month</TableHead>
                                        <TableHead>{t('base_salary')}</TableHead>
                                        <TableHead>Overtime</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Deductions</TableHead>
                                        <TableHead>{t('final_amount')}</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hasRecords && payrolls?.data?.length > 0 ? (
                                        payrolls.data.map((payroll) => (
                                            <TableRow key={payroll.id}>
                                                <TableCell>{payroll.employee.name}</TableCell>
                                                <TableCell>
                                                    {format(new Date(payroll.salary_month), 'MMM yyyy')}
                                                </TableCell>
                                                <TableCell>${payroll.base_salary.toFixed(2)}</TableCell>
                                                <TableCell>${payroll.overtime_amount.toFixed(2)}</TableCell>
                                                <TableCell>${payroll.bonus.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    ${(payroll.deduction.toFixed(2) + (payroll.advance_deduction || 0).toFixed(2))}
                                                </TableCell>
                                                <TableCell>${payroll.net_salary.toFixed(2)}</TableCell>
                                                <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => router.get(route('payroll.show', { payroll: payroll.id }))}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <p>{t('no_payroll_records_found')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('generate_payroll')}</DialogTitle>
                        <DialogDescription>
                            Select the month for which you want to generate payroll records.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="month">{t('lbl_select_month')}</Label>
                                <Input
                                    type="month"
                                    id="month"
                                    value={data.month}
                                    onChange={e => setData('month', e.target.value)}
                                    required
                                />
                                {errors.month && (
                                    <p className="text-sm text-red-500">{errors.month}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                Generate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}














