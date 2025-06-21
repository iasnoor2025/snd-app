import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { ProjectList } from '../components/ProjectList';
import { ProjectForm } from '../components/ProjectForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Core";
import { Button } from "@/Core";
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

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

interface Manager {
    id: number;
    name: string;
}

interface ProjectsProps {
    projects: Project[];
    managers: Manager[];
}

export default function Projects({ projects: initialProjects, managers }: ProjectsProps) {
    const { t } = useTranslation(['projects', 'common']);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleCreate = async (data: any) => {
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            const newProject = await response.json();
            setProjects([...projects, newProject]);
            setIsCreateDialogOpen(false);
            toast.success(t('projects:project_created_success'));
        } catch (error) {
            toast.error(t('projects:error_creating_project'));
        }
    };

    const handleEdit = async (data: any) => {
        if (!selectedProject) return;

        try {
            const response = await fetch(`/api/projects/${selectedProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const updatedProject = await response.json();
            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
            setIsEditDialogOpen(false);
            setSelectedProject(null);
            toast.success(t('projects:project_updated_success'));
        } catch (error) {
            toast.error(t('projects:error_updating_project'));
        }
    };

    const handleDelete = async (projectId: number) => {
        if (!confirm(t('projects:confirm_delete_project'))) return;

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            setProjects(projects.filter(p => p.id !== projectId));
            toast.success(t('projects:project_deleted_success'));
        } catch (error) {
            toast.error(t('projects:error_deleting_project'));
        }
    };

    return (
        <AppLayout
            title={t('ttl_projects')}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Projects', href: '/projects' }
            ]}
        >
            <Head title={t('ttl_projects')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Projects</h2>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    New Project
                                </Button>
                            </div>

                            <ProjectList
                                projects={projects}
                                onEdit={(project) => {
                                    setSelectedProject(project);
                                    setIsEditDialogOpen(true);
                                }}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('create_new_project')}</DialogTitle>
                    </DialogHeader>
                    <ProjectForm
                        onSubmit={handleCreate}
                        managers={managers}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('edit_project')}</DialogTitle>
                    </DialogHeader>
                    {selectedProject && (
                        <ProjectForm
                            initialData={selectedProject}
                            onSubmit={handleEdit}
                            managers={managers}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}














