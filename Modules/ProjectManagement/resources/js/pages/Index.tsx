import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Eye, Edit, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Permission } from '@/Core';

interface Project {
    id: number;
    name: string;
    description?: string;
    client: {
        id: number;
        company_name: string;
    } | null;
    start_date: string;
    end_date: string | null;
    status: string;
    budget: number;
    priority?: string;
}

interface Props {
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
        from: number;
        to: number;
    };
}

export default function Index({ projects }: Props) {
    const { t } = useTranslation('project');

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [perPage, setPerPage] = useState(projects.per_page || 10);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
            on_hold: 'outline',
        };
        const labels: Record<string, string> = {
            active: 'Active',
            completed: 'Completed',
            cancelled: 'Cancelled',
            on_hold: 'On Hold',
        };
        return <Badge variant={variants[status] || 'outline'}>{labels[status] || status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const getPriorityBadge = (priority?: string) => {
        if (!priority) return <Badge variant="outline">—</Badge>;
        const map: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
            high: { label: 'High', variant: 'destructive' },
            medium: { label: 'Medium', variant: 'default' },
            low: { label: 'Low', variant: 'outline' },
        };
        const p = priority.toLowerCase();
        const { label, variant } = map[p] || { label: priority, variant: 'outline' };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const currencyFormatter = new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
    });

    // Filtering logic (simulate backend filtering for demo)
    const filteredProjects = (projects && Array.isArray(projects.data) ? projects.data : []).filter((project) => {
        const matchesSearch =
            !search ||
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.client?.company_name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || project.status === status;
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = projects.last_page || Math.ceil(filteredProjects.length / perPage);
    const currentPage = projects.current_page || 1;
    const paginatedProjects = filteredProjects.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <AppLayout title={t('ttl_projects')} breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Projects', href: '/projects' }]} requiredPermission="projects.view">
            <Head title={t('ttl_projects')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">{t('ttl_projects')}</CardTitle>
                        <div className="flex gap-2">
                            <Button asChild>
                                <a href={window.route('projects.create')}>{t('ttl_create_project')}</a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('ph_search_projects')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Project Name</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-normal">Description</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Client</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Date</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Progress</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Budget</th>
                                        <th className="px-2 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                                        <th className="px-2 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {paginatedProjects.length > 0 ? (
                                        paginatedProjects.map((project) => (
                                            <tr key={project.id} className="align-top">
                                                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{project.name}</td>
                                                <td className="px-2 py-2 whitespace-normal text-sm break-words">{project.description || '—'}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{project.client?.company_name || t('no_client_assigned')}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy') : '—'}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy') : '—'}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">
                                                    {(() => {
                                                        if (!project.start_date || !project.end_date) return '—';
                                                        const start = new Date(project.start_date).getTime();
                                                        const end = new Date(project.end_date).getTime();
                                                        const now = Date.now();
                                                        if (end <= start) return '—';
                                                        const percent = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
                                                        return (
                                                            <div className="flex flex-col gap-1 min-w-[60px]">
                                                                <div className="text-xs font-medium">{percent}%</div>
                                                                <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100">
                                                                    <div className="absolute top-0 left-0 h-full bg-green-500 rounded-full" style={{ width: `${percent}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{getStatusBadge(project.status)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{currencyFormatter.format(project.budget)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-sm">{getPriorityBadge(project.priority)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <a href={window.route('projects.show', project.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a href={window.route('projects.edit', project.id)}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Permission permission="projects.delete">
                                                        <a href={window.route('projects.destroy', project.id)} data-method="delete" data-confirm={t('delete_confirm', 'Are you sure you want to delete this project?')}>
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
                                            <td colSpan={10} className="py-4 text-center">
                                                {t('no_projects_found', 'No projects found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Enhanced Pagination */}
                        {filteredProjects.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredProjects.length)} of {filteredProjects.length} results
                                        <div className="mt-1 text-xs opacity-60">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Per Page Selector */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">Show:</span>
                                            <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
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
                                                disabled={currentPage === 1}
                                                onClick={() => window.location.assign(`?page=${currentPage - 1}`)}
                                            >
                                                Previous
                                            </Button>
                                            {totalPages > 1 && (
                                                <div className="flex items-center space-x-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNumber;
                                                        if (totalPages <= 5) {
                                                            pageNumber = i + 1;
                                                        } else {
                                                            if (currentPage <= 3) {
                                                                pageNumber = i + 1;
                                                            } else if (currentPage >= totalPages - 2) {
                                                                pageNumber = totalPages - 4 + i;
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
                                                                onClick={() => window.location.assign(`?page=${pageNumber}`)}
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
                                                disabled={currentPage === totalPages}
                                                onClick={() => window.location.assign(`?page=${currentPage + 1}`)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {filteredProjects.length === 0 && (
                            <div className="mt-4 text-center text-sm text-muted-foreground">No projects found matching your criteria.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
