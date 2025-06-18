import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../../../resources/js/components/ui/card';
import { Button } from '../../../../../resources/js/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../resources/js/components/ui/table';
import { Badge } from '../../../../../resources/js/components/ui/badge';
import { Separator } from '../../../../../resources/js/components/ui/separator';
import { Input } from '../../../../../resources/js/components/ui/input';
import { format } from 'date-fns';
import {
    Eye, Edit, Plus, LayoutGrid, CheckCircle, Clock, AlertCircle, XCircle,
    Filter, Search
} from 'lucide-react';
import AdminLayout from '../../../../../resources/js/layouts/AdminLayout';
// Declare window.route for TypeScript
// @ts-ignore
// eslint-disable-next-line
declare global { interface Window { route: any; } }

interface Project {
    id: number;
    name: string;
    client: {
        id: number;
        company_name: string;
    } | null;
    start_date: string;
    end_date: string | null;
    status: string;
    budget: number;
}

interface Props {
    projects: Project[];
}

export default function Index({ projects }: Props) {
  const { t } = useTranslation('project');

    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const formatStatus = (status: string) => {
        const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
            active: {
                variant: "outline",
                icon: <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
            },
            completed: {
                variant: "default",
                icon: <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
            },
            on_hold: {
                variant: "secondary",
                icon: <AlertCircle className="h-3.5 w-3.5 mr-1 text-amber-500" />
            },
            cancelled: {
                variant: "destructive",
                icon: <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
            }
        };

        return statusMap[status] || { variant: "outline", icon: null };
    };

    // Calculate project progress based on status and timeline
    const calculateProgress = (project: Project) => {
        if (project.status === 'completed') return 100;
        if (project.status === 'cancelled') return 0;

        if (!project.end_date) return 30; // Default progress for projects without end date

        const startDate = new Date(project.start_date).getTime();
        const endDate = new Date(project.end_date).getTime();
        const today = new Date().getTime();

        // Calculate percentage of time passed
        const totalDuration = endDate - startDate;
        const elapsed = today - startDate;

        if (elapsed <= 0) return 0;
        if (elapsed >= totalDuration) return project.status === 'on_hold' ? 80 : 95;

        const progress = Math.round((elapsed / totalDuration) * 100);
        return Math.min(progress, project.status === 'on_hold' ? 80 : 95);
    };

    // Filter projects based on search query and status filter
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Apply status filter if set
            if (statusFilter && project.status !== statusFilter) {
                return false;
            }

            // Apply search filter if query exists
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    project.name.toLowerCase().includes(query) ||
                    project.client?.company_name.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [projects, statusFilter, searchQuery]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
    ];

    return (
        <AdminLayout title={t('ttl_projects')} breadcrumbs={breadcrumbs} requiredPermission="projects.view">

            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground mt-1">{t('manage_all_your_projects')}</p>
                    </div>
                    <Link href={window.route('projects.create')}>
                        <Button className="flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </Link>
                </div>

                <Separator />

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center">
                                    <LayoutGrid className="h-5 w-5 mr-2 text-blue-500" />
                                    Project List
                                </CardTitle>
                                <CardDescription>
                                    View and manage all projects ({filteredProjects.length} of {projects.length})
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder={t('ph_search_projects')}
                                        className="w-[200px] pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant={statusFilter === null ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setStatusFilter(null)}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={statusFilter === "active" ? "default" : "outline"}
                                        size="sm"
                                        className="flex items-center"
                                        onClick={() => setStatusFilter("active")}
                                    >
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        Active
                                    </Button>
                                    <Button
                                        variant={statusFilter === "completed" ? "default" : "outline"}
                                        size="sm"
                                        className="flex items-center"
                                        onClick={() => setStatusFilter("completed")}
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        Completed
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('lbl_project_name')}</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>{t('lbl_start_date')}</TableHead>
                                        <TableHead>{t('end_date')}</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Budget</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell className="font-medium">
                                                    {project.name}
                                                </TableCell>
                                                <TableCell>{project.client?.company_name || 'No client assigned'}</TableCell>
                                                <TableCell>{format(new Date(project.start_date), 'PPP')}</TableCell>
                                                <TableCell>
                                                    {project.end_date ? format(new Date(project.end_date), 'PPP') : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant={formatStatus(project.status).variant} className="flex items-center">
                                                            {formatStatus(project.status).icon}
                                                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                        </Badge>
                                                        {project.status !== 'cancelled' && (
                                                            <div className="ml-2 w-16">
                                                                <div className="text-xs text-muted-foreground mb-1">{calculateProgress(project)}%</div>
                                                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${
                                                                            project.status === 'completed' ? 'bg-green-500' :
                                                                            project.status === 'on_hold' ? 'bg-amber-500' : 'bg-blue-500'
                                                                        }`}
                                                                        style={{ width: `${calculateProgress(project)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>SAR {project.budget.toLocaleString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Link href={window.route('projects.show', project.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={window.route('projects.edit', project.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                                {statusFilter
                                                    ? `No ${statusFilter} projects found.`
                                                    : (searchQuery
                                                        ? 'No matching projects found. Try a different search term.'
                                                        : 'No projects found. Click "New Project" to create one.'
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {filteredProjects.length > 0 && projects.length !== filteredProjects.length && (
                        <CardFooter className="border-t bg-muted/10 py-3">
                            <div className="flex justify-between w-full items-center">
                                <div className="text-sm text-muted-foreground">
                                    Showing {filteredProjects.length} of {projects.length} projects
                                </div>
                                {(statusFilter || searchQuery) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setStatusFilter(null);
                                            setSearchQuery('');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
