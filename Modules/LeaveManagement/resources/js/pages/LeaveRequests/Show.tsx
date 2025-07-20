import {
    AppLayout,
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    formatDate,
    Input,
    Label,
    Textarea,
} from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Edit, RotateCw, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
// Placeholder type
type LeaveRequest = any;

interface Props {
    leaveRequest: LeaveRequest;
}

export default function LeaveRequestShow({ leaveRequest }: Props) {
    const { t } = useTranslation(['common', 'leave']);

    const usePermission = () => ({ hasPermission: () => true });
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [returnDate, setReturnDate] = useState('');
    const [returnNotes, setReturnNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { hasPermission } = usePermission();
    console.log('Edit permission:', hasPermission());
    console.log('Delete permission:', hasPermission());

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">{t('leave:approved')}</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">{t('leave:pending')}</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">{t('leave:rejected')}</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800">{t('leave:cancelled')}</Badge>;
            default:
                return <Badge variant="outline">{status || t('common:unknown')}</Badge>;
        }
    };

    const getLeaveTypeName = (type: string) => {
        const leaveTypes = {
            annual: t('leave:annual_leave'),
            sick: t('leave:sick_leave'),
            personal: t('leave:personal_leave'),
            unpaid: t('leave:unpaid_leave'),
            maternity: t('leave:maternity_leave'),
            paternity: t('leave:paternity_leave'),
            bereavement: t('leave:bereavement_leave'),
            other: t('leave:other'),
        };
        return leaveTypes[type as keyof typeof leaveTypes] || type;
    };

    const handleDelete = () => {
        console.log('Attempting to delete leave request:', leaveRequest.id);
        if (confirm(t('leave:confirm_delete_leave_request'))) {
            router.delete(route('leaves.requests.destroy', leaveRequest.id), {
                onSuccess: () => {
                    console.log('Delete successful');
                    toast.success('Leave request deleted successfully');
                    router.visit(route('leaves.requests.index'));
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    toast.error(errors.error || 'Failed to delete leave request');
                },
            });
        }
    };

    const handleApprove = () => {
        router.put(
            route('leaves.requests.approve', leaveRequest.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Leave request approved successfully');
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to approve leave request');
                },
            },
        );
    };

    const handleReject = () => {
        router.put(
            route('leaves.requests.reject', leaveRequest.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Leave request rejected successfully');
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to reject leave request');
                },
            },
        );
    };

    const handleReturn = () => {
        setIsSubmitting(true);
        router.put(
            route('leaves.requests.return', leaveRequest.id),
            {
                return_date: returnDate,
                notes: returnNotes,
            },
            {
                onSuccess: () => {
                    toast.success('Employee has been marked as returned from leave');
                    setIsReturnDialogOpen(false);
                    router.reload();
                },
                onError: (errors) => {
                    toast.error(errors.error || 'Failed to mark employee as returned');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    // Calculate the number of days
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    return (
        <AppLayout>
            <Head title={t('leave:ttl_view_leave_request')} />
            <div className="container mx-auto py-6">
                <Breadcrumb className="mb-6">
                    <BreadcrumbItem>
                        <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={route('leaves.requests.index')}>{t('leave:ttl_leave_requests')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink>View</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <CalendarDays className="mr-2 h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">{t('leave:leave_request_details')}</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('leaves.requests.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Leave Requests
                            </Button>
                        </Link>

                        {hasPermission() && (
                            <Link href={route('leaves.requests.edit', leaveRequest.id)}>
                                <Button variant="outline" className="text-blue-600">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}

                        {hasPermission() && (
                            <Button variant="outline" className="text-red-600" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="shadow-md md:col-span-2">
                        <CardHeader className="bg-muted/50">
                            <CardTitle>{t('leave:ttl_leave_request_information')}</CardTitle>
                            <CardDescription>Details of the leave request</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('common:employee')}</h3>
                                        <p className="mt-1 text-base font-medium">
                                            {leaveRequest.employee?.first_name} {leaveRequest.employee?.last_name}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('leave:lbl_leave_type')}</h3>
                                        <p className="mt-1 text-base font-medium">{getLeaveTypeName(leaveRequest.leave_type)}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('common:status')}</h3>
                                        <div className="mt-1">{getStatusBadge(leaveRequest.status)}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('leave:lbl_start_date')}</h3>
                                        <p className="mt-1 text-base font-medium">{formatDate(leaveRequest.start_date)}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('leave:end_date')}</h3>
                                        <p className="mt-1 text-base font-medium">{formatDate(leaveRequest.end_date)}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">{t('common:duration')}</h3>
                                        <p className="mt-1 text-base font-medium">
                                            {diffDays} {t('common:day')}
                                            {diffDays !== 1 ? t('common:s') : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-muted-foreground">{t('leave:reason')}</h3>
                                <p className="mt-1 rounded-md bg-muted/20 p-3 text-base">{leaveRequest.reason || t('common:no_reason_provided')}</p>
                            </div>

                            {leaveRequest.notes && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('leave:additional_notes')}</h3>
                                    <p className="mt-1 rounded-md bg-muted/20 p-3 text-base">{leaveRequest.notes}</p>
                                </div>
                            )}

                            {leaveRequest.status === 'approved' && !leaveRequest.return_date && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('leave:return_status')}</h3>
                                    <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                                        <p className="text-sm text-yellow-800">
                                            {t('leave:employee_not_returned_yet')}
                                            {leaveRequest.is_overdue_for_return && <span className="font-semibold">{t('leave:overdue')}</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {leaveRequest.return_date && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-muted-foreground">{t('leave:return_information')}</h3>
                                    <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-3">
                                        <p className="text-sm text-green-800">
                                            {t('leave:employee_returned_on')} {formatDate(leaveRequest.return_date)}
                                            {leaveRequest.returner && <span> ({t('leave:marked_by')}{leaveRequest.returner.name})</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {leaveRequest.status === 'pending' && hasPermission() && (
                            <CardFooter className="flex justify-end space-x-2 border-t p-6">
                                <Button variant="outline" className="text-red-600" onClick={handleReject}>
                                    <X className="mr-2 h-4 w-4" />
                                    {t('leave:reject')}
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {t('leave:approve')}
                                </Button>
                            </CardFooter>
                        )}

                        {leaveRequest.status === 'approved' && !leaveRequest.return_date && hasPermission() && (
                            <CardFooter className="flex justify-end space-x-2 border-t p-6">
                                <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <RotateCw className="mr-2 h-4 w-4" />
                                            {t('leave:mark_employee_as_returned')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('leave:ttl_mark_employee_as_returned')}</DialogTitle>
                                            <DialogDescription>{t('leave:record_employee_return_from_leave')}</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="return_date">{t('leave:lbl_return_date')}</Label>
                                                <Input
                                                    id="return_date"
                                                    type="date"
                                                    value={returnDate}
                                                    onChange={(e) => setReturnDate(e.target.value)}
                                                    min={formatDateMedium(leaveRequest.end_date)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="return_notes">{t('leave:notes_optional')}</Label>
                                                <Textarea
                                                    id="return_notes"
                                                    value={returnNotes}
                                                    onChange={(e) => setReturnNotes(e.target.value)}
                                                    placeholder={t('leave:ph_add_any_notes_about_the_return')}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                                                {t('common:cancel')}
                                            </Button>
                                            <Button onClick={handleReturn} disabled={!returnDate || isSubmitting}>
                                                {isSubmitting ? t('common:processing') : t('leave:mark_as_returned')}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        )}
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader className="bg-muted/50">
                            <CardTitle>{t('leave:ttl_leave_balance')}</CardTitle>
                            <CardDescription>{t('leave:current_leave_balance_for')} {leaveRequest.employee?.first_name}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('leave:annual_leave')}</span>
                                    <span className="font-medium">{leaveRequest.employee?.annual_leave_balance || 0} {t('common:days')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('leave:sick_leave')}</span>
                                    <span className="font-medium">{leaveRequest.employee?.sick_leave_balance || 0} {t('common:days')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('leave:personal_leave')}</span>
                                    <span className="font-medium">{leaveRequest.employee?.personal_leave_balance || 0} {t('common:days')}</span>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6">
                                <h3 className="mb-3 text-sm font-medium">{t('leave:leave_history')}</h3>
                                {leaveRequest.employee?.recent_leaves?.length > 0 ? (
                                    <div className="space-y-3">
                                        {leaveRequest.employee.recent_leaves.map((leave: any, index: any) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <span>{getLeaveTypeName(leave.type)}</span>
                                                    <span className="ml-2 text-muted-foreground">
                                                        ({formatDate(leave.start_date)} - {formatDate(leave.end_date)})
                                                    </span>
                                                </div>
                                                <div>{getStatusBadge(leave.status)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{t('leave:no_recent_leave_history')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
