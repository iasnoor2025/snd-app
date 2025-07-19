import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Banknote, Calendar, User, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

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
    month: number;
    year: number;
    base_salary: number;
    overtime_amount: number;
    bonus_amount: number;
    deduction_amount: number;
    advance_deduction?: number;
    final_amount: number;
    status: string;
    [key: string]: any;
};

export default function Index({ auth, payrolls, employees, filters, hasRecords }: Props) {
    const { t } = useTranslation('PayrollManagement');

        // Check for admin role using the same pattern as LeaveManagement
    const hasRole = auth.hasRole || (auth.user && auth.user.roles) || [];
    const isAdmin = Array.isArray(hasRole) &&
        hasRole.some((role) => role && (role === 'admin' || role === 'Admin' || role.name === 'admin' || role.name === 'Admin'));



    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        month: new Date().toISOString().slice(0, 7),
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedPayrolls, setSelectedPayrolls] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('payroll.generate-monthly'), formData, {
            onSuccess: () => {
                setShowModal(false);
                setProcessing(false);
            },
            onError: (errors) => {
                console.error('Payroll generation error:', errors);
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('payroll.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const handleSelectPayroll = (payrollId: number, checked: boolean) => {
        console.log('Selecting payroll:', payrollId, 'checked:', checked);
        if (checked) {
            setSelectedPayrolls(prev => {
                const newSelection = [...prev, payrollId];
                console.log('New selection:', newSelection);
                return newSelection;
            });
        } else {
            setSelectedPayrolls(prev => {
                const newSelection = prev.filter(id => id !== payrollId);
                console.log('New selection:', newSelection);
                return newSelection;
            });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        console.log('Select all:', checked);
        if (checked) {
            setSelectedPayrolls(payrolls.data.map(payroll => payroll.id));
        } else {
            setSelectedPayrolls([]);
        }
    };

        const handleBulkDelete = () => {
        if (selectedPayrolls.length === 0) return;

        setBulkDeleteProcessing(true);
        router.post(route('payroll.bulk-delete'), { payroll_ids: selectedPayrolls }, {
            onSuccess: () => {
                setSelectedPayrolls([]);
                setShowBulkDeleteModal(false);
                setBulkDeleteProcessing(false);
                toast.success(`Successfully deleted ${selectedPayrolls.length} payroll record(s)`);
            },
            onError: (errors) => {
                console.error('Bulk delete error:', errors);
                setBulkDeleteProcessing(false);
                toast.error('Failed to delete payroll records. Please try again.');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            paid: 'default',
            cancelled: 'destructive',
        };

        return <Badge variant={variants[status] || 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const filteredEmployees = employees?.filter((employee) => employee.id != null && employee.name && employee.name !== '');
    console.log('Filtered Employees for Select:', filteredEmployees);
    const validEmployees = Array.isArray(filteredEmployees)
        ? filteredEmployees.filter((e) => typeof e.id === 'number' && !isNaN(e.id) && e.name && typeof e.name === 'string' && e.name.trim() !== '')
        : [];
    console.log('Valid Employees for Select:', validEmployees);

    const hasInvalidOriginalEmployee =
        Array.isArray(employees) &&
        employees.some((e) => typeof e.id !== 'number' || isNaN(e.id) || !e.name || typeof e.name !== 'string' || e.name.trim() === '');

    console.log('Employees for Select:', employees);

    return (
        <AppLayout title="Payroll Management" breadcrumbs={[{ title: 'Payroll', href: route('payroll.index') }]} requiredPermission="payroll.view">
            <Head title="Payroll Management" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payroll Management</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowModal(true)}>Process Payroll</Button>
                            <Button variant="outline" onClick={() => router.post(route('payroll.generate-monthly'))}>
                                Generate Monthly
                            </Button>

                                                                                    {isAdmin && (
                                <>
                                    {selectedPayrolls.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowBulkDeleteModal(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Selected ({selectedPayrolls.length})
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex gap-4">
                                <Input
                                    type="month"
                                    value={filters.month || ''}
                                    onChange={(e) => handleFilter('month', e.target.value)}
                                    className="w-48"
                                />
                                <Select value={filters.status || ''} onValueChange={(value) => handleFilter('status', value)}>
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
                                <Select value={filters.employee_id?.toString() || ''} onValueChange={(value) => handleFilter('employee_id', value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    {hasInvalidOriginalEmployee ? (
                                        <div style={{ color: 'red', padding: 8 }}>
                                            Invalid employee data detected. Please copy the following and send to support:
                                            <br />
                                            <pre
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-all',
                                                    background: '#fee',
                                                    color: '#a00',
                                                    padding: 8,
                                                    borderRadius: 4,
                                                }}
                                            >
                                                {JSON.stringify(employees, null, 2)}
                                            </pre>
                                        </div>
                                    ) : (
                                        <SelectContent>
                                            {employees
                                                .filter((e) => e.id && typeof e.id === 'number' && e.name && e.name.trim() !== '')
                                                .map((e) => {
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
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={selectedPayrolls.length === payrolls.data.length && payrolls.data.length > 0}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            onClick={(e) => console.log('Select all clicked:', e.target.checked)}
                                                            className="h-4 w-4 cursor-pointer"
                                                        />
                                                    </div>
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Base Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Overtime
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bonus
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deductions
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Final Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {hasRecords && payrolls?.data?.length > 0 ? (
                                        payrolls.data.map((payroll) => (
                                            <tr key={payroll.id} className="align-top">
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex items-center justify-center">
                                                            <Checkbox
                                                                checked={selectedPayrolls.includes(payroll.id)}
                                                                onChange={(e) => handleSelectPayroll(payroll.id, e.target.checked)}
                                                                onClick={(e) => console.log('Checkbox clicked:', payroll.id, e.target.checked)}
                                                                className="h-4 w-4 cursor-pointer"
                                                            />
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {payroll.employee.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            ID: {payroll.employee.id}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {(() => {
                                                                    try {
                                                                        const date = new Date(payroll.year, payroll.month - 1);
                                                                        return format(date, 'MMM yyyy');
                                                                    } catch (error) {
                                                                        console.error('Date formatting error:', error, 'Month:', payroll.month, 'Year:', payroll.year);
                                                                        return `${payroll.month}/${payroll.year}`;
                                                                    }
                                                                })()}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Month {payroll.month}, {payroll.year}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Banknote className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                ${(Number(payroll.base_salary) || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Base
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                ${(Number(payroll.overtime_amount) || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Extra
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                ${(Number(payroll.bonus_amount) || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Bonus
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                                            <span className="font-medium text-red-600">
                                                                ${((Number(payroll.deduction_amount) || 0) + (Number(payroll.advance_deduction) || 0)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Deductions
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-green-500" />
                                                            <span className="font-medium text-green-600">
                                                                ${(Number(payroll.final_amount) || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-6">
                                                            Net
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        {getStatusBadge(payroll.status)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.get(route('payroll.show', { payroll: payroll.id }))}
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 10 : 9} className="py-8 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <p>No payroll records found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination - Always show if there are payrolls */}
                        {payrolls?.data && payrolls.data.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {payrolls?.meta?.from || 1} to {payrolls?.meta?.to || payrolls.data.length} of{' '}
                                        {payrolls?.meta?.total || payrolls.data.length} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {payrolls?.meta?.current_page || 1} of {payrolls?.meta?.last_page || 1}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Page Navigation */}
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!payrolls?.links?.prev}
                                                onClick={() => payrolls.links?.prev && router.get(payrolls.links.prev)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!payrolls?.links?.next}
                                                onClick={() => payrolls.links?.next && router.get(payrolls.links.next)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
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
                        <DialogDescription>Select the month for which you want to generate payroll records.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="month">Select Month</Label>
                                <Input
                                    type="month"
                                    id="month"
                                    value={formData.month}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
                                    required
                                />
                                {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Generate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Modal */}
            <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedPayrolls.length} selected payroll record(s)?
                            This action cannot be undone and will only delete unpaid payrolls.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowBulkDeleteModal(false)}
                            disabled={bulkDeleteProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={bulkDeleteProcessing}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            {bulkDeleteProcessing ? 'Deleting...' : 'Delete Selected'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
