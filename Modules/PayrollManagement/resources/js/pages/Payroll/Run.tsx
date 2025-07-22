import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Core/layouts/AppLayout';



import { formatCurrency } from '@/Core/utils/format';
import { formatDate } from '@/Core/utils/dateFormatter';
import {
    Calendar,
    Users,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Eye
} from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core/components/ui';

interface Props {
    payrollRun: {
        id: number;
        batch_id: string;
        run_by: number;
        status: string;
        total_employees: number;
        run_date: string;
        created_at: string;
        updated_at: string;
        notes?: string;
    };
    payrolls: Array<{
        id: number;
        employee: {
            id: number;
            name: string;
        };
        month: number;
        year: number;
        base_salary: number;
        overtime_amount: number;
        bonus_amount: number;
        deduction_amount: number;
        final_amount: number;
        status: string;
        created_at: string;
    }>;
}

export default function Run({ payrollRun, payrolls }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'completed':
                return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPayrollStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'approved':
                return <Badge variant="default">Approved</Badge>;
            case 'paid':
                return <Badge variant="default">Paid</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

            const totalAmount = payrolls.reduce((sum, payroll) => {
        // Handle decimal strings from Laravel's decimal casting
        let amount = 0;
        if (payroll.final_amount !== null && payroll.final_amount !== undefined) {
            if (typeof payroll.final_amount === 'string') {
                amount = parseFloat(String(payroll.final_amount).replace(/[^\d.-]/g, '')) || 0;
            } else if (typeof payroll.final_amount === 'number') {
                amount = payroll.final_amount;
            }
                }
        return sum + amount;
    }, 0);
    const approvedCount = payrolls.filter(p => p.status === 'approved').length;
    const paidCount = payrolls.filter(p => p.status === 'paid').length;

    return (
        <AppLayout>
            <Head title="Payroll Run Details" />

            <div className="py-6">
                <div className="w-full px-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Payroll Run Details</h1>
                        <p className="text-gray-600">Batch ID: {payrollRun.batch_id}</p>
                    </div>

                    {/* Run Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Run Date</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatDate(payrollRun.run_date)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(payrollRun.created_at)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{payrollRun.total_employees}</div>
                                <p className="text-xs text-muted-foreground">
                                    Processed in this run
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {approvedCount} approved, {paidCount} paid
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Run Status</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getStatusBadge(payrollRun.status)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {payrolls.length} payrolls generated
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                                        {/* Payrolls Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Payrolls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payrolls.map((payroll) => (
                                            <tr key={payroll.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {payroll.employee.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(payroll.base_salary)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(payroll.overtime_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(payroll.bonus_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(payroll.deduction_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {formatCurrency(payroll.final_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPayrollStatusBadge(payroll.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex space-x-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/hr/payroll/${payroll.id}`, '_blank')}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/hr/payroll/${payroll.id}/payslip/view`, '_blank')}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View Payslip
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/hr/payroll/${payroll.id}/payslip`, '_blank')}
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            Download PDF
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {payrolls.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No payrolls found for this run.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Run Actions */}
                    <div className="mt-6 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Back to Payrolls
                        </Button>

                        <div className="flex space-x-2">
                            {payrollRun.status === 'pending' && (
                                <>
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            // Approve payroll run
                                            if (confirm('Are you sure you want to approve this payroll run?')) {
                                                // Handle approval
                                            }
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve Run
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            // Reject payroll run
                                            if (confirm('Are you sure you want to reject this payroll run?')) {
                                                // Handle rejection
                                            }
                                        }}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject Run
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
