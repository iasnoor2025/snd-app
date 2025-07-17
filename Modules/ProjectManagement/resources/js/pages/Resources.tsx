import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Core';
import { Inertia } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Layers, Plus } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import DialogErrorBoundary from '../Components/DialogErrorBoundary';
import ErrorBoundary from '../Components/ErrorBoundary';
import ResourceFilters from '../Components/project/ResourceFilters';
import ResourceForm from '../Components/project/ResourceForm';
import ResourceList from '../Components/project/ResourceList';
import ResourcePagination from '../Components/project/ResourcePagination';
import TaskForm from '../Components/project/TaskForm';
import TaskList from '../Components/project/TaskList';

// Import tab components

// Define TaskStatus type for better type safety
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Define types for better type safety
type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense' | 'tasks';

interface Resource {
    id: number;
    project_id: number;
    name?: string;
    description: string | null;
    notes?: string;
    quantity?: number;
    rate?: number;
    daily_rate?: number;
    hourly_rate?: number;
    unit_price?: number;
    amount?: number;
    date?: string;
    type?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    total_cost?: number;
    created_at: string;
    updated_at: string;
    // Add manpower specific fields
    employee_id?: number | null;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    } | null;
    worker_name?: string | null;
    job_title?: string;
    start_date?: string;
    total_days?: number;
    // Add task specific fields
    title: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    completion_percentage: number;
    assigned_to: { id: number; name: string } | null;
    [key: string]: any; // Allow for additional properties
}

interface Project {
    id: number;
    name: string;
    budget?: number;
}

interface ResourcesPageProps {
    project: Project;
    manpower: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    equipment: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    materials: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    fuel: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    expenses: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tasks: {
        data: Resource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    assignableUsers: Array<{ id: number; name: string }>;
    type?: ResourceType;
    page?: number;
}

// Define filter interfaces for different resource types
interface ManpowerFilter {
    employeeId?: number | null;
    minDailyRate?: number | null;
    maxDailyRate?: number | null;
    dateRange?: { start: Date | null; end: Date | null };
    employeeStatus?: 'all' | 'with_employee' | 'without_employee';
}

interface EquipmentFilter {
    equipmentId?: number | null;
    minHourlyRate?: number | null;
    maxHourlyRate?: number | null;
}

interface MaterialFilter {
    minUnitPrice?: number | null;
    maxUnitPrice?: number | null;
    unit?: string | null;
}

interface FuelFilter {
    fuelType?: string | null;
    equipmentId?: number | null;
}

interface ExpenseFilter {
    category?: string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    dateRange?: { start: Date | null; end: Date | null };
}

interface TaskFilter {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null;
    priority?: 'low' | 'medium' | 'high' | null;
    assignedToId?: number | null;
    dueDateRange?: { start: Date | null; end: Date | null };
}

type ResourceFilter = ManpowerFilter | EquipmentFilter | MaterialFilter | FuelFilter | ExpenseFilter;

// Add type for filters
type ResourceFilters = {
    search?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};

// Separate dialog components for each resource type
const ManpowerDialog = React.memo(
    ({
        open,
        onOpenChange,
        projectId,
        initialData = null,
        onSuccess,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        projectId: number;
        initialData: any;
        onSuccess: () => void;
    }) => {
        const formKey = useMemo(() => `manpower-form-${initialData?.id || 'new'}-${Date.now()}`, [initialData?.id]);

        return (
            <DialogErrorBoundary>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                {initialData ? 'Edit Manpower Resource' : 'Add Manpower Resource'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {initialData ? 'Update the details for this manpower resource.' : 'Add a new manpower resource to this project.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <ErrorBoundary>
                                <ResourceForm key={formKey} type="manpower" projectId={projectId} initialData={initialData} onSuccess={onSuccess} />
                            </ErrorBoundary>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogErrorBoundary>
        );
    },
);

const EquipmentDialog = React.memo(
    ({
        open,
        onOpenChange,
        projectId,
        initialData = null,
        onSuccess,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        projectId: number;
        initialData: any;
        onSuccess: () => void;
    }) => {
        const formKey = useMemo(() => `equipment-form-${initialData?.id || 'new'}-${Date.now()}`, [initialData?.id]);

        return (
            <DialogErrorBoundary>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{initialData ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
                            <DialogDescription>
                                {initialData ? 'Update the details for this equipment resource.' : 'Add a new equipment resource to this project.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <ErrorBoundary>
                                <ResourceForm key={formKey} type="equipment" projectId={projectId} initialData={initialData} onSuccess={onSuccess} />
                            </ErrorBoundary>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogErrorBoundary>
        );
    },
);

const MaterialDialog = React.memo(
    ({
        open,
        onOpenChange,
        projectId,
        initialData = null,
        onSuccess,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        projectId: number;
        initialData: any;
        onSuccess: () => void;
    }) => {
        const formKey = useMemo(() => `material-form-${initialData?.id || 'new'}-${Date.now()}`, [initialData?.id]);

        return (
            <DialogErrorBoundary>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{initialData ? 'Edit Material' : 'Add Material'}</DialogTitle>
                            <DialogDescription>
                                {initialData ? 'Update the details for this material resource.' : 'Add a new material resource to this project.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <ErrorBoundary>
                                <ResourceForm key={formKey} type="material" projectId={projectId} initialData={initialData} onSuccess={onSuccess} />
                            </ErrorBoundary>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogErrorBoundary>
        );
    },
);

const FuelDialog = React.memo(
    ({
        open,
        onOpenChange,
        projectId,
        initialData = null,
        onSuccess,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        projectId: number;
        initialData: any;
        onSuccess: () => void;
    }) => {
        const formKey = useMemo(() => `fuel-form-${initialData?.id || 'new'}-${Date.now()}`, [initialData?.id]);

        return (
            <DialogErrorBoundary>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{initialData ? 'Edit Fuel' : 'Add Fuel'}</DialogTitle>
                            <DialogDescription>
                                {initialData ? 'Update the details for this fuel resource.' : 'Add a new fuel resource to this project.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <ErrorBoundary>
                                <ResourceForm key={formKey} type="fuel" projectId={projectId} initialData={initialData} onSuccess={onSuccess} />
                            </ErrorBoundary>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogErrorBoundary>
        );
    },
);

const ExpenseDialog = React.memo(
    ({
        open,
        onOpenChange,
        projectId,
        initialData = null,
        onSuccess,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        projectId: number;
        initialData: any;
        onSuccess: () => void;
    }) => {
        const formKey = useMemo(() => `expense-form-${initialData?.id || 'new'}-${Date.now()}`, [initialData?.id]);

        return (
            <DialogErrorBoundary>
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{initialData ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                            <DialogDescription>
                                {initialData ? 'Update the details for this expense.' : 'Add a new expense to this project.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <ErrorBoundary>
                                <ResourceForm key={formKey} type="expense" projectId={projectId} initialData={initialData} onSuccess={onSuccess} />
                            </ErrorBoundary>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogErrorBoundary>
        );
    },
);

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
    // Use local state to manage actual rendering to avoid race conditions with refs
    const [isRendered, setIsRendered] = useState(false);

    // Only render when dialog is actually open, with small delays for mounting/unmounting
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        if (open) {
            timeoutId = setTimeout(() => {
                setIsRendered(true);
            }, 10);
        } else {
            timeoutId = setTimeout(() => {
                setIsRendered(false);
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [open]);

    // Don't render anything if not mounted yet
    if (!isRendered && !open) return null;

    return (
        <DialogErrorBoundary>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{initialData ? 'Edit Task' : 'Add Task'}</DialogTitle>
                        <DialogDescription>{initialData ? 'Update task details' : 'Add a new task to this project'}</DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        projectId={projectId}
                        initialData={initialData}
                        assignableUsers={assignableUsers}
                        onSuccess={() => {
                            onSuccess();
                            onOpenChange(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </DialogErrorBoundary>
    );
}

// The main component wrapper
const ResourcesPage = ({
    project,
    manpower = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    equipment = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    materials = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    fuel = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    expenses = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    tasks = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    assignableUsers = [],
    type = 'manpower',
    page = 1,
}: ResourcesPageProps) => {
    const { t } = useTranslation(['projects', 'common']);
    // Wrap the entire component with an ErrorBoundary to prevent blank page
    return (
        <AppLayout
            title={t('projects:resources')}
            breadcrumbs={[
                { title: t('common:dashboard'), href: '/dashboard' },
                { title: t('projects:projects'), href: '/projects' },
                { title: project.name, href: `/projects/${project.id}` },
                { title: t('projects:resources'), href: `/projects/${project.id}/resources` },
            ]}
        >
            <ErrorBoundary
                fallback={
                    <div className="container mx-auto py-10 text-center">
                        <h2 className="mb-4 text-2xl font-bold">{t('projects:something_went_wrong')}</h2>
                        <p className="mb-4">{t('projects:error_loading_resources')}</p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => window.location.reload()}>{t('projects:reload_page')}</Button>
                            <Button variant="outline" onClick={() => window.history.back()}>
                                {t('projects:go_back')}
                            </Button>
                        </div>
                    </div>
                }
            >
                <Resources
                    project={project}
                    manpower={manpower}
                    equipment={equipment}
                    materials={materials}
                    fuel={fuel}
                    expenses={expenses}
                    tasks={tasks}
                    assignableUsers={assignableUsers}
                    type={type}
                    page={page}
                />
            </ErrorBoundary>
        </AppLayout>
    );
};

export default ResourcesPage;

// Main component implementation
function Resources({
    project,
    manpower = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    equipment = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    materials = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    fuel = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    expenses = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    tasks = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
    assignableUsers = [],
    type = 'manpower',
    page = 1,
}: ResourcesPageProps) {
    const { t } = useTranslation(['projects', 'common']);
    // Debug logging only in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('Resources component - rendering start', {
            projectInfo: { id: project?.id, name: project?.name },
            dataProvided: {
                manpowerCount: Array.isArray(manpower.data) ? manpower.data.length : 'not an array',
                equipmentCount: Array.isArray(equipment.data) ? equipment.data.length : 'not an array',
                materialsCount: Array.isArray(materials.data) ? materials.data.length : 'not an array',
                fuelCount: Array.isArray(fuel.data) ? fuel.data.length : 'not an array',
                expensesCount: Array.isArray(expenses.data) ? expenses.data.length : 'not an array',
                tasksCount: Array.isArray(tasks.data) ? tasks.data.length : 'not an array',
                hasAssignableUsers: Array.isArray(assignableUsers) && assignableUsers.length > 0,
            },
        });
    }

    try {
        const [selectedType, setSelectedType] = useState<ResourceType | 'tasks'>(type || 'manpower');
        const [currentPage, setCurrentPage] = useState(Number(page) || 1);
        const [itemsPerPage] = useState(10);

        // Update current page when URL changes
        useEffect(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('page');
            const typeParam = urlParams.get('type');
            if (pageParam) {
                setCurrentPage(Number(pageParam));
            }
            if (typeParam) {
                setSelectedType(typeParam as ResourceType | 'tasks');
            }
        }, [window.location.search]);

        // Add local state for tasks that can be updated
        const [localTasks, setTasks] = useState<Resource[]>(tasks.data || []);

        // Update local tasks whenever the props change
        useEffect(() => {
            if (Array.isArray(tasks.data)) {
                setTasks(tasks.data);
            }
        }, [tasks.data]);

        // Separate dialog states for each resource type
        const [manpowerDialogOpen, setManpowerDialogOpen] = useState(false);
        const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
        const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
        const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
        const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
        const [taskDialogOpen, setTaskDialogOpen] = useState(false);

        // Track the resource being edited
        const [editingResource, setEditingResource] = useState<Resource | null>(null);
        const [editingTask, setEditingTask] = useState<Resource | null>(null);
        const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
        const [resourceToDelete, setResourceToDelete] = useState<{ resource: any; type: string } | null>(null);

        // State for advanced filters
        const [filters, setFilters] = useState<{
            search?: string;
            status?: string;
            startDate?: Date;
            endDate?: Date;
            sortBy?: string;
            sortOrder?: 'asc' | 'desc';
        }>({
            search: '',
            status: '',
            startDate: undefined,
            endDate: undefined,
            sortBy: 'created_at',
            sortOrder: 'desc',
        });

        const getResourcesByType = (type: ResourceType): Resource[] => {
            switch (type) {
                case 'manpower':
                    return manpower.data;
                case 'equipment':
                    return equipment.data;
                case 'material':
                    return materials.data;
                case 'fuel':
                    return fuel.data;
                case 'expense':
                    return expenses.data;
                case 'tasks':
                    return tasks.data;
                default:
                    return [];
            }
        };

        const getPaginationData = (type: ResourceType) => {
            switch (type) {
                case 'manpower':
                    return {
                        currentPage: manpower.current_page,
                        totalPages: manpower.last_page,
                        total: manpower.total,
                    };
                case 'equipment':
                    return {
                        currentPage: equipment.current_page,
                        totalPages: equipment.last_page,
                        total: equipment.total,
                    };
                case 'material':
                    return {
                        currentPage: materials.current_page,
                        totalPages: materials.last_page,
                        total: materials.total,
                    };
                case 'fuel':
                    return {
                        currentPage: fuel.current_page,
                        totalPages: fuel.last_page,
                        total: fuel.total,
                    };
                case 'expense':
                    return {
                        currentPage: expenses.current_page,
                        totalPages: expenses.last_page,
                        total: expenses.total,
                    };
                case 'tasks':
                    return {
                        currentPage: tasks.current_page,
                        totalPages: tasks.last_page,
                        total: tasks.total,
                    };
                default:
                    return {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                    };
            }
        };

        const getResourceCount = (type: ResourceType | 'tasks'): number => {
            switch (type) {
                case 'manpower':
                    return manpower.total;
                case 'equipment':
                    return equipment.total;
                case 'material':
                    return materials.total;
                case 'fuel':
                    return fuel.total;
                case 'expense':
                    return expenses.total;
                case 'tasks':
                    return tasks.total;
                default:
                    return 0;
            }
        };

        const [isLoading, setIsLoading] = useState(false);

        const handleAddResource = () => {
            if (isLoading) return; // Prevent multiple clicks

            // Clear editing resource
            setEditingResource(null);
            setEditingTask(null);

            // Open the dialog based on the selected tab
            switch (selectedType) {
                case 'manpower':
                    setManpowerDialogOpen(true);
                    break;
                case 'equipment':
                    setEquipmentDialogOpen(true);
                    break;
                case 'material':
                    setMaterialDialogOpen(true);
                    break;
                case 'fuel':
                    setFuelDialogOpen(true);
                    break;
                case 'expense':
                    setExpenseDialogOpen(true);
                    break;
                case 'tasks':
                    setTaskDialogOpen(true);
                    break;
            }
        };

        const handleEditResource = (resource: Resource, type: ResourceType) => {
            // Set the resource to edit
            setEditingResource(resource);

            // Open the dialog based on resource type
            switch (type) {
                case 'manpower':
                    setManpowerDialogOpen(true);
                    break;
                case 'equipment':
                    setEquipmentDialogOpen(true);
                    break;
                case 'material':
                    setMaterialDialogOpen(true);
                    break;
                case 'fuel':
                    setFuelDialogOpen(true);
                    break;
                case 'expense':
                    setExpenseDialogOpen(true);
                    break;
            }
        };

        const handleDeleteResource = (resource: Resource, type: ResourceType) => {
            setResourceToDelete({ resource, type });
            setDeleteConfirmOpen(true);
        };

        const handleEditTask = (task: Resource) => {
            setEditingTask(task);
            setTaskDialogOpen(true);
        };

        const handleDeleteTask = (task: Resource) => {
            setResourceToDelete({ resource: task as unknown as Resource, type: 'tasks' as ResourceType });
            setDeleteConfirmOpen(true);
        };

        const handleTaskStatusChange = (task: Resource, event: any) => {
            // Get the new status from the event
            const newStatus = event.target.value as TaskStatus;
            const oldStatus = task.status;

            // If the status hasn't changed, do nothing
            if (newStatus === oldStatus) {
                return;
            }

            // Update the task's status in the backend
            axios
                .put(route('projects.tasks.update', { project: project.id, task: task.id }), {
                    status: newStatus,
                })
                .then((response) => {
                    // Update the task in local state
                    const updatedTasks = localTasks.map((t) =>
                        t.id === task.id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t,
                    );
                    setTasks(updatedTasks);

                    // Refresh the tasks data from the server
                    Inertia.reload({
                        only: ['tasks'],
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (page) => {
                            if (page.props.tasks) {
                                setTasks(page.props.tasks.data);
                            }
                        },
                    });

                    // Show success message
                    toast.success(
                        t('projects:task_status_changed', { oldStatus: t(`projects:${oldStatus}`), newStatus: t(`projects:${newStatus}`) }),
                    );
                })
                .catch((error) => {
                    // Show error message
                    toast.error(t('projects:error_updating_task_status'));
                });
        };

        const handleTaskCompletionChange = (task: Resource, percentage: number) => {
            const updatedStatus = percentage === 100 ? 'completed' : task.status;

            axios
                .put(route('projects.tasks.update', { project: project.id, task: task.id }), {
                    completion_percentage: percentage,
                    status: updatedStatus,
                })
                .then(() => {
                    // Update local state
                    const updatedTasks = localTasks.map((t) =>
                        t.id === task.id
                            ? { ...t, completion_percentage: percentage, status: updatedStatus, updated_at: new Date().toISOString() }
                            : t,
                    );
                    setTasks(updatedTasks);

                    // Refresh the tasks data from the server
                    Inertia.reload({
                        only: ['tasks'],
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (page) => {
                            if (page.props.tasks) {
                                setTasks(page.props.tasks.data);
                            }
                        },
                    });

                    toast.success(t('projects:task_completion_updated', { percentage }));
                })
                .catch(() => {
                    toast.error(t('projects:error_updating_task_completion'));
                });
        };

        const handleTaskSuccess = () => {
            setTaskDialogOpen(false);
            setEditingTask(null);

            const form = document.querySelector('form[data-resource-type="task"]') as HTMLFormElement;
            if (form) {
                const formData = new FormData(form);
                const taskData = Object.fromEntries(formData.entries());

                if (editingTask) {
                    const updatedTasks = localTasks.map((task) =>
                        task.id === editingTask.id ? { ...task, ...taskData, updated_at: new Date().toISOString() } : task,
                    );
                    setTasks(updatedTasks);

                    toast.success(t('projects:task_updated'));
                } else {
                    Inertia.get(route('projects.tasks.index', { project: project.id }))
                        .then((response) => {
                            if (response.data && Array.isArray(response.data)) {
                                setTasks(response.data);
                            }

                            toast.success(t('projects:task_added_success'));
                        })
                        .catch((error) => {
                            console.error('Error fetching updated tasks:', error);
                            Inertia.reload({ only: ['tasks'] });
                        });
                }
            } else {
                Inertia.reload({
                    only: ['tasks'],
                    onSuccess: (page) => {
                        if (page.props.tasks) {
                            setTasks(page.props.tasks as Resource[]);
                        }

                        toast.success(editingTask ? t('projects:task_updated_success') : t('projects:task_added_success'));
                    },
                });
            }
        };

        const handleResourceSuccess = () => {
            // Close all dialogs
            setManpowerDialogOpen(false);
            setEquipmentDialogOpen(false);
            setMaterialDialogOpen(false);
            setFuelDialogOpen(false);
            setExpenseDialogOpen(false);
            setTaskDialogOpen(false);

            // Clear editing states
            setEditingResource(null);
            setEditingTask(null);

            // Refresh the page data
            Inertia.reload({ only: [selectedType] });
        };

        const handleDeleteConfirmed = async () => {
            if (!resourceToDelete) return;

            const { resource, type } = resourceToDelete;
            // Use web route for manpower delete
            if (type === 'manpower') {
                const url = route('projects.resources.manpower.destroy', {
                    project: project.id,
                    manpower: resource.id,
                });
                // Use fetch to send a DELETE request
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
                Inertia.reload({ only: ['manpower'] });
                return;
            }
            // Keep API route for other types
            const url = `/api/projects/${project.id}/resources/${type}/${resource.id}`;
            try {
                await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
                await axios.delete(url, { withCredentials: true });
                toast.success(t('projects:resource_deleted_success'));
                setDeleteConfirmOpen(false);
                setResourceToDelete(null);
                Inertia.reload({ only: [type] });
            } catch (error) {
                console.error('Error deleting resource:', error);
                toast.error(t('projects:error_deleting_resource'));
                setDeleteConfirmOpen(false);
                setResourceToDelete(null);
            }
        };

        const handlePageChange = (page: number) => {
            Inertia.get(
                route('projects.resources', { project: project.id }),
                {
                    type: selectedType,
                    page: page,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: [selectedType],
                    replace: true,
                },
            );
        };

        const handleTypeChange = (type: string) => {
            setSelectedType(type as ResourceType | 'tasks');
            setCurrentPage(1);
            Inertia.get(
                route('projects.resources', { project: project.id }),
                {
                    type,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: [type],
                    replace: true,
                },
            );
        };

        // Calculate project analytics
        const { taskProgress, taskStats } = useMemo(() => {
            const totalTasks = (tasks.data || []).length;
            const completedTasks = (tasks.data || []).filter((task) => task.status === 'completed').length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            const stats = {
                total: totalTasks,
                completed: completedTasks,
                inProgress: (tasks.data || []).filter((task) => task.status === 'in_progress').length,
                pending: (tasks.data || []).filter((task) => task.status === 'pending').length,
                cancelled: (tasks.data || []).filter((task) => task.status === 'cancelled').length,
            };

            return {
                taskProgress: progress,
                taskStats: stats,
            };
        }, [tasks.data]);

        // Use the calculated values
        const progressPercentage = taskProgress;
        const taskStatistics = taskStats;

        // Calculate resource costs and distributions
        const analytics = useMemo(() => {
            const manpowerCost = (manpower.data || []).reduce((sum, item) => sum + (item.daily_rate || 0), 0);
            const equipmentCost = (equipment.data || []).reduce((sum, item) => sum + (item.hourly_rate || 0), 0);
            const materialsCost = (materials.data || []).reduce((sum, item) => sum + (item.unit_price || 0), 0);
            const fuelCost = (fuel.data || []).reduce((sum, item) => sum + (item.amount || 0), 0);
            const expensesCost = (expenses.data || []).reduce((sum, item) => sum + (item.amount || 0), 0);

            const totalCost = manpowerCost + equipmentCost + materialsCost + fuelCost + expensesCost;
            const budget = project.budget || 0;
            const balance = budget - totalCost;
            const isProfitable = balance >= 0;
            const profitPercentage = budget > 0 ? Math.round((balance / budget) * 100) : 0;

            const getPercentage = (value: number) => {
                if (!totalCost || totalCost === 0) return 0;
                if (isNaN(value) || value === 0) return 0;
                return Math.round((value / totalCost) * 100);
            };

            return {
                totalCost,
                budget,
                balance,
                isProfitable,
                profitPercentage,
                manpowerCost,
                equipmentCost,
                materialsCost,
                fuelCost,
                expensesCost,
                manpowerPercentage: getPercentage(manpowerCost),
                equipmentPercentage: getPercentage(equipmentCost),
                materialsPercentage: getPercentage(materialsCost),
                fuelPercentage: getPercentage(fuelCost),
                expensesPercentage: getPercentage(expensesCost),
            };
        }, [manpower.data, equipment.data, materials.data, fuel.data, expenses.data, project.budget]);

        // Filter resources based on search query and active filters
        const filteredResources = useMemo(() => {
            const resources = getResourcesByType(selectedType);
            let filtered = [...resources];

            // Apply search filter
            if (filters.search) {
                const query = filters.search.toLowerCase();
                filtered = filtered.filter((resource) => {
                    // Search in common fields
                    const searchable = [
                        'name' in resource ? resource.name : '',
                        'description' in resource ? resource.description : '',
                        'notes' in resource ? resource.notes : '',
                        'title' in resource ? resource.title : '', // For tasks
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    return searchable.includes(query);
                });
            }

            // Apply date range filter
            if (filters.startDate || filters.endDate) {
                filtered = filtered.filter((resource) => {
                    const resourceDate = new Date(resource.created_at);
                    if (filters.startDate && resourceDate < filters.startDate) return false;
                    if (filters.endDate && resourceDate > filters.endDate) return false;
                    return true;
                });
            }

            return filtered;
        }, [selectedType, getResourcesByType, filters]);

        // Sort resources based on sort order
        const sortedResources = useMemo(() => {
            return [...filteredResources].sort((a, b) => {
                const sortBy = filters.sortBy || 'created_at';
                const sortOrder = filters.sortOrder || 'desc';

                let aValue: any, bValue: any;

                switch (sortBy) {
                    case 'created_at':
                        aValue = new Date(a.created_at).getTime();
                        bValue = new Date(b.created_at).getTime();
                        break;
                    case 'hours':
                        aValue = ('hours' in a ? a.hours : 0) || 0;
                        bValue = ('hours' in b ? b.hours : 0) || 0;
                        break;
                    case 'quantity':
                        aValue = ('quantity' in a ? a.quantity : 0) || 0;
                        bValue = ('quantity' in b ? b.quantity : 0) || 0;
                        break;
                    case 'cost':
                    case 'amount':
                        aValue =
                            ('daily_rate' in a
                                ? a.daily_rate
                                : 'hourly_rate' in a
                                  ? a.hourly_rate
                                  : 'unit_price' in a
                                    ? a.unit_price
                                    : 'amount' in a
                                      ? a.amount
                                      : 0) || 0;
                        bValue =
                            ('daily_rate' in b
                                ? b.daily_rate
                                : 'hourly_rate' in b
                                  ? b.hourly_rate
                                  : 'unit_price' in b
                                    ? b.unit_price
                                    : 'amount' in b
                                      ? b.amount
                                      : 0) || 0;
                        break;
                    default:
                        aValue = 0;
                        bValue = 0;
                }

                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            });
        }, [filteredResources, filters.sortBy, filters.sortOrder]);

        return (
            <ErrorBoundary>
                <Head title={`${project.name} - ${t('projects:resources')}`} />

                <div className="container mx-auto space-y-6 py-6">
                    {/* Header section with clean modern styling */}
                    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center text-xl">
                                    <Layers className="mr-2 h-5 w-5 text-blue-500" />
                                    {t('projects:resources')}
                                </CardTitle>
                                <CardDescription>{t('projects:project_resources')}</CardDescription>
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={route('projects.show', project.id)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t('common:back')} {t('common:to')} {t('projects:project')}
                                    </a>
                                </Button>
                                <Button size="sm" onClick={handleAddResource}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('projects:add_resource')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="border-t-4 border-t-blue-500 shadow-sm">
                        <CardContent className="pt-6">
                            {/* Filters Section */}
                            <ResourceFilters
                                type={selectedType === 'tasks' ? 'manpower' : selectedType}
                                filters={filters}
                                onFilterChange={setFilters}
                                onReset={() =>
                                    setFilters({
                                        search: '',
                                        status: '',
                                        startDate: undefined,
                                        endDate: undefined,
                                        sortBy: 'created_at',
                                        sortOrder: 'desc',
                                    })
                                }
                            />

                            <div className="mt-6">
                                <Tabs defaultValue="manpower" value={selectedType} onValueChange={handleTypeChange} className="w-full">
                                    <TabsList className="mb-4 grid w-full grid-cols-3 lg:grid-cols-6">
                                        <TabsTrigger value="manpower" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:manpower')}</span>
                                            {getResourceCount('manpower') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('manpower')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="equipment" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:equipment')}</span>
                                            {getResourceCount('equipment') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('equipment')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="material" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:materials')}</span>
                                            {getResourceCount('material') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('material')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="fuel" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:fuel')}</span>
                                            {getResourceCount('fuel') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('fuel')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="expense" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:expenses')}</span>
                                            {getResourceCount('expense') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('expense')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="tasks" className="flex items-center justify-center gap-2 text-xs lg:text-sm">
                                            <span className="truncate">{t('projects:tasks')}</span>
                                            {getResourceCount('tasks') > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-4 min-w-[1.5rem] items-center justify-center px-1.5 text-xs"
                                                >
                                                    {getResourceCount('tasks')}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="manpower">
                                        {getResourcesByType('manpower').length > 0 ? (
                                            <ErrorBoundary>
                                                <ResourceList
                                                    type="manpower"
                                                    resources={getResourcesByType('manpower')}
                                                    pagination={{
                                                        current_page: manpower.current_page,
                                                        from: (manpower.current_page - 1) * manpower.per_page + 1,
                                                        last_page: manpower.last_page,
                                                        per_page: manpower.per_page,
                                                        to: Math.min(manpower.current_page * manpower.per_page, manpower.total),
                                                        total: manpower.total,
                                                    }}
                                                    projectId={project.id}
                                                    onEdit={(resource) => handleEditResource(resource, 'manpower')}
                                                    onDelete={(resource) => handleDeleteResource(resource, 'manpower')}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    No manpower resources found{filters.search && ' matching your search'}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="equipment">
                                        {getResourcesByType('equipment').length > 0 ? (
                                            <ErrorBoundary>
                                                <ResourceList
                                                    type="equipment"
                                                    resources={getResourcesByType('equipment')}
                                                    pagination={{
                                                        current_page: equipment.current_page,
                                                        from: (equipment.current_page - 1) * equipment.per_page + 1,
                                                        last_page: equipment.last_page,
                                                        per_page: equipment.per_page,
                                                        to: Math.min(equipment.current_page * equipment.per_page, equipment.total),
                                                        total: equipment.total,
                                                    }}
                                                    projectId={project.id}
                                                    onEdit={(resource) => handleEditResource(resource, 'equipment')}
                                                    onDelete={(resource) => handleDeleteResource(resource, 'equipment')}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    No equipment resources found{filters.search && ' matching your search'}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="material">
                                        {getResourcesByType('material').length > 0 ? (
                                            <ErrorBoundary>
                                                <ResourceList
                                                    type="material"
                                                    resources={getResourcesByType('material')}
                                                    pagination={{
                                                        current_page: materials.current_page,
                                                        from: (materials.current_page - 1) * materials.per_page + 1,
                                                        last_page: materials.last_page,
                                                        per_page: materials.per_page,
                                                        to: Math.min(materials.current_page * materials.per_page, materials.total),
                                                        total: materials.total,
                                                    }}
                                                    projectId={project.id}
                                                    onEdit={(resource) => handleEditResource(resource, 'material')}
                                                    onDelete={(resource) => handleDeleteResource(resource, 'material')}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    {t('projects:no_resources_found', { type: t('projects:material') })}
                                                    {filters.search && t('projects:matching_your_search')}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="fuel">
                                        {getResourcesByType('fuel').length > 0 ? (
                                            <ErrorBoundary>
                                                <ResourceList
                                                    type="fuel"
                                                    resources={getResourcesByType('fuel')}
                                                    pagination={{
                                                        current_page: fuel.current_page,
                                                        from: (fuel.current_page - 1) * fuel.per_page + 1,
                                                        last_page: fuel.last_page,
                                                        per_page: fuel.per_page,
                                                        to: Math.min(fuel.current_page * fuel.per_page, fuel.total),
                                                        total: fuel.total,
                                                    }}
                                                    projectId={project.id}
                                                    onEdit={(resource) => handleEditResource(resource, 'fuel')}
                                                    onDelete={(resource) => handleDeleteResource(resource, 'fuel')}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    {t('projects:no_resources_found', { type: t('projects:fuel') })}
                                                    {filters.search && t('projects:matching_your_search')}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="expense">
                                        {getResourcesByType('expense').length > 0 ? (
                                            <ErrorBoundary>
                                                <ResourceList
                                                    type="expense"
                                                    resources={getResourcesByType('expense')}
                                                    pagination={{
                                                        current_page: expenses.current_page,
                                                        from: (expenses.current_page - 1) * expenses.per_page + 1,
                                                        last_page: expenses.last_page,
                                                        per_page: expenses.per_page,
                                                        to: Math.min(expenses.current_page * expenses.per_page, expenses.total),
                                                        total: expenses.total,
                                                    }}
                                                    projectId={project.id}
                                                    onEdit={(resource) => handleEditResource(resource, 'expense')}
                                                    onDelete={(resource) => handleDeleteResource(resource, 'expense')}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    {t('projects:no_resources_found', { type: t('projects:expense') })}
                                                    {filters.search && t('projects:matching_your_search')}
                                                </p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="tasks">
                                        {localTasks && localTasks.length > 0 ? (
                                            <ErrorBoundary>
                                                <TaskList
                                                    tasks={sortedResources as Resource[]}
                                                    onEdit={handleEditTask}
                                                    onDelete={handleDeleteTask}
                                                    onStatusChange={handleTaskStatusChange}
                                                    onCompletionChange={handleTaskCompletionChange}
                                                />
                                            </ErrorBoundary>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-muted-foreground">
                                                    {t('projects:no_tasks_found')}
                                                    {filters.search && t('projects:matching_your_search')}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTaskDialogOpen(true);
                                                    }}
                                                    className="mt-2"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {t('projects:add_first_task')}
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex justify-center">
                                <ResourcePagination
                                    currentPage={getPaginationData(selectedType).currentPage}
                                    totalPages={getPaginationData(selectedType).totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resource dialogs - wrapped in error boundaries */}
                    <ErrorBoundary>
                        <ManpowerDialog
                            open={manpowerDialogOpen}
                            onOpenChange={setManpowerDialogOpen}
                            projectId={project.id}
                            initialData={editingResource}
                            onSuccess={handleResourceSuccess}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <EquipmentDialog
                            open={equipmentDialogOpen}
                            onOpenChange={setEquipmentDialogOpen}
                            projectId={project.id}
                            initialData={editingResource}
                            onSuccess={handleResourceSuccess}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <MaterialDialog
                            open={materialDialogOpen}
                            onOpenChange={setMaterialDialogOpen}
                            projectId={project.id}
                            initialData={editingResource}
                            onSuccess={handleResourceSuccess}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <FuelDialog
                            open={fuelDialogOpen}
                            onOpenChange={setFuelDialogOpen}
                            projectId={project.id}
                            initialData={editingResource}
                            onSuccess={handleResourceSuccess}
                        />
                    </ErrorBoundary>

                    <ErrorBoundary>
                        <ExpenseDialog
                            open={expenseDialogOpen}
                            onOpenChange={setExpenseDialogOpen}
                            projectId={project.id}
                            initialData={editingResource}
                            onSuccess={handleResourceSuccess}
                        />
                    </ErrorBoundary>

                    {/* Add Task Dialog with error boundary */}
                    <ErrorBoundary>
                        {taskDialogOpen && (
                            <TaskDialogWrapper
                                open={taskDialogOpen}
                                onOpenChange={setTaskDialogOpen}
                                projectId={project.id}
                                initialData={editingTask}
                                assignableUsers={assignableUsers}
                                onSuccess={handleTaskSuccess}
                            />
                        )}
                    </ErrorBoundary>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {resourceToDelete?.type === 'tasks' ? t('projects:delete_task') : t('projects:delete_resource')}
                                </DialogTitle>
                                <DialogDescription>
                                    {resourceToDelete?.type === 'tasks'
                                        ? t('projects:confirm_delete_task')
                                        : t('projects:confirm_delete_resource', {
                                              type: resourceToDelete?.type ? t(`projects:${resourceToDelete.type}`) : '',
                                          })}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                                    {t('common:cancel')}
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteConfirmed}>
                                    {t('common:delete')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('Error in Resources component:', error);
        return (
            <div className="container mx-auto py-10 text-center">
                <h2 className="mb-4 text-2xl font-bold">{t('projects:something_went_wrong')}</h2>
                <p className="mb-4">
                    {t('projects:error_loading_resources')} Error: {error instanceof Error ? error.message : String(error)}
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => window.location.reload()}>{t('projects:reload_page')}</Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        {t('projects:go_back')}
                    </Button>
                </div>
            </div>
        );
    }
}
