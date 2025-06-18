import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';
import {
  Plus as PlusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  RotateCw as ArrowPathIcon,
  Check as CheckIcon,
  X as XIcon
} from 'lucide-react';

// Define the LeaveRequest interface here to ensure it has all required properties
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  employee?: Employee;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes?: string;
  status: string;
}

// Temporary inline implementation of usePermission hook
function usePermission() {
  const { t } = useTranslation('leave');

  const { props } = usePage();
  const auth = (props?.auth || {}) as Record<string, any>;
  // DEBUG: Log the full auth object
  console.log('auth object:', auth);
  const hasRole = auth.hasRole || (auth.user && auth.user.roles) || [];
  const hasPermission = auth.hasPermission || (auth.user && auth.user.permissions) || [];
  // DEBUG: Log roles and permissions arrays
  console.log('roles:', hasRole, 'permissions:', hasPermission);
  const isAdmin = Array.isArray(hasRole) && hasRole.some(role => role && (role === 'admin' || role === 'Admin' || role.name === 'admin' || role.name === 'Admin'));
  const hasPermissionFn = (permission: string): boolean => {
    if (!permission) return false;
    if (isAdmin) return true;
    return Array.isArray(hasPermission) && hasPermission.some(
      perm => perm === permission || (perm && perm.name === permission)
    );
  };
  return { hasPermission: hasPermissionFn, isAdmin };
}

// Define a local formatDate utility if needed
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Leave Requests', href: '/leaves' },
];

export default function LeaveRequestsIndex({ auth, leaveRequests, filters = { status: 'all', search: '' } }: { auth: any, leaveRequests: any, filters?: { status?: string, search?: string } }) {
  const { t } = useTranslation('leave');
  const { hasPermission, isAdmin } = usePermission();
  const [processing, setProcessing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveRequestToDelete, setLeaveRequestToDelete] = useState<number | null>(null);

  // Ensure leaveRequests.data is always an array
  const leaveRequestsData = leaveRequests?.data || [];

  const canCreateLeaveRequest = hasPermission('leave-requests.create');
  const canEditLeaveRequest = hasPermission('leave-requests.edit');
  const canDeleteLeaveRequest = hasPermission('leave-requests.delete');
  const canApproveLeaveRequest = hasPermission('leave-requests.approve');
  const canViewLeaveRequest = hasPermission('leave-requests.view');

  // DEBUG: Log permission values
  console.log('isAdmin:', isAdmin, 'canCreateLeaveRequest:', canCreateLeaveRequest);

  const handleSearch = () => {
    router.get('#', {
      search: searchTerm,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    router.get('#', {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = (id: number) => {
    setLeaveRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!leaveRequestToDelete) return;

    router.delete('#', {
      preserveState: false,
      preserveScroll: false,
      onSuccess: () => {
        // ToastService.success("Leave request deleted successfully");
        router.visit('#');
      },
      onError: (errors) => {
        // ToastService.error(errors.error || 'Failed to delete leave request');
      },
    });
    setDeleteDialogOpen(false);
    setLeaveRequestToDelete(null);
  };

  const handleApprove = (id: number) => {
    setProcessing(id);
    router.put('#', {}, {
      onSuccess: () => {
        // ToastService.success("Leave request approved successfully");
        setProcessing(null);
      },
      onError: (errors) => {
        // ToastService.error(errors.error || 'Failed to approve leave request');
        setProcessing(null);
      },
    });
  };

  const handleReject = (id: number) => {
    setProcessing(id);
    router.put('#', {}, {
      onSuccess: () => {
        // ToastService.success("Leave request rejected successfully");
        setProcessing(null);
      },
      onError: (errors) => {
        // ToastService.error(errors.error || 'Failed to reject leave request');
        setProcessing(null);
      },
    });
  };

  return (
    <>
      <Head title={t('ttl_leave_requests')} />

      <AdminLayout title={t('ttl_leave_requests')} requiredPermission="leave-requests.view" breadcrumbs={breadcrumbs}>
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">{t('ttl_leave_requests')}</CardTitle>
              <div className="flex items-center space-x-2">
                {canCreateLeaveRequest && (
                  <Button asChild>
                    <Link href="#">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Request
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    placeholder={t('ph_search_by_employee_name')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('ph_filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch}>
                    Search
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    <ArrowPathIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>{t('th_leave_type')}</TableHead>
                      <TableHead>{t('th_start_date')}</TableHead>
                      <TableHead>{t('th_end_date')}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequestsData.length > 0 ? (
                      leaveRequestsData.map((request: LeaveRequest) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.employee ? `${request.employee.first_name} ${request.employee.last_name}` : 'N/A'}
                          </TableCell>
                          <TableCell>{request.leave_type}</TableCell>
                          <TableCell>{formatDate(request.start_date)}</TableCell>
                          <TableCell>{formatDate(request.end_date)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            {canViewLeaveRequest && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => router.get('#')}>
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                            )}
                            {canEditLeaveRequest && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => router.get('#')}>
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            )}
                            {canDeleteLeaveRequest && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(request.id)}>
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            )}
                            {canApproveLeaveRequest && request.status.toLowerCase() === 'pending' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleApprove(request.id)}>
                                    <CheckIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Approve</TooltipContent>
                              </Tooltip>
                            )}
                            {canApproveLeaveRequest && request.status.toLowerCase() === 'pending' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleReject(request.id)}>
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reject</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No leave requests found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the leave request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose onClick={() => setLeaveRequestToDelete(null)}>Cancel</DialogClose>
            <DialogClose onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
