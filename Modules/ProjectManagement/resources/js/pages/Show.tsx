import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Progress,
} from '@/Core';
import { format } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    BarChart2,
    CheckSquare,
    ClipboardList,
    Clock,
    DollarSign,
    Edit,
    FileText,
    Package,
    PieChart,
    Trash2,
    XIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import BurndownChart from '../Components/project/BurndownChart';
import CostAnalysisCard from '../Components/project/CostAnalysisCard';
import { ProjectProgress } from '../Components/project/ProjectProgress';
import ResourceForm from '../Components/project/ResourceForm';
import RiskAssessmentCard from '../Components/project/RiskAssessmentCard';
import TaskDialog from '../Components/project/TaskDialog';
import { ProjectTask } from '../Components/project/TaskList';
import VelocityChart from '../Components/project/VelocityChart';
import ProjectTimesheets from './ProjectTimesheets';

// Declare window.route for TypeScript
// @ts-ignore
// eslint-disable-next-line
declare global {
    interface Window {
        route: any;
    }
}

// Define types locally since there are import issues
type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';

// Define a local ResourceDialog component
interface ResourceDialogProps {
    projectId: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialType?: ResourceType;
    initialData?: Resource | null;
    onSuccess?: () => void;
}

function ResourceDialog({
    projectId,
    isOpen = false,
    onOpenChange,
    initialType = 'manpower',
    initialData = null,
    onSuccess = () => {},
}: ResourceDialogProps) {
    const { t } = useTranslation(['projects', 'common']);
    const title = initialData
        ? `Edit ${initialType.charAt(0).toUpperCase() + initialType.slice(1)}`
        : `Add ${initialType.charAt(0).toUpperCase() + initialType.slice(1)}`;

    // Get the appropriate color based on resource type
    const getTypeColor = (type: ResourceType) => {
        const colors = {
            manpower: 'text-blue-600 bg-blue-50',
            equipment: 'text-green-600 bg-green-50',
            material: 'text-amber-600 bg-amber-50',
            fuel: 'text-purple-600 bg-purple-50',
            expense: 'text-red-600 bg-red-50',
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    const typeColor = getTypeColor(initialType);

    // Only render if the dialog is open
    if (!isOpen) {
        return null;
    }

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={handleBackdropClick}>
            <div className="relative w-full max-w-[550px] rounded-lg bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => onOpenChange(false)}>
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                {/* Header */}
                <div className={`${typeColor} mb-4 rounded-t-lg px-6 py-4`}>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-gray-600">
                        {initialData ? `Update details for this ${initialType} resource` : `Add a new ${initialType} resource to this project`}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <ResourceForm
                        type={initialType}
                        projectId={projectId}
                        onSuccess={() => {
                            onSuccess();
                            onOpenChange(false);
                        }}
                        initialData={initialData}
                    />
                </div>
            </div>
        </div>
    );
}

interface Customer {
    id: number;
    company_name: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    client: Customer | null;
    customer_id: number;
    start_date: string;
    end_date: string | null;
    status: string;
    budget: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    location?: { name: string };
}

interface Resource {
    id: number;
    project_id: number;
    name?: string;
    description?: string;
    quantity?: number;
    rate?: number;
    amount?: number;
    date?: string;
    type?: string;
    total_cost?: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    project: any;
    manager?: any[];
    tasks?: any[];
    teamMembers?: any[];
    client?: any;
    location?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

// Add this wrapper component just before the main Show component
// This isolates the TaskDialog rendering from the parent component
function TaskDialogWrapper({
    open,
    onOpenChange,
    projectId,
    initialData,
    assignableUsers,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    initialData: any;
    assignableUsers: any[];
    onSuccess: () => void;
}) {
    // Only render if open is true to prevent unnecessary renders
    if (!open) return null;

    return (
        <TaskDialog
            open={open}
            onOpenChange={onOpenChange}
            projectId={projectId}
            initialData={initialData}
            assignableUsers={assignableUsers}
            onSuccess={onSuccess}
        />
    );
}

export default function Show({
    project,
    manager = [],
    tasks = [],
    teamMembers = [],
    manpower = [],
    equipment = [],
    materials = [],
    fuel = [],
    expenses = [],
    client = {},
    location = {},
    created_at,
    updated_at,
    deleted_at,
}: Props) {
    const { t } = useTranslation(['projects', 'common']);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [editingResourceType, setEditingResourceType] = useState<ResourceType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<{ resource: Resource; type: ResourceType } | null>(null);
    // Add state for report generation
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Add state for project delete dialog
    const [projectDeleteDialogOpen, setProjectDeleteDialogOpen] = useState(false);

    // Task states
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
    const [taskDeleteConfirmOpen, setTaskDeleteConfirmOpen] = useState(false);

    const formatStatus = (status: string) => {
        const statusMap: Record<string, { color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            active: { color: 'text-green-600', variant: 'outline' },
            completed: { color: 'text-blue-600', variant: 'default' },
            on_hold: { color: 'text-yellow-600', variant: 'secondary' },
            cancelled: { color: 'text-red-600', variant: 'destructive' },
        };

        return statusMap[status] || { color: 'text-gray-600', variant: 'outline' };
    };

    const statusStyle = formatStatus(project.status);

    const handleEditResource = (resource: Resource, type: ResourceType) => {
        setEditingResource(resource);
        setEditingResourceType(type);
        setIsDialogOpen(true);
    };

    const handleDeleteResource = (resource: Resource, type: ResourceType) => {
        setResourceToDelete({ resource, type });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!resourceToDelete) return;

        const { resource, type } = resourceToDelete;

        // Map the resource type to the correct route
        const routeMapping: Record<ResourceType, string> = {
            manpower: 'projects.resources.manpower.destroy',
            equipment: 'projects.resources.equipment.destroy',
            material: 'projects.resources.material.destroy',
            fuel: 'projects.resources.fuel.destroy',
            expense: 'projects.resources.expense.destroy',
        };

        const routeName = routeMapping[type];

        if (type === 'manpower') {
            const url = route(routeName, {
                project: project.id,
                manpower: resource.id,
            });
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
            });
            setDeleteConfirmOpen(false);
            setResourceToDelete(null);
            window.location.reload();
            return;
        }

        window.location.href = route(routeName, {
            project: project.id,
            [type]: resource.id,
        });
    };

    const handleResourceSuccess = () => {
        setIsDialogOpen(false);
        setEditingResource(null);
        setEditingResourceType(null);
    };

    // Calculate project progress based on status and timeline
    const calculateProgress = () => {
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

    const progressValue = calculateProgress();

    // Calculate resource statistics
    const resourceStats = {
        totalCount: manpower.length + equipment.length + materials.length + fuel.length + expenses.length,
        manpowerCount: manpower.length,
        equipmentCount: equipment.length,
        materialsCount: materials.length,
        fuelCount: fuel.length,
        expensesCount: expenses.length,
    };

    // Calculate resource costs
    const manpowerCost = manpower.reduce((sum, m) => sum + (parseFloat(m.total_cost) || 0), 0);
    const equipmentCost = equipment.reduce((sum, e) => sum + (parseFloat(e.total_cost) || 0), 0);
    const materialsCost = materials.reduce((sum, m) => sum + (parseFloat(m.total_cost) || 0), 0);
    const fuelCost = fuel.reduce((sum, f) => sum + (parseFloat(f.total_cost) || 0), 0);
    const expensesCost = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const grandTotal = manpowerCost + equipmentCost + materialsCost + fuelCost + expensesCost;

    // Update the handler for delete button click
    const handleDeleteProject = () => {
        setProjectDeleteDialogOpen(true);
    };

    // Add a new function to handle the actual deletion
    const handleConfirmProjectDelete = () => {
        window.location.href = route('projects.destroy', project.id);
        setProjectDeleteDialogOpen(false);
    };

    // Task handlers
    const handleEditTask = (task: ProjectTask) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    const handleDeleteTask = (task: ProjectTask) => {
        setTaskToDelete(task);
        setTaskDeleteConfirmOpen(true);
    };

    const handleTaskStatusChange = (task: ProjectTask, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
        window.location.href = route(
            'projects.tasks.update',
            { project: project.id, task: task.id },
            {
                status,
                completion_percentage: status === 'completed' ? 100 : task.completion_percentage,
            },
        );
    };

    const handleTaskCompletionChange = (task: ProjectTask, percentage: number) => {
        window.location.href = route(
            'projects.tasks.update',
            { project: project.id, task: task.id },
            {
                completion_percentage: percentage,
                status: percentage === 100 ? 'completed' : task.status,
            },
        );
    };

    const handleTaskSuccess = () => {
        setTaskDialogOpen(false);
        setEditingTask(null);
        window.location.reload();
    };

    const handleDeleteTaskConfirm = () => {
        if (!taskToDelete) return;

        // Use absolute URL for debugging
        const deleteUrl = route('projects.tasks.destroy', {
            project: project.id,
            task: taskToDelete.id,
        });
        console.log('Delete URL:', deleteUrl);

        window.location.href = deleteUrl;
    };

    // Add function to generate project report
    const generateReport = async () => {
        try {
            setIsGeneratingReport(true);

            // Make API call to generate the report
            const response = await fetch(`/api/projects/${project.id}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    include_resources: true,
                    include_tasks: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            // Get the report data as a blob for download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create temporary link and trigger download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `project-report-${project.id}.pdf`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(t('projects:report_generated_success'));
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(t('projects:error_generating_report'));
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: window.location.pathname },
    ];

    return (
        <AppLayout title={project.name} breadcrumbs={breadcrumbs} requiredPermission="projects.view">
            <div className="container mx-auto space-y-4 px-4 py-4 sm:px-6">
                {/* Header Section */}
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    {/* Project title and meta information */}
                    <div className="flex flex-wrap items-center justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight dark:text-white">{project.name}</h1>
                                <Badge variant={statusStyle.variant} className={`${statusStyle.color} ml-2`}>
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t('project_id')}: {project.id}
                            </p>
                        </div>
                        <div className="mt-3 flex items-center space-x-2 md:mt-0">
                            <Button variant="outline" size="sm" asChild>
                                <a href={route('projects.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('back_to_projects')}
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href={route('projects.edit', project.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('edit')}
                                </a>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDeleteProject}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('delete')}
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 mb-6 flex flex-wrap gap-3">
                        <Button variant="outline" size="sm" className="bg-white shadow-sm" onClick={generateReport} disabled={isGeneratingReport}>
                            {isGeneratingReport ? (
                                <>
                                    <span className="mr-2 animate-spin">â³</span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white shadow-sm" asChild>
                            <a href={route('projects.resources', project.id)}>
                                <Package className="mr-2 h-4 w-4" />
                                Manage Resources
                            </a>
                        </Button>
                        <Button className="bg-purple-600 shadow-sm hover:bg-purple-700" size="sm" asChild>
                            <a href={route('projects.resources', project.id) + '?tab=tasks'}>
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Manage Tasks
                            </a>
                        </Button>
                    </div>

                    {/* Project Summary Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="flex items-center rounded-lg border border-blue-100 bg-blue-50 p-3">
                            <div className="mr-3 rounded-full bg-blue-100 p-2">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-blue-800">Tasks</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-blue-700">{tasks.length}</span>
                                    <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">
                                        {tasks.filter((t) => t.status === 'completed').length} completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center rounded-lg border border-green-100 bg-green-50 p-3">
                            <div className="mr-3 rounded-full bg-green-100 p-2">
                                <BarChart2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-green-800">Resources</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-green-700">{resourceStats.totalCount}</span>
                                    <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                                        {resourceStats.manpowerCount} manpower
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center rounded-lg border border-amber-100 bg-amber-50 p-3">
                            <div className="mr-3 rounded-full bg-amber-100 p-2">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-amber-800">Duration</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-amber-700">
                                        {project.start_date ? (
                                            project.end_date ? (
                                                `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                                            ) : (
                                                <span className="text-blue-600">Ongoing</span>
                                            )
                                        ) : (
                                            'Not started'
                                        )}
                                    </span>
                                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">days</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center rounded-lg border border-red-100 bg-red-50 p-3">
                            <div className="mr-3 rounded-full bg-red-100 p-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-red-800">Overdue</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-red-700">
                                        {tasks.filter((t) => t.status === 'pending' && new Date(t.due_date) < new Date()).length}
                                    </span>
                                    <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-xs text-red-800">tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-800">
                        {project.start_date && project.end_date && (
                            <>
                                <div className="mb-2 flex justify-between">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm font-semibold">
                                        {(() => {
                                            const today = new Date();
                                            const endDate = new Date(project.end_date);
                                            const startDate = new Date(project.start_date);

                                            // Calculate total project duration in days
                                            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                                            // Calculate days elapsed
                                            const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                                            // Calculate time progress percentage
                                            const timeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

                                            return `${timeProgress}%`;
                                        })()}
                                    </span>
                                </div>
                                <Progress
                                    value={(() => {
                                        const today = new Date();
                                        const endDate = new Date(project.end_date);
                                        const startDate = new Date(project.start_date);
                                        // Calculate total project duration in days
                                        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                        // Calculate days elapsed
                                        const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                        // Calculate time progress percentage
                                        return totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;
                                    })()}
                                    className="h-3 bg-gray-100"
                                />
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                                        <span>
                                            {(() => {
                                                const today = new Date();
                                                const endDate = new Date(project.end_date);
                                                const startDate = new Date(project.start_date);

                                                // Calculate days remaining
                                                const daysRemaining = Math.max(
                                                    0,
                                                    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
                                                );

                                                if (daysRemaining === 0) {
                                                    return 'Deadline reached';
                                                } else {
                                                    return `${daysRemaining} days remaining`;
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <div>
                                        {(() => {
                                            const taskProgress =
                                                tasks.length > 0
                                                    ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
                                                    : 0;
                                            const today = new Date();
                                            const endDate = new Date(project.end_date);
                                            const startDate = new Date(project.start_date);

                                            // Calculate total project duration in days
                                            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                                            // Calculate days elapsed
                                            const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                                            // Calculate time progress percentage
                                            const timeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

                                            // Determine if project is ahead, on track, or behind schedule
                                            let status = '';
                                            let statusColor = '';

                                            if (taskProgress >= timeProgress + 10) {
                                                status = 'Ahead of schedule';
                                                statusColor = 'text-green-600 font-medium';
                                            } else if (taskProgress >= timeProgress - 10) {
                                                status = 'On track';
                                                statusColor = 'text-blue-600 font-medium';
                                            } else {
                                                status = 'Behind schedule';
                                                statusColor = 'text-red-600 font-medium';
                                            }

                                            return <span className={statusColor}>{status}</span>;
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Resource Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Project Financial Summary - Combined Card */}
                    <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                        <CardContent className="p-4">
                            <h3 className="mb-3 flex items-center text-base font-medium">
                                <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                {t('financial_summary')}
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">{t('th_total_cost')}</span>
                                        <span className="text-sm font-medium">
                                            SAR {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">{t('budget')}</span>
                                        <span className="text-sm font-medium">
                                            SAR{' '}
                                            {Number(project.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {(() => {
                                        const balance = Number(project.budget) - grandTotal;
                                        const isProfitable = balance >= 0;
                                        return (
                                            <div className="mt-1 flex justify-between">
                                                <span className="text-sm text-gray-500">{t('balance')}</span>
                                                <span className={`text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                                                    SAR {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {(() => {
                                    const budget = Number(project.budget) || 1;
                                    const budgetPercentage = Math.min(Math.round((grandTotal / budget) * 100), 100);
                                    const profitPercentage =
                                        Number(project.budget) > 0
                                            ? Math.round((Math.abs(Number(project.budget) - grandTotal) / Number(project.budget)) * 100)
                                            : 0;
                                    const isProfitable = Number(project.budget) - grandTotal >= 0;
                                    return (
                                        <>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>{t('budget_utilization')}</span>
                                                    <span>{budgetPercentage}%</span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full ${isProfitable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
                                                        style={{ width: `${budgetPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center">
                                                <Badge
                                                    className={
                                                        isProfitable
                                                            ? 'border-green-200 bg-green-100 text-green-800'
                                                            : 'border-red-200 bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {isProfitable ? t('profit') : t('loss')}: {profitPercentage}%
                                                </Badge>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost Distribution */}
                    <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                        <CardContent className="p-4">
                            <h3 className="mb-3 flex items-center text-base font-medium">
                                <PieChart className="mr-2 h-4 w-4 text-blue-600" />
                                {t('cost_distribution')}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: t('manpower'), color: 'bg-blue-500', cost: manpowerCost },
                                    { name: t('equipment'), color: 'bg-green-500', cost: equipmentCost },
                                    { name: t('materials'), color: 'bg-amber-500', cost: materialsCost },
                                    { name: t('fuel'), color: 'bg-purple-500', cost: fuelCost },
                                    { name: t('expenses'), color: 'bg-red-500', cost: expensesCost },
                                ].map((category, index, arr) => {
                                    const percentage = grandTotal ? Math.round((category.cost / grandTotal) * 100) : 0;
                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{category.name}</span>
                                                <span>
                                                    SAR{' '}
                                                    {category.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                                                    ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`absolute top-0 left-0 h-full ${category.color} rounded-full`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resource Count */}
                    <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                        <CardContent className="p-4">
                            <h3 className="mb-3 flex items-center text-base font-medium">
                                <BarChart2 className="mr-2 h-4 w-4 text-indigo-600" />
                                {t('resource_count')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-3 text-center">
                                    <div className="text-2xl font-semibold text-blue-600">{manpower.length}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('manpower')}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-3 text-center">
                                    <div className="text-2xl font-semibold text-green-600">{equipment.length}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('equipment')}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-3 text-center">
                                    <div className="text-2xl font-semibold text-amber-600">{materials.length}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('materials')}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-3 text-center">
                                    <div className="text-2xl font-semibold text-purple-600">{fuel.length}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('fuel')}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-3 text-center">
                                    <div className="text-2xl font-semibold text-red-600">{expenses.length}</div>
                                    <p className="mt-1 text-xs text-muted-foreground">{t('expenses')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Progress Card */}
                    <ProjectProgress
                        percentage={progressValue}
                        completed={tasks.filter((t) => t.status === 'completed').length}
                        total={tasks.length}
                        inProgress={tasks.filter((t) => t.status === 'in_progress').length}
                        pending={tasks.filter((t) => t.status === 'pending').length}
                        overdue={tasks.filter((t) => t.status === 'pending' && new Date(t.due_date) < new Date()).length}
                        startDate={project.start_date || undefined}
                        endDate={project.end_date || undefined}
                        className="border border-gray-100 shadow-sm dark:border-gray-800"
                    />
                </div>

                {/* Project Overview Section */}
                <div>
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-500">{t('project_overview')}</h3>
                            <p className="text-sm text-blue-600/70 dark:text-blue-400/70">{t('description_and_timeline_details')}</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {/* Project Description */}
                        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
                            <h3 className="mb-2 text-base font-semibold">{t('project_description')}</h3>
                            {project.description ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
                            ) : (
                                <p className="text-sm text-gray-400">No description provided for this project.</p>
                            )}
                        </div>

                        {/* Project Timeline */}
                        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
                            <h3 className="mb-3 text-base font-semibold">{t('project_timeline')}</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">{t('lbl_start_date')}</p>
                                    <p className="text-base font-medium">
                                        {project.start_date ? format(new Date(project.start_date), 'MMMM do, yyyy') : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">{t('end_date')}</p>
                                    <p className="text-base font-medium">
                                        {project.end_date ? format(new Date(project.end_date), 'MMMM do, yyyy') : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">Duration</p>
                                    <p className="text-base font-medium">
                                        {project.start_date ? (
                                            project.end_date ? (
                                                `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                                            ) : (
                                                <span className="text-blue-600">Ongoing</span>
                                            )
                                        ) : (
                                            'Not started'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-gray-500">Location</p>
                                    <p className="text-base font-medium">{project.location ? project.location.name : 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Project Milestones */}
                        <div className="p-4">
                            <h3 className="mb-3 text-base font-semibold">{t('project_milestones')}</h3>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                {/* Start Milestone */}
                                <div className="flex-1 rounded-lg bg-blue-50/50 p-4">
                                    <div className="mb-2 flex justify-end">
                                        <span className="text-xs text-blue-700">
                                            {project.start_date ? format(new Date(project.start_date), 'MMM do, yyyy') : 'Date not set'}
                                        </span>
                                    </div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                        <h4 className="text-sm font-medium text-blue-700">{t('project_started')}</h4>
                                    </div>
                                    <p className="pl-5 text-xs text-gray-600">Project was initiated with initial requirements and planning.</p>
                                </div>

                                {/* Current Status Milestone */}
                                <div className="flex-1 rounded-lg bg-green-50/50 p-4">
                                    <div className="mb-2 flex justify-end">
                                        <span className="text-xs text-green-700">{format(new Date(), 'MMM do, yyyy')}</span>
                                    </div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <h4 className="text-sm font-medium text-green-700">Current Status: Active</h4>
                                    </div>
                                    <p className="pl-5 text-xs text-gray-600">Project is {progressValue}% complete based on timeline.</p>
                                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-green-100">
                                        <div className="h-full bg-green-500" style={{ width: `${progressValue}%` }}></div>
                                    </div>
                                </div>

                                {/* Completion Milestone */}
                                {project.end_date && (
                                    <div className="flex-1 rounded-lg bg-gray-50 p-4">
                                        <div className="mb-2 flex justify-end">
                                            <span className="text-xs text-gray-700">{format(new Date(project.end_date), 'MMM do, yyyy')}</span>
                                        </div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                                            <h4 className="text-sm font-medium text-gray-700">{t('expected_completion')}</h4>
                                        </div>
                                        <p className="pl-5 text-xs text-gray-600">Planned project completion date.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Timesheets Section */}
                <ProjectTimesheets projectId={project.id} />

                <ResourceDialog
                    projectId={project.id}
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialType={editingResourceType || 'manpower'}
                    initialData={editingResource}
                    onSuccess={handleResourceSuccess}
                />

                {taskDialogOpen && (
                    <TaskDialogWrapper
                        open={taskDialogOpen}
                        onOpenChange={setTaskDialogOpen}
                        projectId={project.id}
                        initialData={editingTask}
                        assignableUsers={teamMembers}
                        onSuccess={handleTaskSuccess}
                    />
                )}

                {/* Delete Resource Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_resource')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this resource? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirm} variant="destructive">
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Task Confirmation Dialog */}
                <Dialog open={taskDeleteConfirmOpen} onOpenChange={setTaskDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('delete_task')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this task? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTaskDeleteConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (taskToDelete) {
                                        handleDeleteTask(taskToDelete);
                                    }
                                }}
                                variant="destructive"
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Project Delete Confirmation Dialog */}
                <Dialog open={projectDeleteDialogOpen} onOpenChange={setProjectDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_project')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this project? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setProjectDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmProjectDelete} variant="destructive">
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Additional Project Analytics */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-1">
                        <BurndownChart
                            data={[
                                { date: '2024-07-01', remaining: 40 },
                                { date: '2024-07-02', remaining: 38 },
                                { date: '2024-07-03', remaining: 35 },
                                { date: '2024-07-04', remaining: 30 },
                                { date: '2024-07-05', remaining: 25 },
                                { date: '2024-07-06', remaining: 20 },
                                { date: '2024-07-07', remaining: 10 },
                                { date: '2024-07-08', remaining: 0 },
                            ]}
                        />
                    </div>
                    <div className="col-span-1">
                        <VelocityChart
                            data={[
                                { sprint: 'Sprint 1', completed: 10 },
                                { sprint: 'Sprint 2', completed: 12 },
                                { sprint: 'Sprint 3', completed: 15 },
                                { sprint: 'Sprint 4', completed: 13 },
                            ]}
                        />
                    </div>
                    <div className="col-span-1">
                        <CostAnalysisCard budget={project.budget} spent={grandTotal} />
                    </div>
                    <div className="col-span-1">
                        <RiskAssessmentCard
                            risks={[
                                { id: 1, description: 'Delayed vendor delivery', severity: 'High', status: 'Open' },
                                { id: 2, description: 'Resource shortage', severity: 'Medium', status: 'Mitigated' },
                                { id: 3, description: 'Scope creep', severity: 'Low', status: 'Closed' },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
