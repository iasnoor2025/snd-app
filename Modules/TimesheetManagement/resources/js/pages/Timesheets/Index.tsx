import { AppLayout, CreateButton, CrudButtons, usePermission } from '@/Core';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Core/components/ui/select';
import { Badge } from '@/Core/components/ui/badge';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import {
    Dialog as AlertDialog,
    DialogContent as AlertDialogContent,
    DialogDescription as AlertDialogDescription,
    DialogTitle as AlertDialogTitle,
    DialogTrigger as AlertDialogTrigger,
} from '@/Core/components/ui/dialog';
import { Input } from '@/Core/components/ui/input';
import { Table as ReactTable } from '@/Core/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Core/components/ui/tooltip';
import { BreadcrumbItem, PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Check as CheckIcon, Trash as TrashIcon, X as XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { ApprovalDialog } from '../../components/ApprovalDialog';
import { Eye, Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Permission } from '@/Core';
import { Checkbox } from '@/Core/components/ui/checkbox';
import { DatePicker } from '@/Core/components/ui/date-picker';
import axios from 'axios';

// Define the Timesheet interface here to ensure it has all required properties
interface Project {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    assignments?: Assignment[];
}

interface Assignment {
    id: number;
    type: string;
    name: string;
    status: string;
    location?: string;
    start_date: string;
    end_date?: string;
    project?: Project;
    rental?: {
        id: number;
        rental_number?: string;
        project_name?: string;
    };
}

interface Timesheet {
    id: number;
    employee_id: number;
    employee?: Employee;
    date: string;
    hours_worked: number;
    overtime_hours: number;
    project_id?: number;
    project?: Project;
    rental?: {
        equipment?: {
            name?: string;
        };
    };
    location?: string;
    description?: string;
    tasks_completed?: string;
    status: string;
    start_address?: string;
    end_address?: string;
}

interface Props extends PageProps {
    timesheets: {
        data: Timesheet[];
        current_page: number;
        per_page: number;
        last_page: number;
        total: number;
    };
    filters?: {
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
}

export default function TimesheetsIndex({ timesheets, filters = { status: 'all', search: '', date_from: '', date_to: '', per_page: 15 } }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: 'Timesheets', href: '/timesheets' },
    ];

    const { hasPermission, hasRole } = usePermission();
    const canBulkSubmit =
        hasPermission('timesheets.submit') || ['admin', 'hr', 'foreman', 'timesheet_incharge', 'manager'].some((role) => hasRole(role));
    const canBulkDelete = hasPermission('timesheets.delete') || hasRole('admin');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [startDate, setStartDate] = useState<Date | undefined>(filters.date_from ? new Date(filters.date_from) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.date_to ? new Date(filters.date_to) : undefined);
    const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
    const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [showBulkSubmitDialog, setShowBulkSubmitDialog] = useState(false);
    const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
    const isFirstMount = useRef(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortField, setSortField] = useState<'date' | null>('date');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    useEffect(() => {
        if (isFirstMount.current) {
            setSearchTerm(filters.search || '');
            setSelectedStatus(filters.status || 'all');
            setStartDate(filters.date_from ? new Date(filters.date_from) : undefined);
            setEndDate(filters.date_to ? new Date(filters.date_to) : undefined);
            setPerPage(filters.per_page || 15);
            isFirstMount.current = false;
        }
    }, [filters]);

    // Ensure timesheets.data is always an array
    const timesheetsData = timesheets?.data || [];

    // Sort timesheetsData by date
    const sortedTimesheetsData = [...timesheetsData].sort((a, b) => {
        if (sortField === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
    });

    // Fix: Table expects sortKey as string, not null
    const tableSortKey = sortField || 'date';

    // Fix: Table expects onSort as (key: string, direction: 'asc' | 'desc') => void
    const handleTableSort = (key: string, direction: 'asc' | 'desc') => {
        setSortField(key as 'date');
        setSortOrder(direction);
    };

    const canApproveTimesheet = hasPermission('timesheets.approve');
    const canDeleteTimesheet = hasPermission('timesheets.delete');

    const canApproveRow = (row: Timesheet) => (
        (row.status === 'submitted' && hasPermission('timesheets.approve')) ||
        (row.status === 'foreman_approved' && (hasPermission('timesheets.approve.incharge') || hasPermission('timesheets.approve'))) ||
        (row.status === 'incharge_approved' && (hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve'))) ||
        (row.status === 'checking_approved' && (hasPermission('timesheets.approve.manager') || hasPermission('timesheets.approve')))
    );

    // Determine if user is admin
    // const isAdmin = auth?.user?.roles?.includes('admin');

    // Accept page as argument for reloadPage
    const reloadPage = (page = timesheets.current_page) => {
        router.get(
            route('timesheets.index'),
            {
                page,
                search: searchTerm,
                status: selectedStatus,
                date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => setSelectedTimesheets([]),
            },
        );
    };

    // Restore missing functions and logic, using canBulkSubmit instead of isAdmin
    const handleBulkApprove = () => {
        if (selectedTimesheets.length === 0) {
            toast('Please select at least one timesheet to approve');
            return;
        }
        if (confirm(`Are you sure you want to approve ${selectedTimesheets.length} selected timesheets?`)) {
            setBulkProcessing(true);
            router.post(
                route('timesheets.bulk-approve'),
                {
                    timesheet_ids: selectedTimesheets,
                },
                {
                    onSuccess: () => {
                        toast(`${selectedTimesheets.length} timesheets approved successfully`);
                        setSelectedTimesheets([]);
                        setBulkProcessing(false);
                    },
                    onError: (errors: any) => {
                        toast(errors.error || 'Failed to approve timesheets');
                        setBulkProcessing(false);
                    },
                },
            );
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const handleSearch = () => {
        router.get(
            route('timesheets.index'),
            {
                search: searchTerm,
                status: selectedStatus,
                date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                per_page: perPage,
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
        setStartDate(undefined);
        setEndDate(undefined);
        setPerPage(15);
        router.get(
            route('timesheets.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            if (canBulkDelete) {
                // Admin or delete permission: select all timesheets
                setSelectedTimesheets(timesheetsData.map((ts) => ts.id));
            } else if (canBulkSubmit) {
                // Bulk submitter: select all eligible timesheets
                const eligible = timesheetsData.filter((ts) => ['draft', 'rejected', 'submitted'].includes(ts.status)).map((ts) => ts.id);
                setSelectedTimesheets(eligible);
            } else {
                // Non-bulk: select only submitted timesheets
                const submitted = timesheetsData.filter((ts) => ts.status === 'submitted').map((ts) => ts.id);
                setSelectedTimesheets(submitted);
            }
        } else {
            setSelectedTimesheets([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedTimesheets.length === 0) {
            toast(t('select_to_delete', 'Please select at least one timesheet to delete'));
            return;
        }
        setShowBulkDeleteDialog(true);
    };

    const handleSearchWithStatus = (status: string) => {
        router.get(
            route('timesheets.index'),
            {
                search: searchTerm,
                status: status,
                date_from: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                date_to: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Restore toggleTimesheetSelection
    const toggleTimesheetSelection = (id: number, checked?: boolean | 'indeterminate') => {
        if (checked === undefined || checked === 'indeterminate') {
            setSelectedTimesheets((prev) => (prev.includes(id) ? prev.filter((timesheetId) => timesheetId !== id) : [...prev, id]));
        } else if (checked) {
            setSelectedTimesheets((prev) => (prev.includes(id) ? prev : [...prev, id]));
        } else {
            setSelectedTimesheets((prev) => prev.filter((timesheetId) => timesheetId !== id));
        }
    };
    // Restore getStatusBadge
    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'manager_approved':
                return (
                    <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                        Approved
                    </Badge>
                );
            case 'foreman_approved':
                return (
                    <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                        Foreman Approved
                    </Badge>
                );
            case 'incharge_approved':
                return (
                    <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-800">
                        Incharge Approved
                    </Badge>
                );
            case 'checking_approved':
                return (
                    <Badge variant="outline" className="border-purple-200 bg-purple-100 text-purple-800">
                        Checking Approved
                    </Badge>
                );
            case 'submitted':
                return (
                    <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                        Submitted
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                        Rejected
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge variant="outline" className="border-gray-200 bg-gray-100 text-gray-800">
                        Draft
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status || 'Unknown'}</Badge>;
        }
    };

    // Determine the main bulk workflow action and label
    let bulkAction = () => {};
    let bulkLabel = '';
    let canBulkAct = false;
    if (selectedTimesheets.length > 0) {
        const selectedRows = timesheetsData.filter(ts => selectedTimesheets.includes(ts.id));
        const allDraftOrRejected = selectedRows.every(ts => ['draft', 'rejected'].includes(ts.status));
        const allSubmitted = selectedRows.every(ts => ts.status === 'submitted');
        const allForemanApproved = selectedRows.every(ts => ts.status === 'foreman_approved');
        const allInchargeApproved = selectedRows.every(ts => ts.status === 'incharge_approved');
        const allCheckingApproved = selectedRows.every(ts => ts.status === 'checking_approved');
        if (allDraftOrRejected && hasPermission('timesheets.edit')) {
            bulkLabel = 'Submit Selected';
            canBulkAct = true;
            bulkAction = async () => {
                setBulkProcessing(true);
                router.post(
                    route('timesheets.bulk-submit-web'),
                    { timesheet_ids: selectedTimesheets },
                    {
                        onSuccess: () => {
                            toast(`${selectedTimesheets.length} timesheets submitted successfully`);
                            setSelectedTimesheets([]);
                            setBulkProcessing(false);
                            reloadPage();
                        },
                        onError: (errors: any) => {
                            toast(errors.error || 'Failed to submit timesheets');
                            setBulkProcessing(false);
                        },
                    },
                );
            };
        } else if (allSubmitted && canApproveTimesheet) {
            bulkLabel = 'Foreman Approve Selected';
            canBulkAct = true;
            bulkAction = async () => {
                setBulkProcessing(true);
                router.post(
                    route('timesheets.bulk-approve-web'),
                    { timesheet_ids: selectedTimesheets },
                    {
                        onSuccess: () => {
                            toast(`${selectedTimesheets.length} timesheets foreman approved successfully`, { variant: 'success' });
                            setSelectedTimesheets([]);
                            setBulkProcessing(false);
                            reloadPage();
                        },
                        onError: (errors: any) => {
                            toast(errors.error || 'Failed to foreman approve timesheets');
                            setBulkProcessing(false);
                        },
                    },
                );
            };
        } else if (allForemanApproved && (hasPermission('timesheets.approve.incharge') || hasPermission('timesheets.approve'))) {
            bulkLabel = 'Incharge Approve Selected';
            canBulkAct = true;
            bulkAction = async () => {
                setBulkProcessing(true);
                router.post(
                    route('timesheets.bulk-approve-incharge'),
                    { timesheet_ids: selectedTimesheets },
                    {
                        onSuccess: () => {
                            toast(`${selectedTimesheets.length} timesheets incharge approved successfully`, { variant: 'success' });
                            setSelectedTimesheets([]);
                            setBulkProcessing(false);
                            reloadPage();
                        },
                        onError: (errors: any) => {
                            toast(errors.error || 'Failed to incharge approve timesheets');
                            setBulkProcessing(false);
                        },
                    },
                );
            };
        } else if (allInchargeApproved && (hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve'))) {
            bulkLabel = 'Checking Approve Selected';
            canBulkAct = true;
            bulkAction = async () => {
                setBulkProcessing(true);
                router.post(
                    route('timesheets.bulk-approve-checking'),
                    { timesheet_ids: selectedTimesheets },
                    {
                        onSuccess: () => {
                            toast(`${selectedTimesheets.length} timesheets checking approved successfully`, { variant: 'success' });
                            setSelectedTimesheets([]);
                            setBulkProcessing(false);
                            reloadPage();
                        },
                        onError: (errors: any) => {
                            toast(errors.error || 'Failed to checking approve timesheets');
                            setBulkProcessing(false);
                        },
                    },
                );
            };
        } else if (allCheckingApproved && (hasPermission('timesheets.approve.manager') || hasPermission('timesheets.approve'))) {
            bulkLabel = 'Manager Approve Selected';
            canBulkAct = true;
            bulkAction = async () => {
                setBulkProcessing(true);
                router.post(
                    route('timesheets.bulk-approve-manager'),
                    { timesheet_ids: selectedTimesheets },
                    {
                        onSuccess: () => {
                            toast(`${selectedTimesheets.length} timesheets manager approved successfully`, { variant: 'success' });
                            setSelectedTimesheets([]);
                            setBulkProcessing(false);
                            reloadPage();
                        },
                        onError: (errors: any) => {
                            toast(errors.error || 'Failed to manager approve timesheets');
                            setBulkProcessing(false);
                        },
                    },
                );
            };
        }
    }

    // Define columns for Table
    const columns = [
        {
            key: 'employee',
            header: t('lbl_employee_column'),
            accessor: (row: Timesheet) => (row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : `Employee ID: ${row.employee_id}`),
        },
        {
            key: 'date',
            header: t('lbl_date_column'),
            accessor: (row: Timesheet) => format(new Date(row.date), 'PP'),
            sortable: true,
        },
        {
            key: 'hours_worked',
            header: t('lbl_hours_column'),
            accessor: (row: Timesheet) => row.hours_worked,
        },
        {
            key: 'overtime_hours',
            header: t('lbl_overtime_column'),
            accessor: (row: Timesheet) => row.overtime_hours,
        },
        {
            key: 'assignment',
            header: t('lbl_assignment_column', 'Assignment'),
            accessor: (row: Timesheet) => {
                const employee = row.employee;
                if (employee?.assignments && employee.assignments.length > 0) {
                    const assignment = employee.assignments[0]; // Get the latest active assignment
                    if (assignment.type === 'project' && assignment.project) {
                        return `Project: ${assignment.project.name}`;
                    } else if (assignment.type === 'rental' && assignment.rental) {
                        return `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`;
                    } else {
                        return `${assignment.type}: ${assignment.name}`;
                    }
                }
                // Fallback to legacy project/rental if no assignment
                return row.project?.name && row.rental?.equipment?.name
                    ? `${row.project.name} / ${row.rental.equipment.name}`
                    : row.project?.name
                        ? `Project: ${row.project.name}`
                        : row.rental?.equipment?.name
                            ? `Rental: ${row.rental.equipment.name}`
                            : t('not_assigned');
            },
        },
        {
            key: 'status',
            header: t('lbl_status_column'),
            accessor: (row: Timesheet) => getStatusBadge(row.status),
        },
        {
            key: 'actions',
            header: t('lbl_actions_column'),
            accessor: (row: Timesheet) => {
                // Determine the main workflow action for this row
                let action = null;
                let label = '';
                let canAct = false;
                let dialogAction = 'approve';
                if (row.status === 'submitted' && hasPermission('timesheets.approve')) {
                    label = 'Approve';
                    canAct = true;
                    dialogAction = 'approve';
                } else if (row.status === 'foreman_approved' && (hasPermission('timesheets.approve.incharge') || hasPermission('timesheets.approve'))) {
                    label = 'Incharge Approve';
                    canAct = true;
                    dialogAction = 'approve';
                } else if (row.status === 'incharge_approved' && (hasPermission('timesheets.approve.checking') || hasPermission('timesheets.approve'))) {
                    label = 'Checking Approve';
                    canAct = true;
                    dialogAction = 'approve';
                } else if (row.status === 'checking_approved' && (hasPermission('timesheets.approve.manager') || hasPermission('timesheets.approve'))) {
                    label = 'Manager Approve';
                    canAct = true;
                    dialogAction = 'approve';
                } else if (['draft', 'rejected'].includes(row.status) && hasPermission('timesheets.edit')) {
                    label = row.status === 'draft' ? 'Submit' : 'Resubmit';
                    canAct = true;
                    dialogAction = 'submit';
                }
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <CrudButtons resourceType="timesheets" resourceId={row.id} resourceName={`Timesheet from ${format(new Date(row.date), 'PP')}`} />
                        {/* DEBUG OUTPUT */}
                        <span style={{ fontSize: 10, color: '#888', marginRight: 4 }}>
                            [DBG: {label} | {dialogAction} | {canAct ? 'Y' : 'N'}]
                        </span>
                        {canAct && dialogAction === 'approve' && (
                            <ApprovalDialog
                                timesheet={row}
                                action="approve"
                                onSuccess={reloadPage}
                                trigger={
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="default" size="sm">
                                                    {label}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                }
                            />
                        )}
                        {canAct && dialogAction === 'submit' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={async () => {
                                                await router.post(route('timesheets.submit', row.id), {}, {
                                                    onSuccess: reloadPage,
                                                });
                                            }}
                                        >
                                            {label}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{label} Timesheet</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                );
            },
            className: 'text-right',
        },
    ];

    const from = (timesheets.current_page - 1) * timesheets.per_page + 1;
    const to = Math.min(timesheets.current_page * timesheets.per_page, timesheets.total);

    return (
        <AppLayout title={t('ttl_timesheets')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
            <Head title={t('ttl_timesheets')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-2xl font-bold">{t('ttl_timesheets')}</CardTitle>
                            <CardDescription>{t('manage_timesheets')}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            {selectedTimesheets.length === 0 && (
                                <>
                                    <CreateButton resourceType="timesheets" text={t('btn_create_timesheet')} href="/hr/timesheets/create" />
                                    <Button asChild variant="outline">
                                        <a href={route('timesheets.summary')}>{t('btn_timesheet_summary', 'Summary')}</a>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <a href={route('timesheets.monthly')}>{t('btn_monthly_summary', 'Monthly Summary')}</a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            try {
                                                const response = await axios.post('/timesheets/create-missing');
                                                if (response.data.success) {
                                                    toast.success(response.data.message || `Created ${response.data.created} missing timesheets`);
                                                    reloadPage();
                                                } else {
                                                    toast.error(response.data.message || t('Failed to create missing timesheets'));
                                                }
                                            } catch (error: any) {
                                                toast.error(error.response?.data?.message || t('Failed to create missing timesheets'));
                                            }
                                        }}
                                    >
                                        {t('btn_create_missing_timesheets', 'Create Missing Timesheets')}
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={async () => {
                                            try {
                                                const response = await axios.post('/timesheets/auto-generate');
                                                if (response.data.success) {
                                                    toast.success('Auto-generated timesheets successfully');
                                                    window.location.reload();
                                                } else {
                                                    toast.error(response.data.message || 'Failed to auto-generate timesheets');
                                                }
                                            } catch (error: any) {
                                                toast.error(error.response?.data?.message || 'Failed to auto-generate timesheets');
                                            }
                                        }}
                                    >
                                        Auto Generate Timesheets
                                    </Button>
                                </>
                            )}
                            {/* Bulk action buttons only when selection is active */}
                            {canBulkAct && (
                                <Button
                                    variant="default"
                                    disabled={bulkProcessing}
                                    onClick={bulkAction}
                                >
                                    {bulkLabel}
                                </Button>
                            )}
                            {canBulkDelete && selectedTimesheets.length > 0 && (
                                <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={bulkProcessing} variant="destructive">
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            Delete Selected
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogTitle>Delete Timesheets</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete {selectedTimesheets.length} selected timesheets? This action cannot be undone, even for approved timesheets.
                                        </AlertDialogDescription>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkProcessing}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setBulkProcessing(true);
                                                    router.post(
                                                        route('timesheets.bulk-delete'),
                                                        {
                                                            timesheet_ids: selectedTimesheets,
                                                        },
                                                        {
                                                            onSuccess: () => {
                                                                toast(`${selectedTimesheets.length} timesheets deleted successfully`);
                                                                setSelectedTimesheets([]);
                                                                setBulkProcessing(false);
                                                                setShowBulkDeleteDialog(false);
                                                                reloadPage();
                                                            },
                                                            onError: (errors: any) => {
                                                                toast(errors.error || 'Failed to delete timesheets');
                                                                setBulkProcessing(false);
                                                                setShowBulkDeleteDialog(false);
                                                            },
                                                        },
                                                    );
                                                }}
                                                disabled={bulkProcessing}
                                            >
                                                {bulkProcessing ? (
                                                    <>Deleting...</>
                                                ) : (
                                                    <>
                                                        <TrashIcon className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                                    <div className="w-full md:w-64">
                                        <Input
                                            placeholder={t('ph_search_by_employee_name')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <Select
                                            value={selectedStatus}
                                            onValueChange={(value) => {
                                                setSelectedStatus(value);
                                                handleSearchWithStatus(value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('opt_all_statuses_1')}</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="foreman_approved">Foreman Approved</SelectItem>
                                                <SelectItem value="incharge_approved">Incharge Approved</SelectItem>
                                                <SelectItem value="checking_approved">Checking Approved</SelectItem>
                                                <SelectItem value="manager_approved">Manager Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full md:w-48">
                                        <DatePicker
                                            value={startDate || null}
                                            onChange={date => setStartDate(date || undefined)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="w-full md:w-48">
                                        <DatePicker
                                            value={endDate || null}
                                            onChange={date => setEndDate(date || undefined)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleSearch}>{t('btn_search')}</Button>
                                        <Button variant="outline" onClick={resetFilters}>
                                            {t('btn_reset')}
                                        </Button>
                                    </div>
                                </div>

                                {/* <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Timesheets</h2>
                </div> */}
                            </div>
                        </div>

                        <div className="mt-6 rounded-md border overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left">
                                            <Checkbox
                                                checked={selectedTimesheets.length > 0 && selectedTimesheets.length === sortedTimesheetsData.length}
                                                indeterminate={selectedTimesheets.length > 0 && selectedTimesheets.length < sortedTimesheetsData.length}
                                                onChange={e => toggleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none" onClick={() => {
                                            setSortField('date');
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        }}>
                                            Date
                                            {sortField === 'date' && (
                                                <span className="ml-1">
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Hours</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Overtime</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Assignment</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {sortedTimesheetsData.length > 0 ? (
                                        sortedTimesheetsData.map((row) => (
                                            <tr key={row.id} className="align-top">
                                                <td className="px-2 py-2">
                                                    <Checkbox
                                                        checked={selectedTimesheets.includes(row.id)}
                                                        onChange={e => toggleTimesheetSelection(row.id, e.target.checked)}
                                                    />
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : `Employee ID: ${row.employee_id}`}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{format(new Date(row.date), 'dd MMM yyyy')}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{row.hours_worked}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{row.overtime_hours}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">
                                                    {(() => {
                                                        const employee = row.employee;
                                                        if (employee?.assignments && employee.assignments.length > 0) {
                                                            const assignment = employee.assignments[0];
                                                            if (assignment.type === 'project' && assignment.project) {
                                                                return `Project: ${assignment.project.name}`;
                                                            } else if (assignment.type === 'rental' && assignment.rental) {
                                                                return `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`;
                                                            } else {
                                                                return `${assignment.type}: ${assignment.name}`;
                                                            }
                                                        }
                                                        // Fallback to legacy data
                                                        return row.project?.name
                                                            ? `Project: ${row.project.name}`
                                                            : row.rental?.equipment?.name
                                                                ? `Rental: ${row.rental.equipment.name}`
                                                                : row.location
                                                                    ? `Location: ${row.location}`
                                                                    : row.start_address
                                                                        ? `Location: ${row.start_address}`
                                                                        : row.end_address
                                                                            ? `Location: ${row.end_address}`
                                                                            : t('not_assigned');
                                                    })()}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{getStatusBadge(row.status)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <a href={window.route('timesheets.show', row.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a href={window.route('timesheets.edit', row.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Permission permission="timesheets.delete">
                                                        <a href={window.route('timesheets.destroy', row.id)} data-method="delete" data-confirm={t('delete_confirm', 'Are you sure you want to delete this timesheet?')}>
                                                            <Button variant="destructive" size="icon" className="h-7 w-7">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </Permission>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-4 text-center">
                                                {t('no_timesheets_found', 'No timesheets found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {timesheets.data && timesheets.data.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {from} to {to} of {timesheets.total || timesheets.data.length} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {timesheets.current_page || 1} of {timesheets.last_page || 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={value => { setPerPage(Number(value)); reloadPage(1); }}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="15">15</SelectItem>
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
                                                disabled={!timesheets.current_page || timesheets.current_page === 1}
                                                onClick={() => {
                                                    if (timesheets.current_page > 1) reloadPage(timesheets.current_page - 1);
                                                }}
                                            >
                                                Previous
                                            </Button>
                                            {/* Page Numbers */}
                                            {timesheets.last_page && timesheets.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, timesheets.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        const lastPage = timesheets.last_page;
                                                        const currentPage = timesheets.current_page;
                                                        if (lastPage <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (currentPage <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (currentPage >= lastPage - 2) {
                                                                pageNumber = lastPage - 4 + i;
                                                            } else {
                                                                pageNumber = currentPage - 2 + i;
                                                            }
                                                        }
                                                        return (
                                                            <Button
                                                                key={pageNumber}
                                                                variant={pageNumber === currentPage ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => reloadPage(pageNumber)}
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
                                                disabled={!timesheets.current_page || !timesheets.last_page || timesheets.current_page >= timesheets.last_page}
                                                onClick={() => {
                                                    if (timesheets.current_page < timesheets.last_page) reloadPage(timesheets.current_page + 1);
                                                }}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
