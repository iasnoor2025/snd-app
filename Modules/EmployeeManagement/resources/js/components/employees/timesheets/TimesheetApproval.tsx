import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Checkbox,
  useToast,
} from "@/Core";
import { RejectTimesheetDialog } from './RejectTimesheetDialog';
import { Check, X } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position?: {
    name: string;
  };
}

interface Timesheet {
  id: number;
  employee_id: number;
  employee: Employee;
  date: string;
  clock_in: string;
  clock_out: string;
  break_start: string | null;
  break_end: string | null;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  status: string;
  notes: string | null;
  project_id: number | null;
  project?: {
    id: number;
    name: string;
  };
}

export const TimesheetApproval: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation('employee');
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTimesheetForReject, setSelectedTimesheetForReject] = useState<number | null>(null);

  const fetchPendingTimesheets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/employees/timesheets/pending');
      setTimesheets(response.data.timesheets);
    } catch (error) {
      console.error('Error fetching pending timesheets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending timesheets',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTimesheets();
  }, []);

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedTimesheets(timesheets.map(timesheet => timesheet.id));
    } else {
      setSelectedTimesheets([]);
    }
  };

  const handleRowCheckboxChange = (timesheetId: number, checked: boolean) => {
    if (checked) {
      setSelectedTimesheets(prev => [...prev, timesheetId]);
    } else {
      setSelectedTimesheets(prev => prev.filter(id => id !== timesheetId));
    }
  };

  const handleApproveSelected = async () => {
    if (selectedTimesheets.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one timesheet to approve',
        variant: 'destructive',
      })
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/employees/timesheets/bulk-approve', {
        timesheet_ids: selectedTimesheets
      })
      toast({
        title: 'Success',
        description: `${selectedTimesheets.length} timesheets approved successfully`,
      })
      fetchPendingTimesheets();
      setSelectedTimesheets([]);
    } catch (error) {
      console.error('Error approving timesheets:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve timesheets',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTimesheet = async (timesheetId: number) => {
    setIsLoading(true);
    try {
      const employeeId = timesheets.find(t => t.id === timesheetId)?.employee_id;
      if (!employeeId) {
        throw new Error('Employee ID not found');
      }

      await axios.post(`/employees/${employeeId}/timesheets/${timesheetId}/approve`);
      toast({
        title: 'Success',
        description: 'Timesheet approved successfully',
      })
      fetchPendingTimesheets();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve timesheet',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectDialog = (timesheetId: number) => {
    setSelectedTimesheetForReject(timesheetId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleRejectTimesheet = async () => {
    if (!selectedTimesheetForReject) return;

    setIsLoading(true);
    try {
      const employeeId = timesheets.find(t => t.id === selectedTimesheetForReject)?.employee_id;
      if (!employeeId) {
        throw new Error('Employee ID not found');
      }

      await axios.post(`/employees/${employeeId}/timesheets/${selectedTimesheetForReject}/reject`, {
        reason: rejectReason
      })
      toast({
        title: 'Success',
        description: 'Timesheet rejected successfully',
      })
      setShowRejectDialog(false);
      fetchPendingTimesheets();
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject timesheet',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '-';
    try {
      return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateTimeStr;
    }
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('ttl_pending_timesheet_approvals')}</CardTitle>
              <CardDescription>
                Approve or reject employee timesheet entries
              </CardDescription>
            </div>
            {selectedTimesheets.length > 0 && (
              <Button onClick={handleApproveSelected} disabled={isLoading}>
                <Check className="mr-2 h-4 w-4" />
                Approve Selected ({selectedTimesheets.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending timesheets to approve.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedTimesheets.length === timesheets.length && timesheets.length > 0}
                        onChange={(e) => handleSelectAllChange(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In/Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTimesheets.includes(timesheet.id)}
                          onChange={(e) => handleRowCheckboxChange(timesheet.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{timesheet.employee.name}</TableCell>
                      <TableCell>{timesheet.employee.position?.name || '-'}</TableCell>
                      <TableCell>
                        {timesheet.date ? format(new Date(timesheet.date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div>{formatDateTime(timesheet.clock_in)}</div>
                        <div>{formatDateTime(timesheet.clock_out)}</div>
                      </TableCell>
                      <TableCell>
                        <div>Regular: {formatHours(timesheet.regular_hours)}</div>
                        <div>OT: {formatHours(timesheet.overtime_hours)}</div>
                        <div className="font-bold">Total: {formatHours(timesheet.total_hours)}</div>
                      </TableCell>
                      <TableCell>
                        {timesheet.project ? timesheet.project.name : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {timesheet.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleApproveTimesheet(timesheet.id)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openRejectDialog(timesheet.id)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RejectTimesheetDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onReject={handleRejectTimesheet}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        isLoading={isLoading}
      />
    </>
  );
};
















