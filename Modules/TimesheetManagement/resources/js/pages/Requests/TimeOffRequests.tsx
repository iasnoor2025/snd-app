import React, { useEffect, useState } from 'react';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function TimeOffRequests({ isAdmin = false, employeeId = null }: { isAdmin?: boolean; employeeId?: number | null }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    type: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation('TimesheetManagement');

  const fetchRequests = async () => {
    setLoading(true);
    let url = '/api/time-off-requests';
    if (employeeId) url += `?employee_id=${employeeId}`;
    const res = await fetch(url);
    const data = await res.json();
    setRequests(data.data || data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/time-off-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, employee_id: employeeId }),
      });
      if (!res.ok) throw new Error(t('submit_failed', 'Failed to submit request'));
      toast.success('Time-off request submitted');
      setForm({ start_date: '', end_date: '', type: '', reason: '' });
      fetchRequests();
    } catch {
      toast.error(t('submit_failed', 'Failed to submit request'));
    }
    setSubmitting(false);
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/time-off-requests/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error(t('approve_failed', 'Failed to approve'));
      toast.success('Request approved');
      fetchRequests();
    } catch {
      toast.error(t('approve_failed', 'Failed to approve request'));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      const res = await fetch(`/api/time-off-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: reason }),
      });
      if (!res.ok) throw new Error(t('reject_failed', 'Failed to reject'));
      toast.success('Request rejected');
      fetchRequests();
    } catch {
      toast.error(t('reject_failed', 'Failed to reject request'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Off Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block mb-1">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="input" required>
              <option value="">Select</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} className="input" rows={2} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting}>{submitting ? t('submitting', 'Submitting...') : t('submit_request', 'Submit Request')}</Button>
          </div>
        </form>
        <div className="font-semibold mb-2">Your Requests</div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Start</th>
                  <th className="border px-2 py-1">End</th>
                  <th className="border px-2 py-1">Type</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Reason</th>
                  {isAdmin && <th className="border px-2 py-1">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((row) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1">{row.start_date}</td>
                    <td className="border px-2 py-1">{row.end_date}</td>
                    <td className="border px-2 py-1">{row.type}</td>
                    <td className="border px-2 py-1">{row.status}</td>
                    <td className="border px-2 py-1">{row.reason}</td>
                    {isAdmin && (
                      <td className="border px-2 py-1 flex gap-2">
                        {row.status === 'pending' && <>
                          <Button size="sm" onClick={() => handleApprove(row.id)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(row.id)}>Reject</Button>
                        </>}
                      </td>
                    )}
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-4">
                      No requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
