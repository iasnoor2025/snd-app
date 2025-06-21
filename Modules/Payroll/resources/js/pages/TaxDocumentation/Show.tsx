import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from "@/Core/types";
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import { Badge } from "@/Core";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Core";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Separator } from "@/Core";
import {
    ArrowLeft,
    Download,
    FileText,
    User,
    Calendar,
    DollarSign,
    TrendingUp,
    Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';

interface Employee {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    employee_id?: string;
}

interface Payroll {
    id: number;
    payroll_month: string;
    base_salary: number;
    overtime_amount: number;
    bonus_amount: number;
    final_amount: number;
    deduction_amount: number;
}

interface MonthlyBreakdown {
    month: string;
    gross_income: number;
    tax_withheld: number;
    net_income: number;
    overtime: number;
    bonus: number;
}

interface TaxDocument {
    id: number;
    employee_id: number;
    tax_year: number;
    document_number: string;
    gross_income: number;
    tax_withheld: number;
    net_income: number;
    effective_tax_rate: number;
    total_deductions: number;
    overtime_income: number;
    bonus_income: number;
    other_income: number;
    insurance_deductions: number;
    advance_deductions: number;
    other_deductions: number;
    status: 'draft' | 'generated' | 'sent' | 'archived';
    generated_at: string;
    notes?: string;
    employee: Employee;
    payrolls: Payroll[];
    monthly_breakdown: MonthlyBreakdown[];
}

interface Props extends PageProps {
    taxDocument: TaxDocument;
}

export default function Show({ taxDocument }: Props) {
  const { t } = useTranslation('payroll');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'generated': return 'bg-blue-100 text-blue-800';
            case 'sent': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const incomeBreakdown = [
        {
            label: 'Base Salary',
            amount: taxDocument.gross_income - taxDocument.overtime_income - taxDocument.bonus_income - taxDocument.other_income,
            percentage: ((taxDocument.gross_income - taxDocument.overtime_income - taxDocument.bonus_income - taxDocument.other_income) / taxDocument.gross_income) * 100
        },
        {
            label: 'Overtime',
            amount: taxDocument.overtime_income,
            percentage: (taxDocument.overtime_income / taxDocument.gross_income) * 100
        },
        {
            label: 'Bonus',
            amount: taxDocument.bonus_income,
            percentage: (taxDocument.bonus_income / taxDocument.gross_income) * 100
        },
        {
            label: 'Other Income',
            amount: taxDocument.other_income,
            percentage: (taxDocument.other_income / taxDocument.gross_income) * 100
        }
    ];

    const deductionBreakdown = [
        {
            label: 'Tax Withheld',
            amount: taxDocument.tax_withheld,
            percentage: (taxDocument.tax_withheld / taxDocument.total_deductions) * 100
        },
        {
            label: 'Insurance',
            amount: taxDocument.insurance_deductions,
            percentage: (taxDocument.insurance_deductions / taxDocument.total_deductions) * 100
        },
        {
            label: 'Advance Deductions',
            amount: taxDocument.advance_deductions,
            percentage: (taxDocument.advance_deductions / taxDocument.total_deductions) * 100
        },
        {
            label: 'Other Deductions',
            amount: taxDocument.other_deductions,
            percentage: (taxDocument.other_deductions / taxDocument.total_deductions) * 100
        }
    ];

    return (
        <AppLayout>
            <Head title={`Tax Document - ${taxDocument.document_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('payroll.tax-documentation.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tax Document {taxDocument.document_number}
                            </h1>
                            <p className="text-gray-600">
                                {taxDocument.employee.name} - Tax Year {taxDocument.tax_year}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge className={getStatusColor(taxDocument.status)}>
                            {taxDocument.status}
                        </Badge>
                        <Link href={route('payroll.tax-documentation.download', taxDocument.id)}>
                            <Button>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Employee Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('employee_information')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('employee_name')}</p>
                                <p className="text-lg font-semibold">{taxDocument.employee.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('employee_id')}</p>
                                <p className="text-lg font-semibold">{taxDocument.employee.employee_id || taxDocument.employee.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('lbl_tax_year')}</p>
                                <p className="text-lg font-semibold">{taxDocument.tax_year}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('th_gross_income')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(taxDocument.gross_income)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('th_tax_withheld')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(taxDocument.tax_withheld)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('th_net_income')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(taxDocument.net_income)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_effective_tax_rate')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{taxDocument.effective_tax_rate.toFixed(2)}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Income and Deduction Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_income_breakdown')}</CardTitle>
                            <CardDescription>{t('detailed_breakdown_of_income_sources')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {incomeBreakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}% of total</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between items-center font-bold">
                                    <p>{t('total_gross_income')}</p>
                                    <p>{formatCurrency(taxDocument.gross_income)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deduction Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_deduction_breakdown')}</CardTitle>
                            <CardDescription>{t('detailed_breakdown_of_deductions')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {deductionBreakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}% of total</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between items-center font-bold">
                                    <p>{t('total_deductions')}</p>
                                    <p>{formatCurrency(taxDocument.total_deductions)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Breakdown */}
                {taxDocument.monthly_breakdown && taxDocument.monthly_breakdown.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Monthly Breakdown
                            </CardTitle>
                            <CardDescription>Month-by-month income and tax details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>{t('th_gross_income')}</TableHead>
                                        <TableHead>{t('th_tax_withheld')}</TableHead>
                                        <TableHead>{t('th_net_income')}</TableHead>
                                        <TableHead>Overtime</TableHead>
                                        <TableHead>Bonus</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxDocument.monthly_breakdown.map((month, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {format(new Date(month.month + '-01'), 'MMM yyyy')}
                                            </TableCell>
                                            <TableCell>{formatCurrency(month.gross_income)}</TableCell>
                                            <TableCell>{formatCurrency(month.tax_withheld)}</TableCell>
                                            <TableCell>{formatCurrency(month.net_income)}</TableCell>
                                            <TableCell>{formatCurrency(month.overtime)}</TableCell>
                                            <TableCell>{formatCurrency(month.bonus)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Associated Payrolls */}
                {taxDocument.payrolls && taxDocument.payrolls.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Associated Payrolls
                            </CardTitle>
                            <CardDescription>{t('payroll_records_included_in_this_tax_document')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('lbl_payroll_month')}</TableHead>
                                        <TableHead>{t('base_salary')}</TableHead>
                                        <TableHead>Overtime</TableHead>
                                        <TableHead>Bonus</TableHead>
                                        <TableHead>Deductions</TableHead>
                                        <TableHead>{t('final_amount')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {taxDocument.payrolls.map((payroll) => (
                                        <TableRow key={payroll.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(payroll.payroll_month + '-01'), 'MMM yyyy')}
                                            </TableCell>
                                            <TableCell>{formatCurrency(payroll.base_salary)}</TableCell>
                                            <TableCell>{formatCurrency(payroll.overtime_amount)}</TableCell>
                                            <TableCell>{formatCurrency(payroll.bonus_amount)}</TableCell>
                                            <TableCell>{formatCurrency(payroll.deduction_amount)}</TableCell>
                                            <TableCell>{formatCurrency(payroll.final_amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Document Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Document Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('document_number')}</p>
                                <p className="text-lg font-semibold">{taxDocument.document_number}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{t('generated_date')}</p>
                                <p className="text-lg font-semibold">
                                    {taxDocument.generated_at ?
                                        format(new Date(taxDocument.generated_at), 'MMM dd, yyyy HH:mm') :
                                        'Not generated'
                                    }
                                </p>
                            </div>
                            {taxDocument.notes && (
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Notes</p>
                                    <p className="text-lg">{taxDocument.notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}














