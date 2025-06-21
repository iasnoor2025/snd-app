import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, AlertCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

export interface ProjectTask {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    completion_percentage: number;
    assigned_to: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
}

interface TaskListProps {
    tasks: ProjectTask[];
    onEdit: (task: ProjectTask) => void;
    onDelete: (task: ProjectTask) => void;
    onStatusChange: (task: ProjectTask, event: any) => void;
    onCompletionChange: (task: ProjectTask, percentage: number) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, onCompletionChange }: TaskListProps) {
  const { t } = useTranslation('project');

    // Debug check for the task array passed to the component
    console.log('TaskList component received tasks:', { count: tasks?.length || 0, sample: tasks?.[0] })

    // Ensure tasks is always an array, even if null is passed
    const taskArray = tasks || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-slate-100">Pending</Badge>
            case 'in_progress':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{t('in_progress')}</Badge>
            case 'completed':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'low':
                return <Badge variant="outline" className="bg-slate-100">Low</Badge>
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
            case 'high':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    };

    const isDueOrOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        const today = new Date();
        const due = new Date(dueDate);
        return due <= today;
    };

    if (taskArray.length === 0) {
        return (
            <div className="border rounded-md p-8 text-center">
                <p className="text-lg font-medium text-gray-900">{t('no_tasks_found')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('add_tasks_to_track_project_progress')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {taskArray.map((task) => (
                <div key={task.id} className="border rounded-md p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{task.title}</h3>
                                {task.status === 'completed' && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                                {task.status === 'in_progress' && (
                                    <Clock className="h-4 w-4 text-blue-500" />
                                )}
                                {task.due_date && isDueOrOverdue(task.due_date) && task.status !== 'completed' && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2">{task.description || 'No description'}</p>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {getStatusBadge(task.status)}
                                {getPriorityBadge(task.priority)}
                                {task.due_date && (
                                    <Badge variant="outline" className={isDueOrOverdue(task.due_date) && task.status !== 'completed' ? 'bg-red-100 text-red-800 border-red-200' : ''}>
                                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                                    </Badge>
                                )}
                                {task.assigned_to && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                        {task.assigned_to.name}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">{t('open_menu')}</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(task)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{t('edit_task')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(task)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>{t('delete_task')}</span>
                                    </DropdownMenuItem>
                                    {task.status !== 'completed' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(task, { target: { value: 'completed' } })}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            <span>{t('mark_as_completed')}</span>
                                        </DropdownMenuItem>
                                    )}
                                    {task.status !== 'in_progress' && task.status !== 'completed' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(task, { target: { value: 'in_progress' } })}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>{t('mark_as_in_progress')}</span>
                                        </DropdownMenuItem>
                                    )}
                                    {task.status !== 'pending' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(task, { target: { value: 'pending' } })}>
                                            <span>{t('mark_as_pending')}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{task.completion_percentage}% completed</span>
                            <div className="flex space-x-2">
                                {task.status !== 'completed' && task.completion_percentage < 100 && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-xs py-0 px-2"
                                            onClick={() => onCompletionChange(task, Math.min(100, task.completion_percentage + 10))}
                                        >
                                            +10%
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-xs py-0 px-2"
                                            onClick={() => onCompletionChange(task, 100)}
                                        >
                                            Mark 100%
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <Progress value={task.completion_percentage} className="h-2 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}














