import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  User,
  X,
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { getTranslation } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Project {
  id: number;
  name: string;
  location: string;
}

interface Employee {
  id: number;
  file_number: string;
  first_name: string;
  last_name: string;
  position?: {
    id: number;
    name: string;
  };
}

interface TimesheetEntry {
  id: number;
  employee_id: number;
  project_id: number;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  hours_worked: number;
  overtime_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  notes?: string;
  employee?: Employee;
  project?: Project;
  created_at: string;
  updated_at: string;
}

interface TimesheetApprovalProps {
  initialEntries?: TimesheetEntry[];
}

export const TimesheetApproval: React.FC<TimesheetApprovalProps> = ({
  initialEntries = []
}) => {
  const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
  const [loading, setLoading] = useState(!initialEntries.length);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimesheetEntry | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [filter, setFilter] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    employee_id: 'all',
    project_id: 'all'
  })

  useEffect(() => {
    if (!initialEntries.length) {
      fetchTimesheetEntries();
    }
    fetchProjects();
    fetchEmployees();
  }, [initialEntries]);

  const fetchTimesheetEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/timesheets/pending-approval', {
        params: filter
      })
      setEntries(response.data.data);
    } catch (error) {
      console.error('Error fetching timesheet entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
  const { t } = useTranslation('employee');

    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchTimesheetEntries();
    setSelectedEntries([]);
  };

  const viewEntryDetails = (entry: TimesheetEntry) => {
    setCurrentEntry(entry);
    setDetailDialogOpen(true);
  };

  const approveEntry = async (entryId: number) => {
    try {
      const response = await axios.post(`/api/timesheets/${entryId}/approve`);

      // Update the entry in the list
      setEntries(prev =>
        prev.map(entry =>
          entry.id === entryId ? { ...entry, status: 'approved' } : entry
        )
      );

      // Close the detail dialog if open
      if (detailDialogOpen && currentEntry?.id === entryId) {
        setDetailDialogOpen(false);
      }

      // Remove from selected entries if it was selected
      setSelectedEntries(prev => prev.filter(id => id !== entryId));

    } catch (error) {
      console.error('Error approving timesheet entry:', error);
    }
  };

  const openRejectDialog = (entry: TimesheetEntry) => {
    setCurrentEntry(entry);
    setRejectionNote('');
    setRejectDialogOpen(true);
  };

  const rejectEntry = async () => {
    if (!currentEntry) return;

    try {
      const response = await axios.post(`/api/timesheets/${currentEntry.id}/reject`, {
        notes: rejectionNote
      })

      // Update the entry in the list
      setEntries(prev =>
        prev.map(entry =>
          entry.id === currentEntry.id ? { ...entry, status: 'rejected', notes: rejectionNote } : entry
        )
      );

      // Close dialogs
      setRejectDialogOpen(false);
      setDetailDialogOpen(false);

      // Remove from selected entries if it was selected
      setSelectedEntries(prev => prev.filter(id => id !== currentEntry.id));

    } catch (error) {
      console.error('Error rejecting timesheet entry:', error);
    }
  };

  const toggleEntrySelection = (entryId: number) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    })
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === entries.filter(e => e.status === 'pending').length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.filter(e => e.status === 'pending').map(e => e.id));
    }
  };

  const openBulkActionDialog = (action: 'approve' | 'reject') => {
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  const executeBulkAction = async () => {
    if (selectedEntries.length === 0) return;

    try {
      if (bulkAction === 'approve') {
        await axios.post('/api/timesheets/bulk-approve', {
          entry_ids: selectedEntries
        })

        // Update entries in the list
        setEntries(prev =>
          prev.map(entry =>
            selectedEntries.includes(entry.id) ? { ...entry, status: 'approved' } : entry
          )
        );
      } else {
        await axios.post('/api/timesheets/bulk-reject', {
          entry_ids: selectedEntries,
          notes: rejectionNote
        })

        // Update entries in the list
        setEntries(prev =>
          prev.map(entry =>
            selectedEntries.includes(entry.id) ? { ...entry, status: 'rejected', notes: rejectionNote } : entry
          )
        );
      }

      // Clear selection and close dialog
      setSelectedEntries([]);
      setBulkActionDialogOpen(false);
      setRejectionNote('');

    } catch (error) {
      console.error(`Error performing bulk ${bulkAction}:`, error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getEmployeeName = (employee?: Employee) => {
    if (!employee) return 'Unknown';
    return `${employee.first_name} ${employee.last_name}`;
  };

  const pendingEntriesCount = entries.filter(entry => entry.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('ttl_timesheet_approval')}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {pendingEntriesCount} pending timesheet entries require approval
              </p>
            </div>

            {selectedEntries.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openBulkActionDialog('approve')}
                  className="flex items-center gap-1"
                >
                  {<Check className="h-4 w-4" />}
                  Approve Selected ({selectedEntries.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openBulkActionDialog('reject')}
                  className="flex items-center gap-1"
                >
                  {<X className="h-4 w-4" />}
                  Reject Selected ({selectedEntries.length})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium">{t('filter_timesheet_entries')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="start-date-filter">{t('lbl_start_date')}</Label>
                  <Input
                    id="start-date-filter"
                    type="date"
                    value={filter.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end-date-filter">{t('lbl_end_date')}</Label>
                  <Input
                    id="end-date-filter"
                    type="date"
                    value={filter.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('opt_all_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employee-filter">Employee</Label>
                  <Select
                    value={filter.employee_id}
                    onValueChange={(value) => handleFilterChange('employee_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('opt_all_employees')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_employees')}</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {getEmployeeName(employee)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project-filter">Project</Label>
                  <Select
                    value={filter.project_id}
                    onValueChange={(value) => handleFilterChange('project_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('opt_all_projects')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_projects')}</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={pendingEntriesCount > 0 && selectedEntries.length === pendingEntriesCount}
                        onCheckedChange={toggleSelectAll}
                        disabled={pendingEntriesCount === 0}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Time & Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                          Loading timesheet entries...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <p className="text-gray-500 mb-2">No timesheet entries found.</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.status === 'pending' && (
                            <Checkbox
                              checked={selectedEntries.includes(entry.id)}
                              onCheckedChange={() => toggleEntrySelection(entry.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">{getEmployeeName(entry.employee)}</div>
                              <div className="text-xs text-gray-500">{entry.employee?.position?.name || '-'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="font-medium">{entry.project?.name || 'Unknown Project'}</div>
                          <div className="text-xs text-gray-500">{entry.project?.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{entry.start_time} - {entry.end_time}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{entry.hours_worked}</span> hrs
                            {entry.overtime_hours > 0 && (
                              <span className="ml-1 text-orange-600">(+{entry.overtime_hours} OT)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(entry.status)}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                          {entry.notes && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Has notes
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('ttl_view_details')}
                              onClick={() => viewEntryDetails(entry)}
                            >
                              {<Eye className="h-4 w-4" />}
                            </Button>

                            {entry.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title={t('ttl_approve')}
                                    onClick={() => approveEntry(entry.id)}
                                    className="text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title={t('ttl_reject')}
                                    onClick={() => openRejectDialog(entry)}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
              <div>
                Showing {entries.length} entries
              </div>

              <div className="rounded-md bg-gray-50 px-3 py-1.5">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium">Total Hours:</span> {entries.reduce((acc, entry) => acc + entry.hours_worked + entry.overtime_hours, 0).toFixed(2)} hrs
                  </div>
                  <div>
                    <span className="font-medium">Pending:</span> {pendingEntriesCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('ttl_timesheet_entry_details')}</DialogTitle>
            <DialogDescription>
              Review the details of this timesheet entry.
            </DialogDescription>
          </DialogHeader>

          {currentEntry && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{getEmployeeName(currentEntry.employee)}</h3>
                  <p className="text-gray-500">{currentEntry.employee?.position?.name}</p>
                </div>
                <Badge variant="outline" className={getStatusBadgeColor(currentEntry.status)}>
                  {currentEntry.status.charAt(0).toUpperCase() + currentEntry.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-gray-50 p-3">
                  <h4 className="text-sm font-medium mb-2">Date & Time</h4>
                  <p className="text-sm">{format(new Date(currentEntry.date), 'MMMM d, yyyy')}</p>
                  <p className="text-sm">{currentEntry.start_time} - {currentEntry.end_time}</p>
                  <p className="text-sm">{currentEntry.break_duration} min break</p>
                </div>

                <div className="rounded-md bg-gray-50 p-3">
                  <h4 className="text-sm font-medium mb-2">Hours</h4>
                  <p className="text-sm">Regular: {currentEntry.hours_worked} hrs</p>
                  <p className="text-sm">Overtime: {currentEntry.overtime_hours} hrs</p>
                  <p className="text-sm font-medium mt-1">
                    Total: {(currentEntry.hours_worked + currentEntry.overtime_hours).toFixed(2)} hrs
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-gray-50 p-3">
                <h4 className="text-sm font-medium mb-2">Project</h4>
                <p className="text-sm font-medium">{currentEntry.project?.name || 'Unknown Project'}</p>
                <p className="text-sm">{currentEntry.project?.location}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <div className="rounded-md border p-3 bg-white">
                  <p className="text-sm">
                    {currentEntry.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {currentEntry.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <div className="rounded-md border p-3 bg-white">
                    <p className="text-sm">{currentEntry.notes}</p>
                  </div>
                </div>
              )}

              {currentEntry.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => openRejectDialog(currentEntry)}
                    className="flex items-center gap-1"
                  >
                    {<X className="h-4 w-4" />}
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveEntry(currentEntry.id)}
                    className="flex items-center gap-1"
                  >
                    {<Check className="h-4 w-4" />}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Entry Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ttl_reject_timesheet_entry')}</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this timesheet entry.
              The employee will be notified of the rejection and the reason.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="rejection-note">{t('lbl_rejection_reason')}</Label>
            <Textarea
              id="rejection-note"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder={t('ph_enter_reason_for_rejection')}
              className="mt-1"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={rejectEntry}
              className="bg-red-500 hover:bg-red-600"
              disabled={!rejectionNote.trim()}
            >
              Reject Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'approve' ? 'Approve Selected Entries' : 'Reject Selected Entries'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEntries.length} timesheet entries will be {bulkAction === 'approve' ? 'approved' : 'rejected'}.
              {bulkAction === 'reject' && ' Please provide a reason for the rejection.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {bulkAction === 'reject' && (
            <div className="py-4">
              <Label htmlFor="bulk-rejection-note">{t('lbl_rejection_reason')}</Label>
              <Textarea
                id="bulk-rejection-note"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder={t('ph_enter_reason_for_rejection')}
                className="mt-1"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              className={bulkAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
              disabled={bulkAction === 'reject' && !rejectionNote.trim()}
            >
              {bulkAction === 'approve' ? 'Approve Selected' : 'Reject Selected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimesheetApproval;
















