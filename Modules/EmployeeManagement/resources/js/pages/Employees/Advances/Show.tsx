import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    ToastService,
} from '@/Core';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface User {
    id: number;
    name: string;
}

interface Advance {
    id: number;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    created_at: string;
    payment_date: string;
    repaid_amount: number;
    monthly_deduction: number;
    rejection_reason?: string;
    repayment_date?: string;
    approved_by?: number;
    approved_at?: string;
    rejected_by?: number;
    rejected_at?: string;
    approver?: User;
    rejecter?: User;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
}

// Minimal Props type for build
type Props = {
    employee: Employee;
    advance: Advance;
};

export default function Show({ employee, advance }: Props) {
    const { t } = useTranslation('employee');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Employees',
            href: '/employees',
        },
        {
            title: `${employee.first_name} ${employee.last_name}`,
            href: `/employees/${employee.id}`,
        },
        {
            title: 'Advances',
            href: `/employees/${employee.id}/advances`,
        },
        {
            title: `Advance #${advance.id}`,
            href: `/employees/${employee.id}/advances/${advance.id}`,
        },
    ];

    const handleDelete = () => {
        router.delete(`/employees/${employee.id}/advances/${advance.id}`, {
            onSuccess: () => {
                ToastService.success('Advance payment deleted successfully');
                router.visit(`/employees/${employee.id}/advances`);
            },
            onError: (errors) => {
                ToastService.error(`Failed to delete advance payment: ${errors?.message}`);
            },
        });
    };

    // Calculate remaining balance
    const remainingBalance = Math.max(0, advance.amount - (advance.repaid_amount || 0));

    // Calculate estimated months
    const estimatedMonths = advance.monthly_deduction ? Math.ceil(remainingBalance / advance.monthly_deduction) : 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">{t('fully_paid')}</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    return (
        <AppLayout title={t('ttl_advance_payment_details')} breadcrumbs={breadcrumbs} requiredPermission="employees.view">
            <Head title={t('ttl_advance_payment_details')} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(`/employees/${employee.id}/advances`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Advances
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(`/employees/${employee.id}/advances/${advance.id}/edit`)}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>

                        <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Advance Payment #{advance.id}</CardTitle>
                                <CardDescription>
                                    Details for advance payment requested on {format(new Date(advance.created_at), 'PPP')}
                                </CardDescription>
                            </div>
                            <div>{getStatusBadge(advance.status)}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">{t('payment_information')}</h3>
                                <dl className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Amount:</dt>
                                        <dd>SAR {Number(advance.amount).toFixed(2)}</dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Repaid Amount:</dt>
                                        <dd>SAR {Number(advance.repaid_amount || 0).toFixed(2)}</dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Remaining Balance:</dt>
                                        <dd>SAR {remainingBalance.toFixed(2)}</dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Monthly Deduction:</dt>
                                        <dd>SAR {Number(advance.monthly_deduction || 0).toFixed(2)}</dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Payment Date:</dt>
                                        <dd>{format(new Date(advance.payment_date), 'PPP')}</dd>
                                    </div>
                                    {advance.repayment_date && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <dt className="font-medium text-muted-foreground">Last Repayment Date:</dt>
                                            <dd>{format(new Date(advance.repayment_date), 'PPP')}</dd>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <dt className="font-medium text-muted-foreground">Estimated Repayment:</dt>
                                        <dd>{estimatedMonths} months</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold">{t('additional_information')}</h3>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="mb-1 font-medium text-muted-foreground">Reason:</dt>
                                        <dd className="rounded-md bg-muted/30 p-3">{advance.reason}</dd>
                                    </div>

                                    {advance.status === 'approved' && advance.approver && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <dt className="font-medium text-muted-foreground">Approved By:</dt>
                                                <dd>{advance.approver.name}</dd>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <dt className="font-medium text-muted-foreground">Approved At:</dt>
                                                <dd>{advance.approved_at ? format(new Date(advance.approved_at), 'PPP') : '-'}</dd>
                                            </div>
                                        </>
                                    )}

                                    {advance.status === 'rejected' && advance.rejecter && (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <dt className="font-medium text-muted-foreground">Rejected By:</dt>
                                                <dd>{advance.rejecter.name}</dd>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <dt className="font-medium text-muted-foreground">Rejected At:</dt>
                                                <dd>{advance.rejected_at ? format(new Date(advance.rejected_at), 'PPP') : '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="mb-1 font-medium text-muted-foreground">Rejection Reason:</dt>
                                                <dd className="rounded-md bg-red-50 p-3 text-red-800">{advance.rejection_reason}</dd>
                                            </div>
                                        </>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_advance_payment')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this advance payment? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
