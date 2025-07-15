import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CreateButton,
    CrudButtons,
    getTranslation,
    Input,
    Permission,
    Select,
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
    usePermission,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { Banknote, BriefcaseBusiness, LoaderCircle, MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageProps } from '../../types/index';
import { Employee } from '../../types/models';

// Import router from Inertia
import { router } from '@inertiajs/core';

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Employees', href: '/employees' },
];

interface Props extends PageProps {
    employees: {
        data: Employee[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    filters: {
        search: string;
        status: string;
        department: string;
        designation: string;
    };
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    auth: any;
}

export default function Index({ auth, employees, filters, departments, designations }: Props) {
    const { t } = useTranslation('employees');

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [department, setDepartment] = useState(filters.department || 'all');
    const [designation, setDesignation] = useState(filters.designation || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const { hasPermission } = usePermission();
    const [perPage, setPerPage] = useState(employees.meta?.per_page || 15);

    const handleSearch = debounce((value: string) => {
        const normalizedValue = !value || value === 'all' ? '' : value;
        setSearch(normalizedValue);
        router.get(
            '/employees',
            {
                search: normalizedValue,
                status: status === 'all' ? '' : status,
                department: department === 'all' ? '' : department,
                designation: designation === 'all' ? '' : designation,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);

    const handleFilter = (type: string, value: string) => {
        const normalizedValue = value === 'all' ? '' : value;
        let newStatus = status;
        let newDepartment = department;
        let newDesignation = designation;

        switch (type) {
            case 'status':
                setStatus(value);
                newStatus = value;
                break;
            case 'department':
                setDepartment(value);
                newDepartment = value;
                break;
            case 'designation':
                setDesignation(value);
                newDesignation = value;
                break;
        }

        router.get(
            '/employees',
            {
                search: search === 'all' ? '' : search,
                status: newStatus === 'all' ? '' : newStatus,
                department: newDepartment === 'all' ? '' : newDepartment,
                designation: newDesignation === 'all' ? '' : newDesignation,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        router.get(
            '/employees',
            {
                search: search === 'all' ? '' : search,
                status: status === 'all' ? '' : status,
                department: department === 'all' ? '' : department,
                designation: designation === 'all' ? '' : designation,
                per_page: Number(value),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
            active: 'default',
            inactive: 'secondary',
            on_leave: 'outline',
            exit: 'destructive',
        };

        const labels: Record<string, string> = {
            active: 'Active',
            inactive: 'Inactive',
            on_leave: 'On Leave',
            exit: 'Exit',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const getAssignmentBadge = (assignment: Employee['current_assignment']) => {
        if (!assignment) return <Badge variant="outline">Unassigned</Badge>;

        const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
            project: 'default',
            rental: 'secondary',
            leave: 'outline',
        };

        return <Badge variant={variants[assignment.type] || 'default'}>{assignment.type.toUpperCase()}</Badge>;
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return '-';
        return format(new Date(date), 'dd MMM yyyy');
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Sort employees by file_number as zero-padded number
    const sortedEmployees = [...employees.data].sort((a, b) => {
        const getNum = (fn: string | undefined) => {
            if (!fn) return Infinity;
            const match = fn.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : Infinity;
        };
        return getNum(a.file_number) - getNum(b.file_number);
    });

    return (
        <AppLayout title={t('ttl_employees')} breadcrumbs={breadcrumbs} requiredPermission="employees.view">
            <Head title={t('ttl_employees')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">Employees</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Permission permission="employees.create">
                                <CreateButton resourceType="employees" buttonVariant="default" text="Add Employee" />
                            </Permission>
                            {/* Sync to ERPNext button for admin only */}
                            {auth?.user?.roles?.includes('admin') && (
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            setIsLoading(true);
                                            const response = await fetch('/employees/sync-from-erpnext', {
                                                method: 'POST',
                                                headers: {
                                                    'X-CSRF-TOKEN': getCsrfToken() || '',
                                                    'Content-Type': 'application/json',
                                                },
                                            });
                                            if (response.ok) {
                                                toast.success('Employee data synced from ERPNext successfully');
                                            } else {
                                                toast.error('Failed to sync employee data from ERPNext');
                                            }
                                        } catch (error) {
                                            toast.error('Error syncing from ERPNext');
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Sync from ERPNext
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('ph_search_employees')}
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(value) => handleFilter('status', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('ph_filter_by_status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('opt_all_statuses')}</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                    <SelectItem value="exit">Exit</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={department}
                                onValueChange={(value) => handleFilter('department', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('ph_filter_by_department')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('opt_all_departments')}</SelectItem>
                                    {departments?.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {typeof dept.name === 'string' ? dept.name : JSON.stringify(dept.name)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={designation}
                                onValueChange={(value) => handleFilter('designation', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('ph_filter_by_designation')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('opt_all_designations')}</SelectItem>
                                    {designations?.map((designation) => (
                                        <SelectItem key={designation.id} value={designation.id.toString()}>
                                            {typeof designation.name === 'string' ? designation.name : JSON.stringify(designation.name)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            File Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status & Designation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Assignment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Salary Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Details
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedEmployees.map((employee) => (
                                        <tr key={employee.id} className="align-top">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span>{employee.file_number}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span>
                                                    {employee.first_name} {employee.middle_name} {employee.last_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div>{getStatusBadge(employee.status)}</div>
                                                    <div className="text-sm">
                                                        <BriefcaseBusiness className="mr-1 inline-block h-3 w-3" />
                                                        {typeof employee.designation === 'string'
                                                            ? employee.designation
                                                            : employee.designation
                                                              ? getTranslation(employee.designation?.name)
                                                              : 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Dept:{' '}
                                                        {typeof employee.department === 'string'
                                                            ? employee.department
                                                            : employee.department
                                                              ? getTranslation(employee.department?.name)
                                                              : 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    {getAssignmentBadge(employee.current_assignment)}
                                                    {employee.current_assignment ? (
                                                        <>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="line-clamp-1 cursor-help text-sm">
                                                                            {employee.current_assignment.name}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{employee.current_assignment.name}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <div className="flex items-center text-xs text-muted-foreground">
                                                                <MapPin className="mr-1 inline-block h-3 w-3" />
                                                                <span className="line-clamp-1">
                                                                    {employee.current_assignment.location || employee.current_location || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {employee.current_assignment.start_date && (
                                                                    <span>
                                                                        {formatDate(employee.current_assignment.start_date)}
                                                                        {employee.current_assignment.end_date && (
                                                                            <> - {formatDate(employee.current_assignment.end_date)}</>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">{t('no_current_assignment')}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm">
                                                        <Banknote className="mr-1 inline-block h-3 w-3" />
                                                        <span className="font-medium">{formatCurrency(employee.basic_salary)}</span>
                                                        <span className="ml-1 text-xs text-muted-foreground">/month</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Hourly:{' '}
                                                        {employee.hourly_rate && employee.hourly_rate > 0
                                                            ? formatCurrency(employee.hourly_rate)
                                                            : '-'}
                                                    </div>
                                                    {/* Remove current_balance badge to fix linter error */}
                                                    {/* <Badge variant={Number(employee.current_balance) > 0 ? "destructive" : "outline"} className="w-fit text-xs mt-1">
                            Advance: {formatCurrency(Number(employee.current_balance) || 0)}
                          </Badge> */}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <a href={`mailto:${employee.email}`} className="text-sm hover:underline">
                                                        {employee.email}
                                                    </a>
                                                    <a href={`tel:${employee.phone}`} className="text-sm hover:underline">
                                                        {employee.phone}
                                                    </a>
                                                    <span className="text-xs text-muted-foreground">{employee.nationality}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <CrudButtons
                                                    resourceType="employees"
                                                    resourceId={employee.id}
                                                    resourceName={`${employee.first_name} ${employee.last_name}`}
                                                    className="justify-end"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-4 text-center">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination - Always show if there are employees */}
                        {employees?.data && employees.data.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {employees?.meta?.from || 1} to {employees?.meta?.to || employees.data.length} of{' '}
                                        {employees?.meta?.total || employees.data.length} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {employees?.meta?.current_page || 1} of {employees?.meta?.last_page || 1}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
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
                                                disabled={!employees?.meta?.current_page || employees.meta.current_page === 1}
                                                onClick={() => {
                                                    const currentPage = employees?.meta?.current_page || 1;
                                                    if (currentPage > 1) {
                                                        router.get(
                                                            '/employees',
                                                            {
                                                                page: currentPage - 1,
                                                                per_page: perPage,
                                                                search: search === 'all' ? '' : search,
                                                                status: status === 'all' ? '' : status,
                                                                department: department === 'all' ? '' : department,
                                                                designation: designation === 'all' ? '' : designation,
                                                            },
                                                            { preserveState: true, preserveScroll: true },
                                                        );
                                                    }
                                                }}
                                            >
                                                Previous
                                            </Button>

                                            {/* Page Numbers - show if we have pagination metadata */}
                                            {employees?.meta?.last_page && employees.meta.last_page > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, employees.meta.last_page) }, (_, i) => {
                                                        let pageNumber;
                                                        const lastPage = employees.meta.last_page;
                                                        const currentPage = employees.meta.current_page;

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
                                                                onClick={() => {
                                                                    //   console.log('Navigating to page:', pageNumber);
                                                                    router.get(
                                                                        '/employees',
                                                                        {
                                                                            page: pageNumber,
                                                                            per_page: perPage,
                                                                            search: search === 'all' ? '' : search,
                                                                            status: status === 'all' ? '' : status,
                                                                            department: department === 'all' ? '' : department,
                                                                            designation: designation === 'all' ? '' : designation,
                                                                        },
                                                                        { preserveState: true, preserveScroll: true },
                                                                    );
                                                                }}
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
                                                disabled={
                                                    !employees?.meta?.current_page ||
                                                    !employees?.meta?.last_page ||
                                                    employees.meta.current_page >= employees.meta.last_page
                                                }
                                                onClick={() => {
                                                    const currentPage = employees?.meta?.current_page || 1;
                                                    const lastPage = employees?.meta?.last_page || 1;
                                                    if (currentPage < lastPage) {
                                                        router.get(
                                                            '/employees',
                                                            {
                                                                page: currentPage + 1,
                                                                per_page: perPage,
                                                                search: search === 'all' ? '' : search,
                                                                status: status === 'all' ? '' : status,
                                                                department: department === 'all' ? '' : department,
                                                                designation: designation === 'all' ? '' : designation,
                                                            },
                                                            { preserveState: true, preserveScroll: true },
                                                        );
                                                    }
                                                }}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show message when no employees found */}
                        {employees?.data && employees.data.length === 0 && (
                            <div className="mt-4 text-center text-sm text-muted-foreground">No employees found matching your criteria.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
