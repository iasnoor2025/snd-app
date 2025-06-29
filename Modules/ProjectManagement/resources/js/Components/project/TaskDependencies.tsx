import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Select, SelectItem, SelectTrigger, SelectContent, SelectValue, Card, CardHeader, CardTitle, CardContent } from '@/Core';
import { toast } from 'sonner';

export default function TaskDependencies({ taskId, allTasks }: { taskId: number, allTasks: { id: number, name: string }[] }) {
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDependencies = async () => {
    const { data } = await axios.get(`/api/tasks/${taskId}/dependencies`);
    setDependencies(data);
  };

  useEffect(() => { fetchDependencies(); }, [taskId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error('Select a task to depend on');
    setLoading(true);
    try {
      await axios.post(`/api/tasks/${taskId}/dependencies`, { depends_on_task_id: selected });
      toast.success('Dependency added');
      setSelected(null);
      fetchDependencies();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (dependsOnId: number) => {
    setLoading(true);
    try {
      await axios.delete(`/api/tasks/${taskId}/dependencies/${dependsOnId}`);
      toast.success('Dependency removed');
      fetchDependencies();
    } catch {
      toast.error('Failed to remove dependency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Task Dependencies</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Select value={selected?.toString() || ''} onValueChange={v => setSelected(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Select task to depend on" /></SelectTrigger>
            <SelectContent>
              {allTasks.filter(t => t.id !== taskId && !dependencies.some(d => d.id === t.id)).map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading || !selected}>Add Dependency</Button>
        </form>
        <ul className="space-y-2">
          {dependencies.map(dep => (
            <li key={dep.id} className="flex items-center gap-2">
              <span>{dep.name}</span>
              <Button size="sm" variant="destructive" onClick={() => handleRemove(dep.id)} disabled={loading}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
