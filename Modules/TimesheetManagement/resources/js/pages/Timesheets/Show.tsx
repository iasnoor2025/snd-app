import { AppLayout, usePermission } from '@/Core';




import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft as ArrowLeftIcon,
    Calendar as CalendarIcon,
    Check as CheckIcon,
    Clock as ClockIcon,
    Edit as EditIcon,
    Trash2 as Trash2Icon,
    User as UserIcon,
    X as XIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApprovalDialog } from '../../Components/ApprovalDialog';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Core/Components/ui';

interface Props {
    timesheet: any;
    employee?: any;
    project?: any;
    rental?: any;
    assignment?: any;
    user?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export default function TimesheetShow({ timesheet, assignment }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    const { hasPermission } = usePermission();

    const breadcrumbs = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: t('view', 'View'), href: '#' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'manager_approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
            case 'foreman_approved':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Foreman Approved</Badge>;
            case 'incharge_approved':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Incharge Approved</Badge>;
            case 'checking_approved':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Checking Approved</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Submitted</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
            case 'draft':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
            default:
                return <Badge variant="outline">{status || 'Unknown'}</Badge>;
        }
    };

    const handleDelete = () => {
        if (confirm(t('delete_confirm', 'Are you sure you want to delete this timesheet?'))) {
            fetch(route('timesheets.destroy', timesheet.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _method: 'DELETE' }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log(t('success', 'Success'));
                        window.location.href = route('timesheets.index');
                    } else {
                        console.log(data.error || t('delete_failed', 'Failed to delete timesheet'));
                    }
                })
                .catch((error) => {
                    console.log(error.message || t('delete_failed', 'Failed to delete timesheet'));
                });
        }
    };

    // Calculate total hours
    const totalHours = (parseFloat(timesheet.hours_worked?.toString() || '0') + parseFloat(timesheet.overtime_hours?.toString() || '0')).toFixed(1);

    // Get assignment display text
    const getAssignmentDisplay = () => {
        if (assignment) {
            if (assignment.type === 'project' && assignment.project) {
                return `Project: ${assignment.project.name}`;
            } else if (assignment.type === 'rental' && assignment.rental) {
                return `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`;
            } else {
                return `${assignment.type}: ${assignment.name}`;
            }
        }
        // Fallback to legacy project/rental data
        if (timesheet.project?.name) {
            return `Project: ${timesheet.project.name}`;
        }
        if (timesheet.rental?.equipment?.name) {
            return `Rental: ${timesheet.rental.equipment.name}`;
        }
        return null;
    };

    // Fix canApprove logic to match backend multi-stage workflow
    const canApprove = (
        (timesheet.status === 'submitted' && (hasPermission('timesheets.approve') || hasPermission('timesheets.approve.foreman') || hasPermission('timesheets.approve.incharge') || hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve.manager')))
        || (timesheet.status === 'foreman_approved' && (hasPermission('timesheets.approve.incharge') || hasPermission('timesheets.approve') || hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve.manager')))
        || (timesheet.status === 'incharge_approved' && (hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve') || hasPermission('timesheets.approve.manager')))
        || (timesheet.status === 'checking_approved' && (hasPermission('timesheets.approve.manager') || hasPermission('timesheets.approve')))
    );

    return (
        <AppLayout title={t('ttl_view_timesheet')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
            <Head title={t('ttl_view_timesheet')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{t('timesheet_details')}</h1>
                        <Badge className="ml-2">{getStatusBadge(timesheet.status)}</Badge>
                    </div>

                    <div className="flex space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" asChild>
                                        <a href={route('timesheets.index')}>
                                            <ArrowLeftIcon className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('back_to_timesheets')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {hasPermission('timesheets.edit') && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" asChild>
                                            <a href={route('timesheets.edit', timesheet.id)}>
                                                <EditIcon className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('edit_timesheet')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {hasPermission('timesheets.delete') && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive">
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('delete_timesheet')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserIcon className="mr-2 h-5 w-5" />
                                {timesheet.employee?.first_name} {timesheet.employee?.last_name}
                            </CardTitle>
                            <CardDescription>
                                {timesheet.date && format(new Date(timesheet.date), 'PPP')}
                                {getAssignmentDisplay() && ` • ${getAssignmentDisplay()}`}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {/* Assignment Information Display */}
                            {assignment && (
                                <div className="mb-6 rounded-lg border p-4 bg-blue-50">
                                    <h4 className="font-medium text-sm text-blue-800 mb-2">Assignment Details</h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <div><strong>Type:</strong> {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</div>
                                        <div><strong>Name:</strong> {assignment.name}</div>
                                        {assignment.project && (
                                            <div><strong>Project:</strong> {assignment.project.name}</div>
                                        )}
                                        {assignment.rental && (
                                            <div><strong>Rental:</strong> {assignment.rental.rental_number || assignment.rental.project_name}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-muted-foreground">{t('lbl_regular_hours')}</span>
                                    <span className="text-2xl font-bold">{timesheet.hours_worked}</span>
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-muted-foreground">Overtime</span>
                                    <span className="text-2xl font-bold">{timesheet.overtime_hours}</span>
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-muted-foreground">{t('total_hours')}</span>
                                    <span className="text-2xl font-bold">{totalHours}</span>
                                </div>
                            </div>

                            {timesheet.tasks_completed && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">{t('tasks_completed')}</h3>
                                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{timesheet.tasks_completed}</div>
                                </div>
                            )}

                            {timesheet.description && (
                                <div>
                                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{timesheet.description}</div>
                                </div>
                            )}
                        </CardContent>

                        {/* Approval button for all workflow stages */}
                        {['submitted', 'foreman_approved', 'incharge_approved', 'checking_approved'].includes(timesheet.status) && canApprove && (
                            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                                <ApprovalDialog
                                    timesheet={timesheet}
                                    action="approve"
                                    onSuccess={() => {
                                        window.location.reload();
                                        toast.success('Timesheet approved successfully');
                                    }}
                                    trigger={
                                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                            <CheckIcon className="mr-2 h-4 w-4" />
                                            {timesheet.status === 'submitted' ? 'Approve' :
                                             timesheet.status === 'foreman_approved' ? 'Incharge Approve' :
                                             timesheet.status === 'incharge_approved' ? 'Checking Approve' :
                                             timesheet.status === 'checking_approved' ? 'Manager Approve' : 'Approve'}
                                        </Button>
                                    }
                                    approveRoute={route('timesheets.approve', timesheet.id)}
                                    approveMethod="PUT"
                                />
                            </CardFooter>
                        )}
                        {/* Submit button for draft/rejected timesheets for admin/HR */}
                        {['draft', 'rejected'].includes(timesheet.status) && hasPermission('timesheets.edit') && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                fetch(route('timesheets.submit', timesheet.id), {
                                                    method: 'POST',
                                                    headers: {
                                                        'X-CSRF-TOKEN':
                                                            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                                                        Accept: 'application/json',
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({}),
                                                })
                                                    .then((response) => response.json())
                                                    .then((data) => {
                                                        if (data.success) {
                                                            console.log(t('success', 'Timesheet submitted for approval'));
                                                            window.location.reload();
                                                        } else {
                                                            console.log(data.error || t('submit_failed', 'Failed to submit timesheet'));
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        console.log(error.message || t('submit_failed', 'Failed to submit timesheet'));
                                                    });
                                            }}
                                        >
                                            <CheckIcon className="mr-2 h-4 w-4" />
                                            {t('submit', 'Submit')}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('submit_timesheet', 'Submit Timesheet for Approval')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CalendarIcon className="mr-2 h-5 w-5" />
                                Time Summary
                            </CardTitle>
                            <CardDescription>Monthly summary for {timesheet.employee?.first_name}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('lbl_regular_hours')}</span>
                                    <span className="font-medium">{timesheet.employee?.monthly_regular_hours || 0} hrs</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('lbl_overtime_hours')}</span>
                                    <span className="font-medium">{timesheet.employee?.monthly_overtime_hours || 0} hrs</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t pt-2">
                                    <span className="text-sm font-medium">{t('total_hours')}</span>
                                    <span className="font-bold">
                                        {(
                                            parseFloat(timesheet.employee?.monthly_regular_hours?.toString() || '0') +
                                            parseFloat(timesheet.employee?.monthly_overtime_hours?.toString() || '0')
                                        ).toFixed(1)}{' '}
                                        hrs
                                    </span>
                                </div>
                            </div>

                            {timesheet.employee?.recent_timesheets?.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="mb-3 text-sm font-medium">{t('recent_timesheets')}</h3>
                                    <div className="space-y-3">
                                        {timesheet.employee.recent_timesheets.map(
                                            (
                                                entry: { date: string; hours_worked: number; overtime_hours: number; status: string },
                                                index: number,
                                            ) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center">
                                                        <CalendarIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                                                        <span>{format(new Date(entry.date), 'PPP')}</span>
                                                        <span className="ml-2 text-muted-foreground">
                                                            ({entry.hours_worked + entry.overtime_hours} hrs)
                                                        </span>
                                                    </div>
                                                    <div>{getStatusBadge(entry.status)}</div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
