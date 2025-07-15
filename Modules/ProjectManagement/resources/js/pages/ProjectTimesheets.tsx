import { Button } from '@/Core/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/Core/components/ui/dialog';
import { Input } from '@/Core/components/ui/input';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProjectTimesheet {
    id: number;
    employee_id: number;
    date: string;
    hours_worked: number;
    overtime_hours: number;
    project_id: number;
    description?: string;
    tasks_completed?: string;
    status: string;
    employee?: { id: number; name: string };
    approver?: { id: number; name: string };
}

const ProjectTimesheets: React.FC<{ projectId?: number }> = ({ projectId }) => {
    const [timesheets, setTimesheets] = useState<ProjectTimesheet[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<Partial<ProjectTimesheet>>({});
    const [editId, setEditId] = useState<number | null>(null);
    const [summary, setSummary] = useState<any>(null);

    const fetchTimesheets = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/project-timesheets', { params: { project_id: projectId } });
            setTimesheets(data.data || data);
        } catch (e) {
            toast.error('Failed to load timesheets');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        if (!projectId) return;
        try {
            const { data } = await axios.get(`/api/project-timesheets/project/${projectId}/summary`);
            setSummary(data);
        } catch {
            setSummary(null);
        }
    };

    useEffect(() => {
        fetchTimesheets();
        fetchSummary();
        // eslint-disable-next-line
    }, [projectId]);

    const handleOpen = (ts?: ProjectTimesheet) => {
        if (ts) {
            setEditId(ts.id);
            setForm({ ...ts });
        } else {
            setEditId(null);
            setForm({ project_id: projectId });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/api/project-timesheets/${editId}`, form);
                toast.success('Timesheet updated');
            } else {
                await axios.post('/api/project-timesheets', form);
                toast.success('Timesheet created');
            }
            fetchTimesheets();
            fetchSummary();
            handleClose();
        } catch (err) {
            toast.error('Failed to save timesheet');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this timesheet?')) return;
        try {
            await axios.delete(`/api/project-timesheets/${id}`);
            toast.success('Timesheet deleted');
            fetchTimesheets();
            fetchSummary();
        } catch {
            toast.error('Failed to delete timesheet');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/api/project-timesheets/${id}/approve`);
            toast.success('Timesheet approved');
            fetchTimesheets();
            fetchSummary();
        } catch {
            toast.error('Failed to approve timesheet');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/api/project-timesheets/${id}/reject`);
            toast.success('Timesheet rejected');
            fetchTimesheets();
            fetchSummary();
        } catch {
            toast.error('Failed to reject timesheet');
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Project Timesheets</h1>
                <Button onClick={() => handleOpen()}>New Timesheet</Button>
            </div>
            {summary && (
                <div className="mb-4 rounded border bg-gray-50 p-4">
                    <div className="font-semibold">Summary</div>
                    <div>Total Hours: {summary.total_hours}</div>
                    <div>Total Overtime: {summary.total_overtime}</div>
                    <div>Entries: {summary.entries}</div>
                </div>
            )}
            <div className="space-y-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    timesheets.map((ts) => (
                        <div key={ts.id} className="flex flex-col rounded border p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="font-semibold">
                                    {formatDateMedium(ts.date)} - {ts.employee?.name || ts.employee_id}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {ts.hours_worked}h, OT: {ts.overtime_hours}h
                                </div>
                                <div className="text-xs text-gray-400">{ts.status}</div>
                            </div>
                            <div className="mt-2 flex gap-2 md:mt-0">
                                <Button variant="outline" onClick={() => handleOpen(ts)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(ts.id)}>
                                    Delete
                                </Button>
                                {ts.status !== 'approved' && (
                                    <Button variant="success" onClick={() => handleApprove(ts.id)}>
                                        Approve
                                    </Button>
                                )}
                                {ts.status !== 'rejected' && (
                                    <Button variant="destructive" onClick={() => handleReject(ts.id)}>
                                        Reject
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>{editId ? 'Edit Timesheet' : 'New Timesheet'}</DialogTitle>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="employee_id" placeholder="Employee ID" value={form.employee_id || ''} onChange={handleChange} required />
                        <Input name="date" type="date" placeholder="Date" value={form.date || ''} onChange={handleChange} required />
                        <Input
                            name="hours_worked"
                            type="number"
                            step="0.01"
                            placeholder="Hours Worked"
                            value={form.hours_worked || ''}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="overtime_hours"
                            type="number"
                            step="0.01"
                            placeholder="Overtime Hours"
                            value={form.overtime_hours || ''}
                            onChange={handleChange}
                        />
                        <Input name="description" placeholder="Description" value={form.description || ''} onChange={handleChange} />
                        <Input name="tasks_completed" placeholder="Tasks Completed" value={form.tasks_completed || ''} onChange={handleChange} />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectTimesheets;
