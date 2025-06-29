import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/Modules/PayrollManagement/resources/js/types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { format } from 'date-fns';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useToast } from "@/Core";
import { Badge } from "@/Core";
import { Separator } from "@/Core";
import { Alert, AlertDescription } from "@/Core";
import { AlertCircle } from 'lucide-react';

interface Props extends PageProps {
    settlement: {
        id: number;
        employee: {
            id: number;
            employee_id: string;
            first_name: string;
            last_name: string;
            basic_salary: number;
            leave_balance: number;
        };
        last_working_day: string;
        leave_encashment: number;
        unpaid_salary: number;
        unpaid_overtime: number;
        deductions: number;
        gratuity: number;
        total_payable: number;
        status: string;
        notes: string;
        agreement_terms: string;
        created_at: string;
        updated_at: string;
        approved_by?: {
            id: number;
            name: string;
        };
        approved_at?: string;
        completed_at?: string;
        deductions_list: Array<{
            type: string;
            description: string;
            amount: number;
            reference_number?: string;
            notes?: string;
        }>;
    };
}

export default function Show({ auth, settlement }: Props) {
  const { t } = useTranslation('payroll');

    const { toast } = useToast();

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(route('final-settlements.pdf', settlement.id), {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `final-settlement-${settlement.id}-${settlement.employee.employee_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download PDF. Please try again.');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            completed: 'default',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status}
            </Badge>
        );
    };

    return (
        <AppLayout title={t('ttl_final_settlement_details')} requiredPermission="final-settlements.view">
            <Head title={t('ttl_final_settlement_details')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('ttl_final_settlement_details')}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('employees.show', settlement.employee.id)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Employee
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('employee_information')}</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('employee_id')}</dt>
                                            <dd className="text-sm">{settlement.employee.employee_id}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">Name</dt>
                                            <dd className="text-sm">
                                                {settlement.employee.first_name} {settlement.employee.last_name}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('last_working_day')}</dt>
                                            <dd className="text-sm">
                                                {format(new Date(settlement.last_working_day), 'PPP')}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">Status</dt>
                                            <dd className="text-sm">{getStatusBadge(settlement.status)}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('settlement_details')}</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('leave_balance')}</dt>
                                            <dd className="text-sm">{settlement.employee.leave_balance} days</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('lbl_leave_encashment')}</dt>
                                            <dd className="text-sm">SAR {settlement.leave_encashment.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('lbl_unpaid_salary')}</dt>
                                            <dd className="text-sm">SAR {settlement.unpaid_salary.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('lbl_unpaid_overtime')}</dt>
                                            <dd className="text-sm">SAR {settlement.unpaid_overtime.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">Gratuity</dt>
                                            <dd className="text-sm">SAR {settlement.gratuity.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between border-b pb-2 font-semibold">
                                            <dt className="text-sm">{t('lbl_total_payable')}</dt>
                                            <dd className="text-sm">SAR {settlement.total_payable.toFixed(2)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {settlement.deductions_list.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">Deductions</h3>
                                    <div className="space-y-4">
                                        {settlement.deductions_list.map((deduction, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">Type</p>
                                                    <p className="text-sm">{deduction.type}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-sm font-medium">Description</p>
                                                    <p className="text-sm">{deduction.description}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Amount</p>
                                                    <p className="text-sm">SAR {deduction.amount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {settlement.notes && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                                    <p className="text-sm whitespace-pre-wrap">{settlement.notes}</p>
                                </div>
                            )}

                            {settlement.agreement_terms && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('agreement_terms')}</h3>
                                    <p className="text-sm whitespace-pre-wrap">{settlement.agreement_terms}</p>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">{t('settlement_timeline')}</h3>
                                <dl className="space-y-2">
                                    <div className="flex justify-between border-b pb-2">
                                        <dt className="text-sm font-medium">{t('created_at')}</dt>
                                        <dd className="text-sm">
                                            {format(new Date(settlement.created_at), 'PPP p')}
                                        </dd>
                                    </div>
                                    {settlement.approved_by && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('approved_by')}</dt>
                                            <dd className="text-sm">{settlement.approved_by.name}</dd>
                                        </div>
                                    )}
                                    {settlement.approved_at && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('approved_at')}</dt>
                                            <dd className="text-sm">
                                                {format(new Date(settlement.approved_at), 'PPP p')}
                                            </dd>
                                        </div>
                                    )}
                                    {settlement.completed_at && (
                                        <div className="flex justify-between border-b pb-2">
                                            <dt className="text-sm font-medium">{t('completed_at')}</dt>
                                            <dd className="text-sm">
                                                {format(new Date(settlement.completed_at), 'PPP p')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}














