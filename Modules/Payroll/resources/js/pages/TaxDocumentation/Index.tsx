import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from "@/types";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    FileText,
    Download,
    Eye,
    Plus,
    Filter,
    Users,
    DollarSign,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';

interface Employee {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
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
    status: 'draft' | 'generated' | 'sent' | 'archived';
    generated_at: string;
    employee: Employee;
}

interface TaxSummary {
    total_documents: number;
    total_gross_income: number;
    total_tax_withheld: number;
    total_net_income: number;
    average_tax_rate: number;
}

interface Props extends PageProps {
    taxDocuments: {
        data: TaxDocument[];
        links: any;
    };
    employees: Employee[];
    summary: TaxSummary;
    filters: {
        year: number;
        employee_id?: number;
    };
    availableYears: number[];
}

export default function Index({
    taxDocuments,
    employees,
    summary,
    filters,
    availableYears
}: Props) {
  const { t } = useTranslation('payroll');

    const [selectedYear, setSelectedYear] = useState(filters.year?.toString() || '');
    const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id?.toString() || '');
    const [showBulkDialog, setShowBulkDialog] = useState(false);
    const [bulkYear, setBulkYear] = useState(new Date().getFullYear().toString());
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    const handleFilter = () => {
        const params: any = {};
        if (selectedYear) params.year = selectedYear;
        if (selectedEmployee) params.employee_id = selectedEmployee;

        router.get(route('payroll.tax-documentation.index'), params);
    };

    const handleClearFilters = () => {
        setSelectedYear('');
        setSelectedEmployee('');
        router.get(route('payroll.tax-documentation.index'));
    };

    const handleGenerate = (employeeId: number, year: number) => {
        router.post(route('payroll.tax-documentation.generate'), {
            employee_id: employeeId,
            tax_year: year,
        });
    };

    const handleBulkGenerate = () => {
        router.post(route('payroll.tax-documentation.bulk-generate'), {
            tax_year: parseInt(bulkYear),
            employee_ids: selectedEmployees.length > 0 ? selectedEmployees.map(id => parseInt(id)) : undefined,
        });
        setShowBulkDialog(false);
        setSelectedEmployees([]);
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        params.append('tax_year', selectedYear || filters.year.toString());
        if (selectedEmployee) params.append('employee_id', selectedEmployee);

        window.open(route('payroll.tax-documentation.export') + '?' + params.toString());
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(amount);
    };

    return (
        <AdminLayout>
            <Head title={t('tax_documentation')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('tax_documentation')}</h1>
                        <p className="text-gray-600">{t('generate_and_manage_annual_tax_documents_for_emplo')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Bulk Generate
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('ttl_bulk_generate_tax_documents')}</DialogTitle>
                                    <DialogDescription>
                                        Generate tax documents for multiple employees for a specific year.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="bulk-year">{t('lbl_tax_year')}</Label>
                                        <Select value={bulkYear} onValueChange={setBulkYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ph_select_year')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableYears.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Employees (leave empty for all active employees)</Label>
                                        <Select
                                            value={selectedEmployees.join(',')}
                                            onValueChange={(value) => setSelectedEmployees(value ? value.split(',') : [])}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ph_select_employees_optional')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        {employee.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleBulkGenerate}>
                                        Generate Documents
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_documents')}</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_documents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('total_gross_income')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_gross_income)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_tax_withheld')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_tax_withheld)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_average_tax_rate')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.average_tax_rate?.toFixed(2)}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="year-filter">{t('lbl_tax_year')}</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('ph_select_year')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="employee-filter">Employee</Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_employees')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">{t('opt_all_employees')}</SelectItem>
                                        {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                                {employee.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Documents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_tax_documents')}</CardTitle>
                        <CardDescription>
                            Manage tax documents for employees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document #</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>{t('lbl_tax_year')}</TableHead>
                                    <TableHead>{t('th_gross_income')}</TableHead>
                                    <TableHead>{t('th_tax_withheld')}</TableHead>
                                    <TableHead>{t('th_net_income')}</TableHead>
                                    <TableHead>{t('th_tax_rate')}</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Generated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxDocuments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                                <p className="text-gray-500">{t('no_tax_documents_found')}</p>
                                                <p className="text-sm text-gray-400">
                                                    Generate tax documents to get started
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    taxDocuments.data.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell className="font-medium">
                                                {document.document_number}
                                            </TableCell>
                                            <TableCell>{document.employee.name}</TableCell>
                                            <TableCell>{document.tax_year}</TableCell>
                                            <TableCell>{formatCurrency(document.gross_income)}</TableCell>
                                            <TableCell>{formatCurrency(document.tax_withheld)}</TableCell>
                                            <TableCell>{formatCurrency(document.net_income)}</TableCell>
                                            <TableCell>{document.effective_tax_rate.toFixed(2)}%</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(document.status)}>
                                                    {document.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {document.generated_at ?
                                                    format(new Date(document.generated_at), 'MMM dd, yyyy') :
                                                    '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('payroll.tax-documentation.show', document.id)}
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={route('payroll.tax-documentation.download', document.id)}
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {document.status === 'draft' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleGenerate(document.employee_id, document.tax_year)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {taxDocuments.links && (
                            <div className="flex justify-center mt-4">
                                {/* Add pagination component here if needed */}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}














