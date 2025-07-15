import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DatePicker,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { PageProps } from '@/Core/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveData {
    id: number;
    employee: {
        id: number;
        name: string;
        employee_id: string;
    };
    department: string;
    leaveType: {
        id: number;
        name: string;
        color: string;
    };
    start_date: string;
    end_date: string;
    days: number;
    status: string;
    reason: string;
}

interface Department {
    id: number;
    name: string;
}

interface LeaveType {
    id: number;
    name: string;
}

interface Props extends PageProps {
    leaves: {
        data: LeaveData[];
        current_page: number;
        last_page: number;
    };
    summary: {
        total_leaves: number;
        approved_leaves: number;
        pending_leaves: number;
        rejected_leaves: number;
        total_days: number;
    };
    filters: {
        search?: string;
        status?: string;
        department?: string;
        leave_type?: string;
        start_date?: string;
        end_date?: string;
        sort_field?: string;
        sort_direction?: string;
    };
    departments: Department[];
    leaveTypes: LeaveType[];
}

export default function Leaves({ leaves, summary, filters, departments, leaveTypes, auth }: Props) {
    return (
        <AppLayout>
            <LeavesContent leaves={leaves} summary={summary} filters={filters} departments={departments} leaveTypes={leaveTypes} auth={auth} />
        </AppLayout>
    );
}

function LeavesContent({ leaves, summary, filters, departments, leaveTypes, auth }: Props) {
    // Provide safe defaults for all props
    const safeLeaves = leaves || { data: [], current_page: 1, last_page: 1 };
    const safeSummary = summary || { total_leaves: 0, approved_leaves: 0, pending_leaves: 0, rejected_leaves: 0, total_days: 0 };
    const safeFilters = filters || {};
    const safeDepartments = departments || [];
    const safeLeaveTypes = leaveTypes || [];

    const { data, setData, get } = useForm({
        search: safeFilters.search || '',
        status: safeFilters.status || 'all',
        department: safeFilters.department || 'all',
        leave_type: safeFilters.leave_type || 'all',
        start_date: safeFilters.start_date || '',
        end_date: safeFilters.end_date || '',
        sort_field: safeFilters.sort_field || 'created_at',
        sort_direction: safeFilters.sort_direction || 'desc',
    });

    const handleSearch = () => {
        const searchData = { ...data };
        if (searchData.department === 'all') delete searchData.department;
        if (searchData.leave_type === 'all') delete searchData.leave_type;
        if (searchData.status === 'all') delete searchData.status;
        get(route('reporting.modules.leaves'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Filters applied successfully');
            },
            onError: () => {
                toast.error('Failed to apply filters');
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const handleSort = (field: any, direction: any) => {
        setData({ ...data, sort_field: field, sort_direction: direction });
        handleSearch();
    };

    // Back button above summary cards
    const backUrl = '/reporting';

    return (
        <>
            <Head title="Leave Reports" />

            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </Link>
                </div>
                <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeSummary.total_leaves}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{safeSummary.approved_leaves}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{safeSummary.pending_leaves}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{safeSummary.rejected_leaves}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeSummary.total_days}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Leave Reports</CardTitle>
                        <CardDescription>View and analyze leave data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col flex-wrap gap-4 md:flex-row">
                            <div className="min-w-[200px] flex-1">
                                <Input placeholder="Search employees..." value={data.search} onChange={(e) => setData('search', e.target.value)} />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={data.department} onValueChange={(value) => setData('department', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {safeDepartments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={data.leave_type} onValueChange={(value) => setData('leave_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Leave Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Leave Types</SelectItem>
                                        {safeLeaveTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <DatePicker
                                    // @ts-ignore
                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                    onChange={(date: Date | null) => setData('start_date', date ? date.toISOString().split('T')[0] : '')}
                                    placeholder="Start Date"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <DatePicker
                                    // @ts-ignore
                                    selected={data.end_date ? new Date(data.end_date) : undefined}
                                    onChange={(date: Date | null) => setData('end_date', date ? date.toISOString().split('T')[0] : '')}
                                    placeholder="End Date"
                                />
                            </div>
                            <Button onClick={handleSearch}>Apply Filters</Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setData({
                                        search: '',
                                        status: 'all',
                                        department: 'all',
                                        leave_type: 'all',
                                        start_date: '',
                                        end_date: '',
                                        sort_field: 'created_at',
                                        sort_direction: 'desc',
                                    });
                                    get(route('reporting.modules.leaves'), {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Employee</th>
                                        <th className="px-4 py-2 text-left">Employee ID</th>
                                        <th className="px-4 py-2 text-left">Department</th>
                                        <th className="px-4 py-2 text-left">Leave Type</th>
                                        <th className="px-4 py-2 text-left">Start Date</th>
                                        <th className="px-4 py-2 text-left">End Date</th>
                                        <th className="px-4 py-2 text-left">Days</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                    {safeLeaves.data.map((leave: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">{leave.employee?.name}</td>
                                            <td className="px-4 py-2">{leave.employee?.employee_id}</td>
                                            <td className="px-4 py-2">{leave.department}</td>
                                            <td className="px-4 py-2">{leave.leaveType?.name}</td>
                                            <td className="px-4 py-2">{leave.start_date}</td>
                                            <td className="px-4 py-2">{leave.end_date}</td>
                                            <td className="px-4 py-2">{leave.days}</td>
                                            <td className="px-4 py-2">
                                                <span className={`capitalize ${getStatusColor(leave.status)}`}>{leave.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
