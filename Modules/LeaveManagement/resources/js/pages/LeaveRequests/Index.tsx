import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    RotateCw as ArrowPathIcon,
    Check as CheckIcon,
    Eye as EyeIcon,
    Pencil as PencilIcon,
    Plus as PlusIcon,
    Search as SearchIcon,
    Trash as TrashIcon,
    X as XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from '@/Core';

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
    const isAdmin =
        Array.isArray(hasRole) &&
        hasRole.some((role) => role && (role === 'admin' || role === 'Admin' || role.name === 'admin' || role.name === 'Admin'));
    const hasPermissionFn = (permission: string): boolean => {
        if (!permission) return false;
        if (isAdmin) return true;
        return Array.isArray(hasPermission) && hasPermission.some((perm) => perm === permission || (perm && perm.name === permission));
    };
    return { hasPermission: hasPermissionFn, isAdmin };
}

// Define a local formatDate utility if needed
const formatDate = (dateString: string) => new Date(dateString);

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Requests', href: '/leaves' },
];

export default function LeaveRequestsIndex({
    auth,
    leaveRequests,
    filters = { status: 'all', search: '' },
}: {
    auth: any;
    leaveRequests: any;
    filters?: { status?: string; search?: string };
}) {
    const { t } = useTranslation('leave');
    const { hasPermission, isAdmin } = usePermission();
    const [processing, setProcessing] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [leaveRequestToDelete, setLeaveRequestToDelete] = useState<number | null>(null);
    const leaveRequestsData = leaveRequests?.data || [];
    const perPage = leaveRequests?.per_page || 10;
    const currentPage = leaveRequests?.current_page || 1;
    const totalPages = leaveRequests?.last_page || 1;
    const paginatedLeaveRequests = leaveRequestsData;

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
        router.get(
            route('leaves.requests.index'),
            {
                search: searchTerm,
                status: selectedStatus === 'all' ? undefined : selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        router.get(
            route('leaves.requests.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
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
        router.put(
            route('leaves.requests.approve', id),
            {},
            {
                onSuccess: () => {
                    // ToastService.success("Leave request approved successfully");
                    setProcessing(null);
                },
                onError: (errors) => {
                    // ToastService.error(errors.error || 'Failed to approve leave request');
                    setProcessing(null);
                },
            },
        );
    };

    const handleReject = (id: number) => {
        setProcessing(id);
        router.put(
            route('leaves.requests.reject', id),
            {},
            {
                onSuccess: () => {
                    // ToastService.success("Leave request rejected successfully");
                    setProcessing(null);
                },
                onError: (errors) => {
                    // ToastService.error(errors.error || 'Failed to reject leave request');
                    setProcessing(null);
                },
            },
        );
    };

    return (
        <TooltipProvider>
            <Head title="Leave Requests" />

            <AppLayout title="Leave Requests" requiredPermission="leave-requests.view" breadcrumbs={breadcrumbs}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Leave Requests</CardTitle>
                                    <CardDescription>Manage and track employee leave requests</CardDescription>
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
                                        <SearchIcon className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                                            <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Leave Type</th>
                                            <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                                            <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Date</th>
                                            <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                        {paginatedLeaveRequests.length > 0 ? (
                                            paginatedLeaveRequests.map((leave: any) => (
                                                <tr key={leave.id} className="align-top">
                                                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : leave.employee_id}</td>
                                                    <td className="px-2 py-2 whitespace-nowrap text-sm">{leave.leave_type}</td>
                                                    <td className="px-2 py-2 whitespace-nowrap text-sm">{leave.start_date}</td>
                                                    <td className="px-2 py-2 whitespace-nowrap text-sm">{leave.end_date}</td>
                                                    <td className="px-2 py-2 whitespace-nowrap text-sm">{getStatusBadge(leave.status)}</td>
                                                    <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                        <a href={window.route('leaves.requests.show', leave.id)}>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                        {canEditLeaveRequest && (
                                                            <a href={window.route('leaves.requests.edit', leave.id)}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                        )}
                                                        {canDeleteLeaveRequest && (
                                                            <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(leave.id)}>
                                                                <TrashIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-4 text-center">No leave requests found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {leaveRequestsData.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(leaveRequests.current_page - 1) * leaveRequests.per_page + 1} to {Math.min(leaveRequests.current_page * leaveRequests.per_page, leaveRequests.total)} of {leaveRequests.total} results
                                    <div className="mt-1 text-xs opacity-60">
                                        Page {leaveRequests.current_page} of {leaveRequests.last_page}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4 sm:flex-row">
                                    {/* Per Page Selector */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">Show:</span>
                                        <Select value={perPage.toString()} onValueChange={(v) => {
                                            setPerPage(Number(v));
                                            router.get(route('leaves.requests.index'), { page: 1, perPage: Number(v), search: searchTerm, status: selectedStatus }, { preserveState: true, replace: true });
                                        }}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Page Navigation */}
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={leaveRequests.current_page === 1}
                                            onClick={() => router.get(route('leaves.requests.index'), { page: leaveRequests.current_page - 1, perPage, search: searchTerm, status: selectedStatus }, { preserveState: true, replace: true })}
                                        >
                                            Previous
                                        </Button>
                                        {leaveRequests.last_page > 1 && (
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, leaveRequests.last_page) }, (_, i) => {
                                                    let pageNumber;
                                                    if (leaveRequests.last_page <= 5) {
                                                        pageNumber = i + 1;
                                                    } else {
                                                        if (leaveRequests.current_page <= 3) {
                                                            pageNumber = i + 1;
                                                        } else if (leaveRequests.current_page >= leaveRequests.last_page - 2) {
                                                            pageNumber = leaveRequests.last_page - 4 + i;
                                                        } else {
                                                            pageNumber = leaveRequests.current_page - 2 + i;
                                                        }
                                                    }
                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={pageNumber === leaveRequests.current_page ? 'default' : 'outline'}
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => router.get(route('leaves.requests.index'), { page: pageNumber, perPage, search: searchTerm, status: selectedStatus }, { preserveState: true, replace: true })}
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={leaveRequests.current_page === leaveRequests.last_page}
                                            onClick={() => router.get(route('leaves.requests.index'), { page: leaveRequests.current_page + 1, perPage, search: searchTerm, status: selectedStatus }, { preserveState: true, replace: true })}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Leave Request</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this leave request? This action cannot be undone.</DialogDescription>
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
