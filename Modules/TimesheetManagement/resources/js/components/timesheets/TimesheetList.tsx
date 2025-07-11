import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { EmployeeTimesheet } from '../../types/timesheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Button } from "@/Core";
import { Checkbox } from "@/Core";
import { Badge } from "@/Core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Core";
import { Textarea } from "@/Core";
import { Label } from "@/Core";
import {
  formatDateTime,
  formatDateMedium,
  formatDateShort
} from '@/Core/utils/dateFormatter';
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Check
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface TimesheetListProps {
  timesheets: EmployeeTimesheet[];
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onBulkApprove: (timesheetIds: number[]) => void;
}

const TimesheetList: React.FC<TimesheetListProps> = ({
  timesheets,
  isLoading,
  onApprove,
  onReject,
  onBulkApprove,
}) => {
  const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [timesheetToReject, setTimesheetToReject] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { t } = useTranslation('TimesheetManagement');
  const { auth } = usePage().props as any;
  const isAdmin = auth?.user?.roles?.includes('admin');

  const handleToggleSelect = (id: number) => {
    setSelectedTimesheets((prev) =>
      prev.includes(id)
        ? prev.filter((timesheetId) => timesheetId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTimesheets.length === timesheets.length) {
      setSelectedTimesheets([]);
    } else {
      setSelectedTimesheets(timesheets.map((timesheet) => timesheet.id));
    }
  };

  const handleApprove = async (id: number) => {
    setProcessing(true);
    try {
      await axios.post(`/api/timesheets/${id}/approve`);
      onApprove();
    } catch (error) {
      console.error('Error approving timesheet:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!timesheetToReject) return;

    setProcessing(true);
    try {
      await axios.post(`/api/timesheets/${timesheetToReject}/reject`, {
        reason: rejectReason,
      })
      setShowRejectDialog(false);
      setRejectReason('');
      setTimesheetToReject(null);
      onReject();
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (id: number) => {
    setTimesheetToReject(id);
    setShowRejectDialog(true);
  };

  const handleBulkApprove = async () => {
    if (selectedTimesheets.length === 0) return;

    setProcessing(true);
    try {
      await onBulkApprove(selectedTimesheets);
      setSelectedTimesheets([]);
    } catch (error) {
      console.error('Error bulk approving timesheets:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTimesheets.length === 0) return;
    setProcessing(true);
    try {
      await axios.post(route('timesheets.bulk-delete'), { ids: selectedTimesheets });
      setSelectedTimesheets([]);
      setShowDeleteDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error bulk deleting timesheets:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'manager_approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
      case 'foreman_approved':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Foreman Approved</Badge>
      case 'incharge_approved':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Incharge Approved</Badge>
      case 'checking_approved':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Checking Approved</Badge>
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Submitted</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
    }
  };

  return (
    <div className="space-y-4">
      {selectedTimesheets.length > 0 && (
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <span className="text-sm">
            {selectedTimesheets.length} timesheet{selectedTimesheets.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={processing}
              className="flex items-center gap-1"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approve Selected
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve Selected
                </>
              )}
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={processing}
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedTimesheets.length === timesheets.length && timesheets.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <span className="text-sm text-gray-500 mt-2 block">Loading timesheets...</span>
                </TableCell>
              </TableRow>
            ) : timesheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <span className="text-sm text-gray-500">No timesheets found.</span>
                </TableCell>
              </TableRow>
            ) : (
              timesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTimesheets.includes(timesheet.id)}
                      onCheckedChange={() => handleToggleSelect(timesheet.id)}
                      disabled={timesheet.status !== 'pending'}
                    />
                  </TableCell>
                  <TableCell>
                    {(timesheet as any).employee?.first_name} {(timesheet as any).employee?.last_name}
                  </TableCell>
                  <TableCell>{format(parseISO((timesheet as any).date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>Regular: {(timesheet as any).regular_hours}h</span>
                      {(timesheet as any).overtime_hours > 0 && (
                        <span className="text-xs text-orange-600">OT: {(timesheet as any).overtime_hours}h</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {((timesheet as any).project?.name && (timesheet as any).rental?.equipment?.name)
                      ? `${(timesheet as any).project.name} / ${(timesheet as any).rental.equipment.name}`
                      : (timesheet as any).project?.name
                        ? (timesheet as any).project.name
                        : (timesheet as any).rental?.equipment?.name
                          ? (timesheet as any).rental.equipment.name
                          : <span className="text-gray-400">{t('not_assigned')}</span>
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge((timesheet as any).status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={route('timesheets.show', (timesheet as any).id)}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('employee:ttl_view_details')}
                          </DropdownMenuItem>
                        </Link>
                        <Link href={route('timesheets.edit', (timesheet as any).id)}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        {(timesheet as any).status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove((timesheet as any).id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRejectDialog((timesheet as any).id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reject_timesheet')}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this timesheet. The employee will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">{t('lbl_reason_for_rejection')}</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('ph_please_specify_why_this_timesheet_is_being_reje')}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Timesheet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_timesheets')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the selected timesheets? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Timesheets'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimesheetList;














