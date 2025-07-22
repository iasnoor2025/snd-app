


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Dialog, DialogContent, DialogTitle, Input } from '@/Core/Components/ui';

interface ProjectTemplate {
    id: number;
    name: string;
    description?: string;
    data: Record<string, any>;
}

const ProjectTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<Partial<ProjectTemplate>>({});
    const [editId, setEditId] = useState<number | null>(null);
    const [applyId, setApplyId] = useState<number | null>(null);
    const [applyName, setApplyName] = useState('');
    const [applyDescription, setApplyDescription] = useState('');

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/project-templates');
            setTemplates(data);
        } catch (e) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpen = (template?: ProjectTemplate) => {
        if (template) {
            setEditId(template.id);
            setForm({ ...template });
        } else {
            setEditId(null);
            setForm({});
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setForm({});
        setEditId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setForm({ ...form, data: JSON.parse(e.target.value || '{}') });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/project-templates/${editId}`, form);
                toast.success('Template updated');
            } else {
                await axios.post('/api/project-templates', form);
                toast.success('Template created');
            }
            fetchTemplates();
            handleClose();
        } catch (err) {
            toast.error('Failed to save template');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this template?')) return;
        try {
            await axios.delete(`/api/project-templates/${id}`);
            toast.success('Template deleted');
            fetchTemplates();
        } catch {
            toast.error('Failed to delete template');
        }
    };

    const handleApply = async () => {
        if (!applyId) return;
        try {
            await axios.post(`/api/project-templates/${applyId}/apply`, {
                name: applyName,
                description: applyDescription,
            });
            toast.success('Project created from template');
            setApplyId(null);
            setApplyName('');
            setApplyDescription('');
        } catch {
            toast.error('Failed to apply template');
        }
    };

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Project Templates</h1>
                <Button onClick={() => handleOpen()}>New Template</Button>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    templates.map((tpl) => (
                        <div key={tpl.id} className="flex flex-col rounded border p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="font-semibold">{tpl.name}</div>
                                <div className="text-sm text-gray-500">{tpl.description}</div>
                            </div>
                            <div className="mt-2 flex gap-2 md:mt-0">
                                <Button variant="outline" onClick={() => handleOpen(tpl)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(tpl.id)}>
                                    Delete
                                </Button>
                                <Button
                                    onClick={() => {
                                        setApplyId(tpl.id);
                                        setApplyName('');
                                        setApplyDescription('');
                                    }}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>{editId ? 'Edit Template' : 'New Template'}</DialogTitle>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="name" placeholder="Name" value={form.name || ''} onChange={handleChange} required />
                        <Input name="description" placeholder="Description" value={form.description || ''} onChange={handleChange} />
                        <textarea
                            name="data"
                            placeholder="Template Data (JSON)"
                            value={form.data ? JSON.stringify(form.data, null, 2) : ''}
                            onChange={handleDataChange}
                            rows={6}
                            className="w-full rounded border p-2 font-mono"
                            required
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={!!applyId} onOpenChange={() => setApplyId(null)}>
                <DialogContent>
                    <DialogTitle>Apply Template</DialogTitle>
                    <Input placeholder="Project Name" value={applyName} onChange={(e) => setApplyName(e.target.value)} className="mb-2" required />
                    <Input
                        placeholder="Project Description"
                        value={applyDescription}
                        onChange={(e) => setApplyDescription(e.target.value)}
                        className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setApplyId(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Create Project</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectTemplates;
