import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Badge,
    Label,
    Textarea,
} from '@/Core';
import { router } from '@inertiajs/core';
import { AlertTriangle, Calendar, Check, Clock, FileText, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { format } from 'date-fns';

interface Timesheet {
    id: number;
    employee_id: number;
    date: string;
    hours_worked: number;
    overtime_hours: number;
    status: string;
    description?: string;
    employee?: {
        first_name: string;
        last_name: string;
        employee_id?: string;
    };
    project?: {
        name: string;
    };
}

interface ApprovalDialogProps {
    timesheet: Timesheet;
    trigger: React.ReactNode;
    action: 'approve' | 'reject';
    onSuccess?: () => void;
}

export function ApprovalDialog({ timesheet, trigger, action, onSuccess }: ApprovalDialogProps) {
    const { t } = useTranslation('TimesheetManagement');
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isApproval = action === 'approve';
    const totalHours = (timesheet.hours_worked || 0) + (timesheet.overtime_hours || 0);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Use web route for approval
        const routeName = isApproval ? route('timesheets.approve', timesheet.id) : route('timesheets.reject', timesheet.id);
        const data = notes ? { notes, reason: notes } : {};

        router.put(routeName, data, {
            onSuccess: () => {
                setIsOpen(false);
                setNotes('');
                if (isApproval) {
                    toast.success('Timesheet approved successfully');
                } else {
                    toast.success('Timesheet rejected successfully');
                }
                onSuccess?.();
            },
            onError: (errors: any) => {
                toast.error(errors.error || (isApproval ? 'Failed to approve timesheet' : 'Failed to reject timesheet'));
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'manager_approved':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'foreman_approved':
                return <Badge className="bg-yellow-100 text-yellow-800">Foreman Approved</Badge>;
            case 'incharge_approved':
                return <Badge className="bg-orange-100 text-orange-800">Incharge Approved</Badge>;
            case 'checking_approved':
                return <Badge className="bg-purple-100 text-purple-800">Checking Approved</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'draft':
                return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
            default:
                return <Badge variant="outline">{status || 'Unknown'}</Badge>;
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen} title="Approval">
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[600px]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {isApproval ? (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                        )}
                        <div>
                            <AlertDialogTitle className="text-xl">
                                {isApproval ?
                                    (timesheet.status === 'submitted' ? 'Approve Timesheet' :
                                     timesheet.status === 'foreman_approved' ? 'Incharge Approve Timesheet' :
                                     timesheet.status === 'incharge_approved' ? 'Checking Approve Timesheet' :
                                     timesheet.status === 'checking_approved' ? 'Manager Approve Timesheet' : 'Approve Timesheet')
                                    : 'Reject Timesheet'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isApproval ?
                                    (timesheet.status === 'submitted' ? 'Are you sure you want to approve this timesheet?' :
                                     timesheet.status === 'foreman_approved' ? 'Are you sure you want to approve this timesheet as Incharge?' :
                                     timesheet.status === 'incharge_approved' ? 'Are you sure you want to approve this timesheet as Checking?' :
                                     timesheet.status === 'checking_approved' ? 'Are you sure you want to approve this timesheet as Manager?' : 'Are you sure you want to approve this timesheet?')
                                    : 'Are you sure you want to reject this timesheet?'}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                {/* Timesheet Details */}
                <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Timesheet Details</h3>
                        {getStatusBadge(timesheet.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>Employee</span>
                            </div>
                            <p className="font-medium">
                                {timesheet.employee?.first_name} {timesheet.employee?.last_name}
                                {timesheet.employee?.employee_id && (
                                    <span className="ml-2 text-sm text-gray-500">(ID: {timesheet.employee.employee_id})</span>
                                )}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Date</span>
                            </div>
                            <p className="font-medium">{format(new Date(timesheet.date), 'PPP')}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>Hours</span>
                            </div>
                            <p className="font-medium">
                                {timesheet.hours_worked}h regular
                                {timesheet.overtime_hours > 0 && <span className="text-orange-600"> + {timesheet.overtime_hours}h overtime</span>}
                                <span className="ml-2 text-sm text-gray-500">(Total: {totalHours}h)</span>
                            </p>
                        </div>

                        {timesheet.project && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileText className="h-4 w-4" />
                                    <span>Project</span>
                                </div>
                                <p className="font-medium">{timesheet.project.name}</p>
                            </div>
                        )}
                    </div>

                    {timesheet.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>Description</span>
                            </div>
                            <p className="rounded border bg-white p-3 text-sm">{timesheet.description}</p>
                        </div>
                    )}
                </div>

                {/* Notes/Reason Input */}
                <div className="space-y-3">
                    <Label htmlFor="notes" className="text-sm font-medium">
                        {isApproval ?
                            (timesheet.status === 'submitted' ? 'Approval Notes (Optional)' :
                             timesheet.status === 'foreman_approved' ? 'Incharge Approval Notes (Optional)' :
                             timesheet.status === 'incharge_approved' ? 'Checking Approval Notes (Optional)' :
                             timesheet.status === 'checking_approved' ? 'Manager Approval Notes (Optional)' : 'Approval Notes (Optional)')
                            : 'Rejection Reason'}
                        {!isApproval && <span className="ml-1 text-red-500">*</span>}
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder={isApproval ?
                            (timesheet.status === 'submitted' ? 'Add any notes about this approval...' :
                             timesheet.status === 'foreman_approved' ? 'Add any notes about incharge approval...' :
                             timesheet.status === 'incharge_approved' ? 'Add any notes about checking approval...' :
                             timesheet.status === 'checking_approved' ? 'Add any notes about manager approval...' : 'Add any notes about this approval...')
                            : 'Please provide a reason for rejection...'}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    {!isApproval && !notes.trim() && (
                        <p className="flex items-center gap-1 text-sm text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            Rejection reason is required
                        </p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!isApproval && !notes.trim())}
                        className={isApproval ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                {isApproval ? 'Approving...' : 'Rejecting...'}
                            </>
                        ) : (
                            <>
                                {isApproval ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        {timesheet.status === 'submitted' ? 'Approve Timesheet' :
                                         timesheet.status === 'foreman_approved' ? 'Incharge Approve' :
                                         timesheet.status === 'incharge_approved' ? 'Checking Approve' :
                                         timesheet.status === 'checking_approved' ? 'Manager Approve' : 'Approve Timesheet'}
                                    </>
                                ) : (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Reject Timesheet
                                    </>
                                )}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
