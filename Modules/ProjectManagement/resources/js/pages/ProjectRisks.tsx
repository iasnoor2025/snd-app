import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, SelectItem, SelectTrigger, SelectContent, SelectValue, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/Core';
import { toast } from 'sonner';

const probabilityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
const impactOptions = probabilityOptions;
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'closed', label: 'Closed' },
];

export default function ProjectRisks({ projectId }: { projectId: number }) {
  const [risks, setRisks] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    probability: 'medium',
    impact: 'medium',
    status: 'open',
    mitigation_plan: '',
  });
  const [editing, setEditing] = useState(false);

  const fetchRisks = async () => {
    const { data } = await axios.get(`/api/projects/${projectId}/risks`);
    setRisks(data);
  };

  useEffect(() => { fetchRisks(); }, [projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/projects/${projectId}/risks/${form.id}`, form);
        toast.success('Risk updated');
      } else {
        await axios.post(`/api/projects/${projectId}/risks`, form);
        toast.success('Risk created');
      }
      setForm({ id: null, title: '', description: '', probability: 'medium', impact: 'medium', status: 'open', mitigation_plan: '' });
      setEditing(false);
      fetchRisks();
    } catch (err) {
      toast.error('Error saving risk');
    }
  };

  const handleEdit = (risk) => {
    setForm(risk);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this risk?')) return;
    await axios.delete(`/api/projects/${projectId}/risks/${id}`);
    toast.success('Risk deleted');
    fetchRisks();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Risks</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <FormLabel>Probability</FormLabel>
              <Select value={form.probability} onValueChange={v => handleSelect('probability', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {probabilityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FormLabel>Impact</FormLabel>
              <Select value={form.impact} onValueChange={v => handleSelect('impact', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {impactOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onValueChange={v => handleSelect('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <FormLabel>Description</FormLabel>
            <Textarea name="description" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <FormLabel>Mitigation Plan</FormLabel>
            <Textarea name="mitigation_plan" value={form.mitigation_plan} onChange={handleChange} />
          </div>
          <Button type="submit">{editing ? 'Update' : 'Add'} Risk</Button>
          {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(false); setForm({ id: null, title: '', description: '', probability: 'medium', impact: 'medium', status: 'open', mitigation_plan: '' }); }}>Cancel</Button>}
        </form>
        <div className="space-y-2">
          {risks.map(risk => (
            <Card key={risk.id} className="p-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">{risk.title}</div>
                <div className="text-xs text-gray-500">Probability: {risk.probability}, Impact: {risk.impact}, Status: {risk.status}</div>
                <div className="text-sm mt-1">{risk.description}</div>
                {risk.mitigation_plan && <div className="text-xs text-blue-700 mt-1">Mitigation: {risk.mitigation_plan}</div>}
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button size="sm" variant="outline" onClick={() => handleEdit(risk)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(risk.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
