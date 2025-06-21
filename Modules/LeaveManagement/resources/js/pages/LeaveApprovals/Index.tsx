import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye as EyeIcon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
  Filter as FilterIcon,
  CheckSquare as CheckSquareIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import { format } from 'date-fns';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
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
}

interface PageProps {
  pendingRequests: {
    data: LeaveRequest[];
    links: any[];
    meta: any;
  };
  employees: Employee[];
  filters: {
    employee_id?: string;
    leave_type?: string;
    date_from?: string;
    date_to?: string;
  };
}

const LeaveApprovalsIndex: React.FC = () => {
  const { pendingRequests, employees, filters } = usePage<PageProps>().props;
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [bulkApprovalNotes, setBulkApprovalNotes] = useState('');
  const [showBulkApprovalDialog, setShowBulkApprovalDialog] = useState(false);
  const [filterForm, setFilterForm] = useState({
    employee_id: filters.employee_id || '',
    leave_type: filters.leave_type || '',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  });

  const handleFilter = () => {
  const { t } = useTranslation('leave');

    router.get(route('leaves.approvals.index'), {
      ...Object.fromEntries(
        Object.entries(filterForm).filter(([_, value]) => value !== '')
      ),
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setFilterForm({
      employee_id: '',
      leave_type: '',
      date_from: '',
      date_to: '',
    });
    router.get(route('leaves.approvals.index'));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(pendingRequests.data.map(request => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) return;

    router.post(route('leaves.approvals.bulk-approve'), {
      request_ids: selectedRequests,
      approval_notes: bulkApprovalNotes,
    }, {
      onSuccess: () => {
        setSelectedRequests([]);
        setBulkApprovalNotes('');
        setShowBulkApprovalDialog(false);
      },
    });
  };

  const handleQuickApprove = (requestId: number) => {
    router.post(route('leaves.approvals.approve', requestId), {
      approval_notes: ''
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
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

  const leaveTypes = [
    'annual', 'sick', 'personal', 'maternity', 'hajj', 'umrah', 'unpaid', 'other'
  ];

  return (
    <AdminLayout>
      <Head title={t('leave_approvals')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('leave_approvals')}</h1>
            <p className="text-muted-foreground">
              Review and approve pending leave requests
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedRequests.length > 0 && (
              <Dialog open={showBulkApprovalDialog} onOpenChange={setShowBulkApprovalDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <CheckSquareIcon className="h-4 w-4 mr-2" />
                    Bulk Approve ({selectedRequests.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('ttl_bulk_approve_leave_requests')}</DialogTitle>
                    <DialogDescription>
                      You are about to approve {selectedRequests.length} leave request(s).
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Approval Notes (Optional)</label>
                      <Textarea
                        value={bulkApprovalNotes}
                        onChange={(e) => setBulkApprovalNotes(e.target.value)}
                        placeholder={t('ph_add_any_notes_for_the_approval')}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkApprovalDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkApprove}>
                      Approve All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_pending_requests')}</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.meta.total}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <CheckSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready for bulk action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(pendingRequests.data.map(r => r.employee_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                With pending requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Employee</label>
                <Select
                  value={filterForm.employee_id}
                  onValueChange={(value) => setFilterForm(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('opt_all_employees_2')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('opt_all_employees')}</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('lbl_leave_type')}</label>
                <Select
                  value={filterForm.leave_type}
                  onValueChange={(value) => setFilterForm(prev => ({ ...prev, leave_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ph_all_types')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('opt_all_types')}</SelectItem>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('lbl_from_date')}</label>
                <Input
                  type="date"
                  value={filterForm.date_from}
                  onChange={(e) => setFilterForm(prev => ({ ...prev, date_from: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('lbl_to_date')}</label>
                <Input
                  type="date"
                  value={filterForm.date_to}
                  onChange={(e) => setFilterForm(prev => ({ ...prev, date_to: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter} variant="default">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_pending_leave_requests')}</CardTitle>
            <CardDescription>
              Review and approve employee leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRequests.length === pendingRequests.data.length && pendingRequests.data.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>{t('lbl_leave_type')}</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.data.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={(checked) => handleSelectRequest(request.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {request.employee?.first_name} {request.employee?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.employee?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLeaveTypeColor(request.leave_type)}>
                          {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(request.start_date)}</div>
                          <div className="text-muted-foreground">to {formatDate(request.end_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {calculateDays(request.start_date, request.end_date)} days
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(request.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <Link href={route('leaves.approvals.show', request.id)}>
                                    <EyeIcon className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('view_details')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuickApprove(request.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('quick_approve')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pendingRequests.data.length === 0 && (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending leave requests found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All requests have been processed or no requests match your filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pendingRequests.links && pendingRequests.links.length > 3 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {pendingRequests.meta.from} to {pendingRequests.meta.to} of {pendingRequests.meta.total} results
                </div>
                <div className="flex space-x-1">
                  {pendingRequests.links.map((link: any, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default LeaveApprovalsIndex;














