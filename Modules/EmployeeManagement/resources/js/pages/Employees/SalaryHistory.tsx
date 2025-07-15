import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Badge } from "@/Core";
import { format } from 'date-fns';
import { AppLayout, Button } from '@/Core';

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
  const { t } = useTranslation('employees');

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
        { title: 'Employees', href: '/employees' },
        { title: 'Salary History', href: '#' }
    ];

    return (
        <AppLayout title="Salary History" breadcrumbs={breadcrumbs} requiredPermission="employees.view">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('lbl_salary_history')}</h1>
                <a href="/employees">
                    <Button variant="outline" size="sm">{t('btn_back')}</Button>
                </a>
            </div>
            <div className="rounded-md border w-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('lbl_month')}</TableHead>
                            <TableHead>{t('lbl_basic_salary')}</TableHead>
                            <TableHead>{t('lbl_allowances')}</TableHead>
                            <TableHead>{t('lbl_overtime')}</TableHead>
                            <TableHead>{t('lbl_deductions')}</TableHead>
                            <TableHead>{t('lbl_net_salary')}</TableHead>
                            <TableHead>{t('lbl_status')}</TableHead>
                            <TableHead>{t('lbl_paid_date')}</TableHead>
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
                                    {t('msg_no_salary_records_found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
















