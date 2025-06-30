import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { AppLayout } from '@/Core';
import { PageProps } from "@/Core/types";
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { Badge } from "@/Core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Core";
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

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
  const { t } = useTranslation('PayrollManagement');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        month: new Date().toISOString().slice(0, 7),
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('payroll.generate'), formData, {
            onSuccess: () => {
                setShowModal(false);
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
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
        <AppLayout
            title="Payroll Management"
            breadcrumbs={[
                { title: 'Payroll', href: route('payroll.index') },
            ]}
            requiredPermission="payroll.view"
        >
            <Head title="Payroll Management" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payroll Management</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowModal(true)}>
                                Process Payroll
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
                                        <SelectValue placeholder="Select Status" />
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
                                        <SelectValue placeholder="Select Employee" />
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
                        <div className="rounded-md border mt-6">
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
                                                    {(() => {
                                                        try {
                                                            const date = new Date(payroll.salary_month);
                                                            if (isNaN(date.getTime())) {
                                                                return payroll.salary_month || 'Invalid Date';
                                                            }
                                                            return format(date, 'MMM yyyy');
                                                        } catch (error) {
                                                            console.error('Date formatting error:', error, 'Value:', payroll.salary_month);
                                                            return payroll.salary_month || 'Invalid Date';
                                                        }
                                                    })()}
                                                </TableCell>
                                                <TableCell>${(Number(payroll.base_salary) || 0).toFixed(2)}</TableCell>
                                                <TableCell>${(Number(payroll.overtime_amount) || 0).toFixed(2)}</TableCell>
                                                <TableCell>${(Number(payroll.bonus) || 0).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    ${((Number(payroll.deduction) || 0) + (Number(payroll.advance_deduction) || 0)).toFixed(2)}
                                                </TableCell>
                                                <TableCell>${(Number(payroll.net_salary) || 0).toFixed(2)}</TableCell>
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
                                                <p>No payroll records found</p>
                                            </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {payrolls?.data && payrolls.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {payrolls.data.length} records
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!payrolls.links?.prev}
                                        onClick={() => payrolls.links?.prev && router.get(payrolls.links.prev)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!payrolls.links?.next}
                                        onClick={() => payrolls.links?.next && router.get(payrolls.links.next)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Payroll</DialogTitle>
                        <DialogDescription>
                            Select the month for which you want to generate payroll records.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="month">Select Month</Label>
                                <Input
                                    type="month"
                                    id="month"
                                    value={formData.month}
                                    onChange={e => setFormData(prev => ({ ...prev, month: e.target.value }))}
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
        </AppLayout>
    );
}














