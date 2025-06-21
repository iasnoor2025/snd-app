import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Core";
import { Badge } from "@/Core";
import { CalendarDays, ArrowLeft, Edit, Trash2, Check, X, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/Core';
// Placeholder type
type LeaveRequest = any;
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/Core";
import { formatDate } from "@/Core";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Core";
import { Label } from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { useState } from 'react';

interface Props {
  leaveRequest: LeaveRequest;
}

export default function LeaveRequestShow({ leaveRequest }: Props) {
  const { t } = useTranslation('leave');

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
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getLeaveTypeName = (type: string) => {
    const leaveTypes = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      unpaid: 'Unpaid Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
      other: 'Other',
    };
    return leaveTypes[type as keyof typeof leaveTypes] || type;
  };

  const handleDelete = () => {
    console.log('Attempting to delete leave request:', leaveRequest.id);
    if (confirm('Are you sure you want to delete this leave request?')) {
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
    router.put(route('leaves.requests.approve', leaveRequest.id), {}, {
      onSuccess: () => {
        toast.success('Leave request approved successfully');
      },
      onError: (errors) => {
        toast.error(errors.error || 'Failed to approve leave request');
      },
    });
  };

  const handleReject = () => {
    router.put(route('leaves.requests.reject', leaveRequest.id), {}, {
      onSuccess: () => {
        toast.success('Leave request rejected successfully');
      },
      onError: (errors) => {
        toast.error(errors.error || 'Failed to reject leave request');
      },
    });
  };

  const handleReturn = () => {
    setIsSubmitting(true);
    router.put(route('leaves.requests.return', leaveRequest.id), {
      return_date: returnDate,
      notes: returnNotes,
    }, {
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
    });
  };

  // Calculate the number of days
  const startDate = new Date(leaveRequest.start_date);
  const endDate = new Date(leaveRequest.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

  return (
    <AppLayout>
      <Head title={t('ttl_view_leave_request')} />
      <div className="container mx-auto py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={route('leaves.requests.index')}>{t('ttl_leave_requests')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>View</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CalendarDays className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold">{t('leave_request_details')}</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle>{t('ttl_leave_request_information')}</CardTitle>
              <CardDescription>
                Details of the leave request
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Employee</h3>
                    <p className="text-base font-medium mt-1">
                      {leaveRequest.employee?.first_name} {leaveRequest.employee?.last_name}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t('lbl_leave_type')}</h3>
                    <p className="text-base font-medium mt-1">
                      {getLeaveTypeName(leaveRequest.leave_type)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      {getStatusBadge(leaveRequest.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t('lbl_start_date')}</h3>
                    <p className="text-base font-medium mt-1">
                      {formatDate(leaveRequest.start_date)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{t('end_date')}</h3>
                    <p className="text-base font-medium mt-1">
                      {formatDate(leaveRequest.end_date)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                    <p className="text-base font-medium mt-1">
                      {diffDays} day{diffDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                <p className="text-base mt-1 p-3 bg-muted/20 rounded-md">
                  {leaveRequest.reason || 'No reason provided'}
                </p>
              </div>

              {leaveRequest.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('additional_notes')}</h3>
                  <p className="text-base mt-1 p-3 bg-muted/20 rounded-md">
                    {leaveRequest.notes}
                  </p>
                </div>
              )}

              {leaveRequest.status === 'approved' && !leaveRequest.return_date && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('return_status')}</h3>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Employee has not returned from leave yet.
                      {leaveRequest.is_overdue_for_return && (
                        <span className="font-semibold"> (Overdue)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {leaveRequest.return_date && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('return_information')}</h3>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      Employee returned on {formatDate(leaveRequest.return_date)}
                      {leaveRequest.returner && (
                        <span> (Marked by {leaveRequest.returner.name})</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            {leaveRequest.status === 'pending' && hasPermission() && (
              <CardFooter className="flex justify-end space-x-2 border-t p-6">
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={handleReject}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </CardFooter>
            )}

            {leaveRequest.status === 'approved' && !leaveRequest.return_date && hasPermission() && (
              <CardFooter className="flex justify-end space-x-2 border-t p-6">
                <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <RotateCw className="mr-2 h-4 w-4" />
                      Mark as Returned
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('ttl_mark_employee_as_returned')}</DialogTitle>
                      <DialogDescription>
                        Record the employee's return from leave
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="return_date">{t('lbl_return_date')}</Label>
                        <Input
                          id="return_date"
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={leaveRequest.end_date}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="return_notes">Notes (Optional)</Label>
                        <Textarea
                          id="return_notes"
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                          placeholder={t('ph_add_any_notes_about_the_return')}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsReturnDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReturn}
                        disabled={!returnDate || isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Mark as Returned'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            )}
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle>{t('ttl_leave_balance')}</CardTitle>
              <CardDescription>
                Current leave balance for {leaveRequest.employee?.first_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('annual_leave')}</span>
                  <span className="font-medium">{leaveRequest.employee?.annual_leave_balance || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('sick_leave')}</span>
                  <span className="font-medium">{leaveRequest.employee?.sick_leave_balance || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('personal_leave')}</span>
                  <span className="font-medium">{leaveRequest.employee?.personal_leave_balance || 0} days</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">{t('leave_history')}</h3>
                {leaveRequest.employee?.recent_leaves?.length > 0 ? (
                  <div className="space-y-3">
                    {leaveRequest.employee.recent_leaves.map((leave: any, index: any) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span>{getLeaveTypeName(leave.type)}</span>
                          <span className="text-muted-foreground ml-2">
                            ({formatDate(leave.start_date)} - {formatDate(leave.end_date)})
                          </span>
                        </div>
                        <div>{getStatusBadge(leave.status)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('no_recent_leave_history')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}














