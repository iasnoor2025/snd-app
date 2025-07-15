import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/Core';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Check, Clock, DollarSign, FileText, User, X } from 'lucide-react';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
}

interface User {
    id: number;
    name: string;
}

interface SalaryAdvance {
    id: number;
    employee: Employee;
    amount: number;
    advance_date: string;
    deduction_start_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'deducted';
    approved_by?: number;
    approved_at?: string;
    approver?: User;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    salaryAdvance: SalaryAdvance;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Salary Advances',
        href: '/salary-advances',
    },
    {
        title: 'View Request',
        href: '#',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
        approved: { variant: 'default' as const, label: 'Approved', icon: Check },
        rejected: { variant: 'destructive' as const, label: 'Rejected', icon: X },
        deducted: { variant: 'outline' as const, label: 'Deducted', icon: DollarSign },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
};

export default function Show({ auth, salaryAdvance }: Props) {
    const { t } = useTranslation('payroll');

    const { hasPermission } = usePermission();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    const canApprove =
        hasPermission('salary-advances.edit') &&
        salaryAdvance.status === 'pending' &&
        (auth.user?.roles?.some((role) => ['admin', 'hr'].includes(role.name)) || false);

    const handleApprove = () => {
        setProcessing(true);
        router.post(
            `/salary-advances/${salaryAdvance.id}/approve`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowApproveDialog(false);
                },
            },
        );
    };

    const handleReject = () => {
        setProcessing(true);
        router.post(
            `/salary-advances/${salaryAdvance.id}/reject`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowRejectDialog(false);
                },
            },
        );
    };

    return (
        <AppLayout title={t('ttl_salary_advance_details')} breadcrumbs={breadcrumbs} requiredPermission="salary-advances.view">
            <Head title={`Salary Advance #${salaryAdvance.id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/salary-advances">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Salary Advance #{salaryAdvance.id}</h1>
                            <p className="text-muted-foreground">
                                Request submitted on {format(new Date(salaryAdvance.created_at), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(salaryAdvance.status)}
                        {canApprove && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRejectDialog(true)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button size="sm" onClick={() => setShowApproveDialog(true)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Employee Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('employee_information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-lg font-semibold">
                                    {salaryAdvance.employee.first_name} {salaryAdvance.employee.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('employee_id')}</p>
                                <p className="font-medium">{salaryAdvance.employee.employee_id}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Request Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                {t('leave:request_details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-2xl font-bold text-green-600">${salaryAdvance.amount}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('advance_date')}</p>
                                    <p className="font-medium">{format(new Date(salaryAdvance.advance_date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('deduction_start')}</p>
                                    <p className="font-medium">{format(new Date(salaryAdvance.deduction_start_date), 'MMM dd, yyyy')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Reason for Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{salaryAdvance.reason}</p>
                        </CardContent>
                    </Card>

                    {/* Status Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Status Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('current_status')}</p>
                                    <div className="mt-1">{getStatusBadge(salaryAdvance.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                    <p className="font-medium">{format(new Date(salaryAdvance.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                {salaryAdvance.approved_at && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {salaryAdvance.status === 'approved' ? 'Approved' : 'Processed'}
                                        </p>
                                        <p className="font-medium">{format(new Date(salaryAdvance.approved_at), 'MMM dd, yyyy HH:mm')}</p>
                                        {salaryAdvance.approver && <p className="text-sm text-muted-foreground">by {salaryAdvance.approver.name}</p>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_approve_salary_advance')}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this salary advance request for{' '}
                            <strong>
                                {salaryAdvance.employee.first_name} {salaryAdvance.employee.last_name}
                            </strong>{' '}
                            in the amount of <strong>${salaryAdvance.amount}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            {processing ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_reject_salary_advance')}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this salary advance request for{' '}
                            <strong>
                                {salaryAdvance.employee.first_name} {salaryAdvance.employee.last_name}
                            </strong>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing}>
                            {processing ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
