import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft as ArrowLeftIcon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User as UserIcon,
  FileText as FileTextIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AppLayout from "@/layouts/AppLayout";
import { format } from 'date-fns';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  employee?: Employee;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  approval_notes?: string;
  approved_by?: Employee;
  approved_at?: string;
  rejected_by?: Employee;
  rejected_at?: string;
}

interface PageProps {
  leaveRequest: LeaveRequest;
}

const LeaveApprovalShow: React.FC = () => {
  const { leaveRequest } = usePage<PageProps>().props;
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
  const { t } = useTranslation('leave');

    setIsProcessing(true);
    router.post(route('leaves.approvals.approve', leaveRequest.id), {
      approval_notes: approvalNotes,
    }, {
      onSuccess: () => {
        setShowApprovalDialog(false);
        setApprovalNotes('');
      },
      onFinish: () => setIsProcessing(false),
    });
  };

  const handleReject = () => {
    setIsProcessing(true);
    router.post(route('leaves.approvals.reject', leaveRequest.id), {
      rejection_notes: rejectionNotes,
    }, {
      onSuccess: () => {
        setShowRejectionDialog(false);
        setRejectionNotes('');
      },
      onFinish: () => setIsProcessing(false),
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy \\at h:mm a');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-green-100 text-green-800',
      maternity: 'bg-pink-100 text-pink-800',
      hajj: 'bg-purple-100 text-purple-800',
      umrah: 'bg-indigo-100 text-indigo-800',
      unpaid: 'bg-gray-100 text-gray-800',
      other: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isPending = leaveRequest.status === 'pending';

  return (
    <AdminLayout>
      <Head title={`Leave Request #${leaveRequest.id}`} />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={route('leaves.approvals.index')}>
                {t('leave_approvals')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Request #{leaveRequest.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('leaves.approvals.index')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Approvals
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Leave Request #{leaveRequest.id}
              </h1>
              <p className="text-muted-foreground">
                Submitted by {leaveRequest.employee?.first_name} {leaveRequest.employee?.last_name}
              </p>
            </div>
          </div>

          {isPending && (
            <div className="flex items-center space-x-2">
              <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <XIcon className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('ttl_reject_leave_request')}</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to reject this leave request?
                      Please provide a reason for rejection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Rejection Notes *</label>
                      <Textarea
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder={t('ph_please_provide_a_reason_for_rejection')}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionNotes.trim() || isProcessing}
                    >
                      {isProcessing ? 'Rejecting...' : 'Reject Request'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('ttl_approve_leave_request')}</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to approve this leave request?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Approval Notes (Optional)</label>
                      <Textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder={t('ph_add_any_notes_for_the_approval')}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Approving...' : 'Approve Request'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileTextIcon className="h-5 w-5 mr-2" />
                  {t('request_details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('lbl_leave_type')}</label>
                    <div className="mt-1">
                      <Badge className={getLeaveTypeColor(leaveRequest.leave_type)}>
                        {leaveRequest.leave_type.charAt(0).toUpperCase() + leaveRequest.leave_type.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(leaveRequest.status)}>
                        {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('lbl_start_date')}</label>
                    <div className="mt-1 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(leaveRequest.start_date)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('end_date')}</label>
                    <div className="mt-1 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(leaveRequest.end_date)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {calculateDays(leaveRequest.start_date, leaveRequest.end_date)} days
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                    <div className="mt-1 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDateTime(leaveRequest.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm">{leaveRequest.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval/Rejection Details */}
            {!isPending && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {leaveRequest.status === 'approved' ? (
                      <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <XIcon className="h-5 w-5 mr-2 text-red-600" />
                    )}
                    {leaveRequest.status === 'approved' ? 'Approval Details' : 'Rejection Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {leaveRequest.status === 'approved' ? 'Approved By' : 'Rejected By'}
                      </label>
                      <div className="mt-1">
                        <span className="font-medium">
                          {leaveRequest.status === 'approved'
                            ? `${leaveRequest.approved_by?.first_name} ${leaveRequest.approved_by?.last_name}`
                            : `${leaveRequest.rejected_by?.first_name} ${leaveRequest.rejected_by?.last_name}`
                          }
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {leaveRequest.status === 'approved' ? 'Approved At' : 'Rejected At'}
                      </label>
                      <div className="mt-1 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {leaveRequest.status === 'approved'
                            ? formatDateTime(leaveRequest.approved_at!)
                            : formatDateTime(leaveRequest.rejected_at!)
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {leaveRequest.approval_notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {leaveRequest.status === 'approved' ? 'Approval Notes' : 'Rejection Notes'}
                      </label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <p className="text-sm">{leaveRequest.approval_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  {t('employee:employee_information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="mt-1 font-medium">
                    {leaveRequest.employee?.first_name} {leaveRequest.employee?.last_name}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="mt-1">
                    <a
                      href={`mailto:${leaveRequest.employee?.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {leaveRequest.employee?.email}
                    </a>
                  </div>
                </div>

                {leaveRequest.employee?.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="mt-1">
                      <a
                        href={`tel:${leaveRequest.employee.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {leaveRequest.employee.phone}
                      </a>
                    </div>
                  </div>
                )}

                {leaveRequest.employee?.department && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <div className="mt-1">{leaveRequest.employee.department}</div>
                  </div>
                )}

                {leaveRequest.employee?.position && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <div className="mt-1">{leaveRequest.employee.position}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isPending && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('ttl_quick_actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setShowApprovalDialog(true)}
                    disabled={isProcessing}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectionDialog(true)}
                    disabled={isProcessing}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Alert */}
            {isPending && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">{t('pending_approval')}</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This leave request is waiting for your approval. Please review the details and take action.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LeaveApprovalShow;














