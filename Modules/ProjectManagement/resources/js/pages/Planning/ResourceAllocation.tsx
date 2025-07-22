import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ResourceAllocation() {
    const [projectId, setProjectId] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        type: '',
        name: '',
        quantity: '',
        unit_cost: '',
        date: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/projects')
            .then((res) => res.json())
            .then((data) => setProjects(data))
            .catch(() => toast.error('Failed to load projects'));
    }, []);

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        fetch(`/api/projects/${projectId}/resources`)
            .then((res) => res.json())
            .then((data) => {
                setResources(data.resources || []);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load resources');
                setLoading(false);
            });
    }, [projectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to allocate resource');
            toast.success('Resource allocated');
            setForm({ type: '', name: '', quantity: '', unit_cost: '', date: '', notes: '' });
            // Refresh resources
            fetch(`/api/projects/${projectId}/resources`)
                .then((res) => res.json())
                .then((data) => setResources(data.resources || []));
        } catch {
            toast.error('Failed to allocate resource');
        }
        setSubmitting(false);
    };

    const grouped = resources.reduce((acc: any, r: any) => {
        acc[r.type] = acc[r.type] || [];
        acc[r.type].push(r);
        return acc;
    }, {});

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <label className="mb-1 block">Select Project</label>
                    <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input">
                        <option value="">-- Select --</option>
                        {projects.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                {projectId && (
                    <>
                        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block">Type</label>
                                <select name="type" value={form.type} onChange={handleChange} className="input" required>
                                    <option value="">Select</option>
                                    <option value="manpower">Manpower</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="material">Material</option>
                                    <option value="fuel">Fuel</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block">Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} className="input" required />
                            </div>
                            <div>
                                <label className="mb-1 block">Quantity</label>
                                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="input" required />
                            </div>
                            <div>
                                <label className="mb-1 block">Unit Cost</label>
                                <input type="number" name="unit_cost" value={form.unit_cost} onChange={handleChange} className="input" required />
                            </div>
                            <div>
                                <label className="mb-1 block">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formatDateMedium(form.date)}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="mb-1 block">Notes</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
                            </div>
                            <div className="md:col-span-3">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Allocating...' : 'Allocate Resource'}
                                </Button>
                            </div>
                        </form>
                        <div className="mb-2 font-semibold">Allocated Resources</div>
                        {loading ? (
                            <div>Loading...</div>
                        ) : Object.keys(grouped).length === 0 ? (
                            <div>No resources allocated.</div>
                        ) : (
                            Object.keys(grouped).map((type) => (
                                <div key={type} className="mb-6">
                                    <div className="mb-1 font-semibold capitalize">{type}</div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border">
                                            <thead>
                                                <tr>
                                                    <th className="border px-2 py-1">Name</th>
                                                    <th className="border px-2 py-1">Quantity</th>
                                                    <th className="border px-2 py-1">Unit Cost</th>
                                                    <th className="border px-2 py-1">Total Cost</th>
                                                    <th className="border px-2 py-1">Date</th>
                                                    <th className="border px-2 py-1">Status</th>
                                                    <th className="border px-2 py-1">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grouped[type].map((r: any) => (
                                                    <tr key={r.id}>
                                                        <td className="border px-2 py-1">{r.name}</td>
                                                        <td className="border px-2 py-1">{r.quantity}</td>
                                                        <td className="border px-2 py-1">{r.unit_cost}</td>
                                                        <td className="border px-2 py-1">{r.total_cost}</td>
                                                        <td className="border px-2 py-1">{formatDateMedium(r.date)}</td>
                                                        <td className="border px-2 py-1">{r.status}</td>
                                                        <td className="border px-2 py-1">{r.notes}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
