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
    usePermission,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Banknote, Calendar, User, TrendingUp, TrendingDown, DollarSign, Trash2, Search, Printer } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
        per_page?: string;
    };
    hasRecords: boolean;
}

// Inline type definitions for Payroll and Employee

type Employee = {
    id: number;
    name: string;
    file_number?: string;
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
    advance_deduction?: number;
    final_amount: number;
    status: string;
    [key: string]: any;
};

export default function Index({ auth, payrolls, employees, filters, hasRecords }: Props) {
    const { t } = useTranslation('PayrollManagement');
    const [showModal, setShowModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [processing, setProcessing] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [printAllProcessing, setPrintAllProcessing] = useState(false);
    const [selectedPayrolls, setSelectedPayrolls] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        month: new Date().toISOString().slice(0, 7),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check for admin role using the same pattern as LeaveManagement
    const hasRole = auth.hasRole || (auth.user && auth.user.roles) || [];
    const isAdmin = Array.isArray(hasRole) &&
        hasRole.some((role) => role && (role === 'admin' || role === 'Admin' || role.name === 'admin' || role.name === 'Admin'));

    // Debug: Log payrolls data when it changes
    useEffect(() => {
        console.log('Payrolls data updated:', payrolls);
        console.log('Payrolls meta:', payrolls?.meta);
        console.log('Per page value:', payrolls?.meta?.per_page);
    }, [payrolls]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            console.log('Process Payroll form submitted');
            console.log('Form data:', formData);

            // Validate form data
            if (!formData.employee_id) {
                setErrors({ employee_id: 'Please select an employee' });
                setProcessing(false);
                return;
            }

            if (!formData.month) {
                setErrors({ month: 'Please select a month' });
                setProcessing(false);
                return;
            }

            // Use individual payroll generation route
            const routeUrl = '/hr/payroll';
            console.log('Route URL:', routeUrl);

            router.post(routeUrl, {
                ...formData,
                _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }, {
                onSuccess: (response) => {
                    console.log('Payroll generation successful');
                    setShowModal(false);
                    setProcessing(false);
                    toast.success('Payroll generated successfully');

                    // Redirect to the generated payroll if available
                    if (response && response.data && response.data.id) {
                        router.visit(`/hr/payroll/${response.data.id}`);
                    } else {
                        // Reload the page to show new payrolls
                        window.location.reload();
                    }
            },
            onError: (errors) => {
                    console.error('Payroll generation error:', errors);
                setErrors(errors);
                setProcessing(false);
                    toast.error('Failed to generate payroll: ' + (errors.message || 'Unknown error'));
            },
        });
        } catch (error: any) {
            console.error('Form submission error:', error);
            setProcessing(false);
            setErrors({ general: 'Button error: ' + error.message });
            toast.error('Form error: ' + error.message);
        }
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
    // console.log('Filtered Employees for Select:', filteredEmployees);
    const validEmployees = Array.isArray(filteredEmployees)
        ? filteredEmployees.filter((e) => typeof e.id === 'number' && !isNaN(e.id) && e.name && typeof e.name === 'string' && e.name.trim() !== '')
        : [];
    // console.log('Valid Employees for Select:', validEmployees);

    const hasInvalidOriginalEmployee =
        Array.isArray(employees) &&
        employees.some((e) => typeof e.id !== 'number' || isNaN(e.id) || !e.name || typeof e.name !== 'string' || e.name.trim() === '');

    // console.log('Employees for Select:', employees);

    const handleGeneratePayroll = async () => {
        try {
            setIsGenerating(true);
            setShowConfirmDialog(false);

            // Use the simple payroll generation route
            const routeUrl = route('payroll.generate-payroll');
            console.log('Route URL:', routeUrl);

            // Show loading state
            toast.info('Generating payroll for employees with approved timesheets...');

            // Use regular fetch instead of Inertia router
            const response = await fetch(routeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Payroll generation successful:', data);

            // Show detailed results
            let message = data.message || 'Payroll generation completed';
            if (data.data) {
                const result = data.data;
                message = `Generated: ${result.total_generated} payrolls\n`;
                message += `Processed employees: ${result.total_processed_employees}\n`;
                message += `Skipped employees: ${result.total_skipped_employees}\n`;
                message += `Errors: ${result.total_errors}`;

                if (result.processed_employees && result.processed_employees.length > 0) {
                    message += `\n\nProcessed: ${result.processed_employees.join(', ')}`;
                }
            }

            toast.success(message);
            // Reload the page to show new payrolls
            window.location.reload();
        } catch (error: any) {
            console.error('Payroll generation error:', error);
            toast.error('Failed to generate payroll: ' + (error.message || 'Unknown error'));
        } finally {
            setIsGenerating(false);
        }
    };

        const handlePrintAllPayslips = async () => {
        try {
            setPrintAllProcessing(true);

            // Get all payroll IDs from the current page
            const payrollIds = payrolls.data.map(payroll => payroll.id);

            if (payrollIds.length === 0) {
                toast.error('No payrolls to print');
                return;
            }

            toast.info(`Generating PDF with ${payrollIds.length} payslips...`);

            // Create a single PDF with all payslips
            const response = await fetch(route('payroll.payslip.bulk-pdf'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/pdf'
                },
                body: JSON.stringify({
                    payroll_ids: payrollIds
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get the PDF blob
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all_payslips_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`PDF generated successfully with ${payrollIds.length} payslips`);
        } catch (error: any) {
            console.error('Print all payslips error:', error);
            toast.error('Failed to generate PDF: ' + (error.message || 'Unknown error'));
        } finally {
            setPrintAllProcessing(false);
        }
    };

    return (
        <AppLayout title="Payroll Management" breadcrumbs={[{ title: 'Payroll', href: route('payroll.index') }]} requiredPermission="payroll.view">
            <Head title="Payroll Management" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payroll Management</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowModal(true)}>Process Payroll</Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Payroll'}
                            </Button>
                            {hasRecords && payrolls?.data?.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrintAllPayslips}
                                    disabled={printAllProcessing}
                                    className="flex items-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    {printAllProcessing ? 'Generating PDF...' : 'Download All Payslips PDF'}
                                </Button>
                            )}
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
                                            {/* Search Input */}
                                            <div className="flex items-center px-3 py-2">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <Input
                                                    placeholder="Search by name or file number..."
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                            </div>
                                            {/* Filtered Employees */}
                                            {employees
                                                .filter((e) => e.id && typeof e.id === 'number' && e.name && e.name.trim() !== '')
                                                .filter((e) => {
                                                    if (!employeeSearch) return true;
                                                    const searchLower = employeeSearch.toLowerCase();
                                                    return (
                                                        e.name.toLowerCase().includes(searchLower) ||
                                                        (e.file_number && e.file_number.toLowerCase().includes(searchLower))
                                                    );
                                                })
                                                .map((e) => {
                                                    const value = e.id.toString();
                                                    if (!value) {
                                                        console.error('Invalid employee id:', e);
                                                        return null;
                                                    }
                                                    return (
                                                        <SelectItem key={e.id} value={value}>
                                                            {e.name} {e.file_number ? `(${e.file_number})` : ''}
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
                                                        <div className="flex flex-col gap-1 ml-6">
                                                            <span className="text-xs text-muted-foreground">
                                                                ID: {payroll.employee.id}
                                                            </span>
                                                            {payroll.employee.file_number && (
                                                                <span className="text-xs text-blue-600 font-medium">
                                                                    File: {payroll.employee.file_number}
                                                                </span>
                                                            )}
                                                        </div>
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
                                                                SAR {(Number(payroll.base_salary) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                                SAR {(Number(payroll.overtime_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                                SAR {(Number(payroll.bonus_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                            <DollarSign className="h-4 w-4 text-green-500" />
                                                            <span className="font-medium text-green-600">
                                                                SAR {(Number(payroll.final_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.get(route('payroll.payslip.view', { payroll: payroll.id }))}
                                                        >
                                                            Payslip
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 9 : 8} className="py-8 text-center">
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
                                        Showing {payrolls?.from || 1} to {payrolls?.to || payrolls.data.length} of{' '}
                                        {payrolls?.total || payrolls.data.length} results
                                        {payrolls?.last_page > 1 && (
                                            <div className="mt-1 text-xs opacity-60">
                                                Page {payrolls?.current_page || 1} of {payrolls?.last_page || 1}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select
                                                value={payrolls?.per_page?.toString() || "10"}
                                                // Debug: Log the current per_page value
                                                onOpenChange={(open) => {
                                                    if (open) {
                                                        console.log('Current per_page:', payrolls?.per_page);
                                                        console.log('Full payrolls object:', payrolls);
                                                    }
                                                }}
                                                onValueChange={(value) => {
                                                    console.log('Changing per_page to:', value);
                                                    router.get(
                                                        route('payroll.index'),
                                                        {
                                                            per_page: value,
                                                            month: filters.month,
                                                            status: filters.status,
                                                            employee_id: filters.employee_id,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                            replace: true
                                                        },
                                                    );
                                                }}
                                            >
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="15">15</SelectItem>
                                                    <SelectItem value="25">25</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                    <SelectItem value="100">100</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Page Navigation - Only show if more than one page */}
                                        {payrolls?.last_page > 1 && (
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!payrolls?.current_page || payrolls.current_page === 1}
                                                    onClick={() => {
                                                        const currentPage = payrolls?.current_page || 1;
                                                        if (currentPage > 1) {
                                                            router.get(
                                                                route('payroll.index'),
                                                                {
                                                                    page: currentPage - 1,
                                                                    per_page: payrolls?.per_page || 10,
                                                                    month: filters.month,
                                                                    status: filters.status,
                                                                    employee_id: filters.employee_id,
                                                                },
                                                                { preserveState: true, preserveScroll: true },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Previous
                                                </Button>

                                                {/* Page Numbers */}
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, payrolls?.last_page || 1) }, (_, i) => {
                                                        let pageNumber;
                                                        const lastPage = payrolls?.last_page || 1;
                                                        const currentPage = payrolls?.current_page || 1;

                                                        if (lastPage <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (currentPage <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (currentPage >= lastPage - 2) {
                                                                pageNumber = lastPage - 4 + i;
                                                            } else {
                                                                pageNumber = currentPage - 2 + i;
                                                            }
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === currentPage ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => {
                                                                    router.get(
                                                                        route('payroll.index'),
                                                                        {
                                                                            page: pageNumber,
                                                                            per_page: payrolls?.per_page || 10,
                                                                            month: filters.month,
                                                                            status: filters.status,
                                                                            employee_id: filters.employee_id,
                                                                        },
                                                                        { preserveState: true, preserveScroll: true },
                                                                    );
                                                                }}
                                                            >
                                                                {pageNumber}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        !payrolls?.current_page ||
                                                        !payrolls?.last_page ||
                                                        payrolls.current_page >= payrolls.last_page
                                                    }
                                                    onClick={() => {
                                                        const currentPage = payrolls?.current_page || 1;
                                                        const lastPage = payrolls?.last_page || 1;
                                                        if (currentPage < lastPage) {
                                                            router.get(
                                                                route('payroll.index'),
                                                                {
                                                                    page: currentPage + 1,
                                                                    per_page: payrolls?.per_page || 10,
                                                                    month: filters.month,
                                                                    status: filters.status,
                                                                    employee_id: filters.employee_id,
                                                                },
                                                                { preserveState: true, preserveScroll: true },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => {
                setShowModal(open);
                if (!open) {
                    setEmployeeSearch('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Payroll</DialogTitle>
                        <DialogDescription>Select an employee and month to generate payroll.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="employee">Select Employee</Label>
                                <Select
                                    value={formData.employee_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, employee_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Search Input */}
                                        <div className="flex items-center px-3 py-2">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <Input
                                                placeholder="Search by name or file number..."
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                        </div>
                                        {/* Filtered Employees */}
                                        {employees
                                            .filter((e) => e.id && typeof e.id === 'number' && e.name && e.name.trim() !== '')
                                            .filter((e) => {
                                                if (!employeeSearch) return true;
                                                const searchLower = employeeSearch.toLowerCase();
                                                return (
                                                    e.name.toLowerCase().includes(searchLower) ||
                                                    (e.file_number && e.file_number.toLowerCase().includes(searchLower))
                                                );
                                            })
                                            .map((e) => (
                                                <SelectItem key={e.id} value={e.id.toString()}>
                                                    {e.name} {e.file_number ? `(${e.file_number})` : ''}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                            </div>
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

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Payroll</DialogTitle>
                        <DialogDescription>
                            This will generate payroll for all employees who have approved timesheets for any month in the last 12 months (including current month).
                            The system will automatically skip employees who already have payroll generated for those months.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGeneratePayroll}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Payroll'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
