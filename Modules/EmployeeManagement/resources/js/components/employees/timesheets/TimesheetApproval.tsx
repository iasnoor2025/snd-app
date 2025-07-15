import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    useToast,
} from '@/Core';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RejectTimesheetDialog } from './RejectTimesheetDialog';

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
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
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
                title: t('toast_error'), // TODO: Add 'toast_error'
                description: t('toast_failed_load_pending'), // TODO: Add 'toast_failed_load_pending'
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTimesheets();
    }, []);

    const handleSelectAllChange = (checked: boolean) => {
        if (checked) {
            setSelectedTimesheets(timesheets.map((timesheet) => timesheet.id));
        } else {
            setSelectedTimesheets([]);
        }
    };

    const handleRowCheckboxChange = (timesheetId: number, checked: boolean) => {
        if (checked) {
            setSelectedTimesheets((prev) => [...prev, timesheetId]);
        } else {
            setSelectedTimesheets((prev) => prev.filter((id) => id !== timesheetId));
        }
    };

    const handleApproveSelected = async () => {
        if (selectedTimesheets.length === 0) {
            toast({
                title: t('toast_warning'), // TODO: Add 'toast_warning'
                description: t('toast_select_at_least_one'), // TODO: Add 'toast_select_at_least_one'
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/employees/timesheets/bulk-approve', {
                timesheet_ids: selectedTimesheets,
            });
            toast({
                title: t('toast_success'), // TODO: Add 'toast_success'
                description: t('toast_bulk_approve_success', { count: selectedTimesheets.length }), // TODO: Add 'toast_bulk_approve_success'
            });
            fetchPendingTimesheets();
            setSelectedTimesheets([]);
        } catch (error) {
            console.error('Error approving timesheets:', error);
            toast({
                title: t('toast_error'),
                description: t('toast_failed_bulk_approve'), // TODO: Add 'toast_failed_bulk_approve'
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveTimesheet = async (timesheetId: number) => {
        setIsLoading(true);
        try {
            const employeeId = timesheets.find((t) => t.id === timesheetId)?.employee_id;
            if (!employeeId) {
                throw new Error('Employee ID not found');
            }

            await axios.post(`/employees/${employeeId}/timesheets/${timesheetId}/approve`);
            toast({
                title: t('toast_success'),
                description: t('toast_approve_success'), // TODO: Add 'toast_approve_success'
            });
            fetchPendingTimesheets();
        } catch (error) {
            console.error('Error approving timesheet:', error);
            toast({
                title: t('toast_error'),
                description: t('toast_failed_approve'), // TODO: Add 'toast_failed_approve'
                variant: 'destructive',
            });
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
            const employeeId = timesheets.find((t) => t.id === selectedTimesheetForReject)?.employee_id;
            if (!employeeId) {
                throw new Error('Employee ID not found');
            }

            await axios.post(`/employees/${employeeId}/timesheets/${selectedTimesheetForReject}/reject`, {
                reason: rejectReason,
            });
            toast({
                title: t('toast_success'),
                description: t('toast_reject_success'), // TODO: Add 'toast_reject_success'
            });
            setShowRejectDialog(false);
            fetchPendingTimesheets();
        } catch (error) {
            console.error('Error rejecting timesheet:', error);
            toast({
                title: t('toast_error'),
                description: t('toast_failed_reject'), // TODO: Add 'toast_failed_reject'
                variant: 'destructive',
            });
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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('ttl_pending_timesheet_approvals')}</CardTitle>
                            <CardDescription>
                                {t('desc_approve_or_reject_timesheet')} {/* TODO: Add 'desc_approve_or_reject_timesheet' */}
                            </CardDescription>
                        </div>
                        {selectedTimesheets.length > 0 && (
                            <Button onClick={handleApproveSelected} disabled={isLoading}>
                                <Check className="mr-2 h-4 w-4" />
                                {t('btn_approve_selected', { count: selectedTimesheets.length })} {/* TODO: Add 'btn_approve_selected' with count */}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : timesheets.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">{t('msg_no_pending_timesheets')}</div>
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
                                        <TableHead>{t('lbl_employee')}</TableHead>
                                        <TableHead>{t('lbl_position')}</TableHead> {/* TODO: Add 'lbl_position' */}
                                        <TableHead>{t('lbl_date')}</TableHead>
                                        <TableHead>{t('lbl_clock_in_out')}</TableHead> {/* TODO: Add 'lbl_clock_in_out' */}
                                        <TableHead>{t('lbl_hours')}</TableHead>
                                        <TableHead>{t('lbl_project')}</TableHead>
                                        <TableHead>{t('lbl_notes')}</TableHead>
                                        <TableHead className="text-right">{t('lbl_actions')}</TableHead>
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
                                            <TableCell>{timesheet.date ? format(new Date(timesheet.date), 'MMM d, yyyy') : '-'}</TableCell>
                                            <TableCell>
                                                <div>{formatDateTime(timesheet.clock_in)}</div>
                                                <div>{formatDateTime(timesheet.clock_out)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {t('lbl_regular')}: {formatHours(timesheet.regular_hours)}
                                                </div>
                                                <div>
                                                    {t('lbl_ot')}: {formatHours(timesheet.overtime_hours)}
                                                </div>
                                                <div className="font-bold">
                                                    {t('lbl_total')}: {formatHours(timesheet.total_hours)}
                                                </div>{' '}
                                                {/* TODO: Add 'lbl_total' */}
                                            </TableCell>
                                            <TableCell>{timesheet.project ? timesheet.project.name : '-'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{timesheet.notes || '-'}</TableCell>
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
