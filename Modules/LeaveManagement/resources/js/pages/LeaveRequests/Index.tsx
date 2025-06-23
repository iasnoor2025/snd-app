import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Core";
import { Input } from "@/Core";
import { Badge } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Core";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Core";
import { AppLayout } from '@/Core';
import {
  Plus as PlusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  RotateCw as ArrowPathIcon,
  Check as CheckIcon,
  X as XIcon,
  Search as SearchIcon
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

  // Helper function for translations with fallbacks
  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation && translation !== key ? translation : fallback;
  };

  const handleSearch = () => {
    router.get(route('leaves.requests.index'), {
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
    router.get(route('leaves.requests.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
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

    router.delete(route('leaves.requests.destroy', leaveRequestToDelete), {
      preserveState: false,
      preserveScroll: false,
      onSuccess: () => {
        // ToastService.success("Leave request deleted successfully");
        router.visit(route('leaves.requests.index'));
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
    router.put(route('leaves.requests.approve', id), {}, {
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
    router.put(route('leaves.requests.reject', id), {}, {
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
    <TooltipProvider>
      <Head title="Leave Requests" />

      <AppLayout 
        title="Leave Requests" 
        requiredPermission="leave-requests.view" 
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Leave Requests</CardTitle>
                  <CardDescription>
                    Manage and track employee leave requests
                  </CardDescription>
                </div>
                {canCreateLeaveRequest && (
                  <Button asChild>
                    <Link href={route('leaves.requests.create')}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Request
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center space-x-2">
                  <Input
                    placeholder="Search by employee name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="max-w-sm"
                  />
                  <Button onClick={handleSearch} size="sm">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={resetFilters} size="sm">
                    <ArrowPathIcon className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
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
                            <div className="flex items-center justify-end space-x-1">
                              {canViewLeaveRequest && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => router.get(route('leaves.requests.show', request.id))}
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              )}
                              {canEditLeaveRequest && request.status.toLowerCase() === 'pending' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => router.get(route('leaves.requests.edit', request.id))}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Request</TooltipContent>
                                </Tooltip>
                              )}
                              {canApproveLeaveRequest && request.status.toLowerCase() === 'pending' && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processing === request.id}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleReject(request.id)}
                                        disabled={processing === request.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              {canDeleteLeaveRequest && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleDelete(request.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Request</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="text-muted-foreground">No leave requests found.</div>
                            {canCreateLeaveRequest && (
                              <Button asChild variant="outline" size="sm">
                                <Link href={route('leaves.requests.create')}>
                                  <PlusIcon className="mr-2 h-4 w-4" />
                                  Create First Request
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}














