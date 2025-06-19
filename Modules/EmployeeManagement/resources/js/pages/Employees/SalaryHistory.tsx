import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Modules/Core/resources/js/components/ui/table';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { format } from 'date-fns';
import { AdminLayout } from '@/Modules/Core/resources/js';

interface SalaryRecord {
    id: number;
    salary_month: string;
    basic_salary: number;
    food_allowance: number;
    housing_allowance: number;
    transport_allowance: number;
    overtime_amount: number;
    deductions: number;
    net_salary: number;
    status: 'pending' | 'approved' | 'paid';
    paid_date?: string;
    notes?: string;
}

interface Props {
    records?: SalaryRecord[];
}

export default function SalaryHistory({ records = [] }: Props) {
  const { t } = useTranslation('employee');

    const calculateTotal = (record: SalaryRecord) => {
        return (
            record.basic_salary +
            record.food_allowance +
            record.housing_allowance +
            record.transport_allowance +
            record.overtime_amount -
            record.deductions
        );
    };

    const breadcrumbs = [
        { label: 'Employees', href: '/employees' },
        { label: 'Salary History', href: '#' }
    ];

    return (
        <AdminLayout title="Salary History" breadcrumbs={breadcrumbs} requiredPermission="employees.view">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>{t('basic_salary')}</TableHead>
                            <TableHead>Allowances</TableHead>
                            <TableHead>Overtime</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>{t('th_net_salary')}</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>{t('th_paid_date')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>
                                    {format(new Date(record.salary_month), 'MMMM yyyy')}
                                </TableCell>
                                <TableCell>
                                    SAR {record.basic_salary.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm">
                                            Food: SAR {record.food_allowance.toFixed(2)}
                                        </div>
                                        <div className="text-sm">
                                            Housing: SAR {record.housing_allowance.toFixed(2)}
                                        </div>
                                        <div className="text-sm">
                                            Transport: SAR {record.transport_allowance.toFixed(2)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    SAR {record.overtime_amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    SAR {record.deductions.toFixed(2)}
                                </TableCell>
                                <TableCell className="font-medium">
                                    SAR {calculateTotal(record).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            record.status === 'paid'
                                                ? 'default'
                                                : record.status === 'approved'
                                                ? 'outline'
                                                : 'secondary'
                                        }
                                    >
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {record.paid_date
                                        ? format(new Date(record.paid_date), 'MMM dd, yyyy')
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No salary records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
















