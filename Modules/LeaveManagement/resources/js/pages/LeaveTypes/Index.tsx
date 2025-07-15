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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    Edit as EditIcon,
    Eye as EyeIcon,
    Filter as FilterIcon,
    MoreHorizontal as MoreHorizontalIcon,
    Plus as PlusIcon,
    Power as PowerIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    Trash2 as Trash2Icon,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LeaveType {
    id: number;
    name: string;
    description?: string;
    max_days_per_year: number;
    requires_approval: boolean;
    is_paid: boolean;
    is_active: boolean;
    carry_forward: boolean;
    max_carry_forward_days?: number;
    notice_days_required?: number;
    gender_specific?: string;
    applicable_after_months?: number;
    created_at: string;
    updated_at: string;
    leaves_count?: number;
}

interface PageProps {
    leaveTypes: {
        data: LeaveType[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

const LeaveTypesIndex: React.FC = () => {
    const { leaveTypes, filters } = usePage<PageProps>().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [filterForm, setFilterForm] = useState({
        search: filters.search || '',
        status: filters.status || '',
        sort_by: filters.sort_by || 'name',
        sort_order: filters.sort_order || 'asc',
    });

    const handleFilter = () => {
        const { t } = useTranslation('leave');

        router.get(
            route('leaves.types.index'),
            {
                ...Object.fromEntries(Object.entries(filterForm).filter(([_, value]) => value !== '')),
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setFilterForm({
            search: '',
            status: '',
            sort_by: 'name',
            sort_order: 'asc',
        });
        router.get(route('leaves.types.index'));
    };

    const handleSort = (column: string) => {
        const newOrder = filterForm.sort_by === column && filterForm.sort_order === 'asc' ? 'desc' : 'asc';
        setFilterForm((prev) => ({ ...prev, sort_by: column, sort_order: newOrder }));

        router.get(
            route('leaves.types.index'),
            {
                ...Object.fromEntries(Object.entries({ ...filterForm, sort_by: column, sort_order: newOrder }).filter(([_, value]) => value !== '')),
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = () => {
        if (!deleteId) return;

        router.delete(route('leaves.types.destroy', deleteId), {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setDeleteId(null);
            },
        });
    };

    const handleToggleStatus = (leaveTypeId: number) => {
        router.post(route('leaves.types.toggle-status', leaveTypeId));
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getGenderColor = (gender?: string) => {
        const colors: Record<string, string> = {
            male: 'bg-blue-100 text-blue-800',
            female: 'bg-pink-100 text-pink-800',
            both: 'bg-gray-100 text-gray-800',
        };
        return colors[gender || 'both'] || 'bg-gray-100 text-gray-800';
    };

    const getSortIcon = (column: string) => {
        if (filterForm.sort_by !== column) return null;
        return filterForm.sort_order === 'asc' ? '↑' : '↓';
    };

    return (
        <AppLayout>
            <Head title={t('leave_types')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('leave_types')}</h1>
                        <p className="text-muted-foreground">Manage different types of leave available to employees</p>
                    </div>
                    <Button asChild>
                        <Link href={route('leaves.types.create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Leave Type
                        </Link>
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_types')}</CardTitle>
                            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaveTypes.meta.total}</div>
                            <p className="text-xs text-muted-foreground">Leave types configured</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_active_types')}</CardTitle>
                            <PowerIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaveTypes.data.filter((type) => type.is_active).length}</div>
                            <p className="text-xs text-muted-foreground">Currently available</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_paid_types')}</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaveTypes.data.filter((type) => type.is_paid).length}</div>
                            <p className="text-xs text-muted-foreground">With salary compensation</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_approval_required')}</CardTitle>
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leaveTypes.data.filter((type) => type.requires_approval).length}</div>
                            <p className="text-xs text-muted-foreground">Need manager approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FilterIcon className="mr-2 h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Search</label>
                                <div className="relative">
                                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder={t('ph_search_leave_types')}
                                        value={filterForm.search}
                                        onChange={(e) => setFilterForm((prev) => ({ ...prev, search: e.target.value }))}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Status</label>
                                <Select value={filterForm.status} onValueChange={(value) => setFilterForm((prev) => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_statuses_2')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">{t('opt_all_statuses')}</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">{t('lbl_sort_by')}</label>
                                <Select
                                    value={`${filterForm.sort_by}-${filterForm.sort_order}`}
                                    onValueChange={(value) => {
                                        const [sort_by, sort_order] = value.split('-');
                                        setFilterForm((prev) => ({ ...prev, sort_by, sort_order }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="max_days_per_year-asc">Max Days (Low-High)</SelectItem>
                                        <SelectItem value="max_days_per_year-desc">Max Days (High-Low)</SelectItem>
                                        <SelectItem value="created_at-desc">{t('opt_newest_first')}</SelectItem>
                                        <SelectItem value="created_at-asc">{t('opt_oldest_first')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter} variant="default">
                                Apply Filters
                            </Button>
                            <Button onClick={handleReset} variant="outline">
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Types Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('leave_types')}</CardTitle>
                        <CardDescription>Configure and manage different types of leave</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                                            Name {getSortIcon('name')}
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('max_days_per_year')}>
                                            Max Days/Year {getSortIcon('max_days_per_year')}
                                        </TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Settings</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveTypes.data.map((leaveType) => (
                                        <TableRow key={leaveType.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">{leaveType.name}</div>
                                                    {leaveType.leaves_count !== undefined && (
                                                        <div className="text-sm text-muted-foreground">{leaveType.leaves_count} requests</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="truncate" title={leaveType.description}>
                                                    {leaveType.description || 'No description'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{leaveType.max_days_per_year} days</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={leaveType.is_paid ? 'default' : 'secondary'}>
                                                        {leaveType.is_paid ? 'Paid' : 'Unpaid'}
                                                    </Badge>
                                                    {leaveType.requires_approval && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {t('ttl_approval_required')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getGenderColor(leaveType.gender_specific)}>
                                                    {leaveType.gender_specific === 'both'
                                                        ? 'All'
                                                        : leaveType.gender_specific?.charAt(0).toUpperCase() + leaveType.gender_specific?.slice(1) ||
                                                          'All'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(leaveType.is_active)}>
                                                        {leaveType.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleToggleStatus(leaveType.id)}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <PowerIcon className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{leaveType.is_active ? 'Deactivate' : 'Activate'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    {leaveType.carry_forward && <span className="text-green-600">{t('carry_forward')}</span>}
                                                    {leaveType.notice_days_required && (
                                                        <span className="text-blue-600">{leaveType.notice_days_required}d notice</span>
                                                    )}
                                                    {leaveType.applicable_after_months && (
                                                        <span className="text-purple-600">After {leaveType.applicable_after_months}m</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontalIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('leaves.types.show', leaveType.id)}>
                                                                <EyeIcon className="mr-2 h-4 w-4" />
                                                                {t('employee:ttl_view_details')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('leaves.types.edit', leaveType.id)}>
                                                                <EditIcon className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setDeleteId(leaveType.id);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2Icon className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {leaveTypes.data.length === 0 && (
                            <div className="py-8 text-center">
                                <SettingsIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No leave types found.</p>
                                <p className="mt-1 text-sm text-muted-foreground">Create your first leave type to get started.</p>
                                <Button asChild className="mt-4">
                                    <Link href={route('leaves.types.create')}>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Leave Type
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {leaveTypes.links && leaveTypes.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {leaveTypes.meta.from} to {leaveTypes.meta.to} of {leaveTypes.meta.total} results
                                </div>
                                <div className="flex space-x-1">
                                    {leaveTypes.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
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

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_leave_type')}</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this leave type? This action cannot be undone. All associated leave requests will be
                                affected.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default LeaveTypesIndex;
