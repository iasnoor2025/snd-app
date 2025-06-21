import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Badge } from "@/Core";
import { Button } from "@/Core";
import { Progress } from "@/Core";
import { format } from 'date-fns';

interface Project {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string | null;
    status: string;
    budget: number;
    manager_id: number;
    client_name: string;
    client_contact: string;
    priority: string;
    progress: number;
}

interface ProjectListProps {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (projectId: number) => void;
}

const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    on_hold: 'bg-yellow-500',
    cancelled: 'bg-red-500',
};

const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
};

export const ProjectList: React.FC<ProjectListProps> = ({
    projects,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>{t('lbl_start_date')}</TableHead>
                        <TableHead>{t('end_date')}</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.client_name}</TableCell>
                            <TableCell>
                                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                                    {project.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={priorityColors[project.priority as keyof typeof priorityColors]}>
                                    {project.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={project.progress} className="w-[60px]" />
                                    <span>{project.progress}%</span>
                                </div>
                            </TableCell>
                            <TableCell>{format(new Date(project.start_date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                                {project.end_date
                                    ? format(new Date(project.end_date), 'MMM d, yyyy')
                                    : 'N/A'}
                            </TableCell>
                            <TableCell>${project.budget.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(project)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(project.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};














