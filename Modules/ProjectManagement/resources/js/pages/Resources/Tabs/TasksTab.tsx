import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Core';
import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import TaskList from '@/ProjectManagement/Components/project/TaskList.tsx';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { ResourceTable } from '../../../components/project/resources/ResourceTable';

interface TasksTabProps {
    project: {
        id: number;
        name: string;
    };
    tasks: ProjectTask[];
    assignableUsers: Array<{ id: number; name: string }>;
}

export default function TasksTab({ project, tasks, assignableUsers }: TasksTabProps) {
    const { t } = useTranslation(['projects', 'common']);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);

    const handleCreate = useCallback(() => {
        setSelectedTask(null);
        setCreateModalOpen(true);
    }, []);

    const handleEdit = useCallback((task: ProjectTask) => {
        setSelectedTask(task);
        setEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((task: ProjectTask) => {
        setTaskToDelete(task);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirmed = useCallback(async () => {
        if (!taskToDelete) return;

        try {
            await router.delete(route('projects.tasks.destroy', [project.id, taskToDelete.id]));
            toast.success(t('projects:task_deleted_success'));
            setDeleteModalOpen(false);
            setTaskToDelete(null);
        } catch (error) {
            toast.error(t('projects:error_deleting_task'));
        }
    }, [project.id, taskToDelete]);

    const handleStatusChange = useCallback(
        async (task: ProjectTask, event: any) => {
            try {
                await router.put(route('projects.tasks.status', { project: project.id, task: task.id }), {
                    status: event.target.value,
                });
                toast.success(t('projects:task_status_updated_success'));
            } catch (error) {
                toast.error(t('projects:error_updating_task_status'));
            }
        },
        [project.id],
    );

    const handleCompletionChange = useCallback(
        async (task: ProjectTask, percentage: number) => {
            try {
                await router.put(route('projects.tasks.update', [project.id, task.id]), {
                    completion_percentage: percentage,
                });
                toast.success(t('projects:task_completion_updated_success'));
            } catch (error) {
                toast.error(t('projects:error_updating_task_completion'));
            }
        },
        [project.id],
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <TaskList
                        tasks={tasks}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onCompletionChange={handleCompletionChange}
                    />
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('delete_task')}</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this task? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
