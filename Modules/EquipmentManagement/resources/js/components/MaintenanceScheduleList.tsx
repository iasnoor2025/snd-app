import { Card, CardContent, CardHeader, CardTitle } from '@/Core/Components/ui';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Schedule {
    id: number;
    scheduled_at: string;
    completed_at: string | null;
    type: string;
    notes: string;
    status: string;
}

export function MaintenanceScheduleList({ equipmentId }: { equipmentId: number }) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/equipment/${equipmentId}/maintenance`);
            const data = await res.json();
            setSchedules(data.data);
        } catch {
            toast.error('Failed to fetch schedules');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Maintenance Schedules</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Scheduled</th>
                            <th className="border px-2 py-1">Type</th>
                            <th className="border px-2 py-1">Status</th>
                            <th className="border px-2 py-1">Notes</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((s) => (
                            <tr key={s.id}>
                                <td className="border px-2 py-1">{new Date(s.scheduled_at)}</td>
                                <td className="border px-2 py-1">{s.type}</td>
                                <td className="border px-2 py-1">{s.status}</td>
                                <td className="border px-2 py-1">{s.notes}</td>
                                <td className="border px-2 py-1">{/* Edit/Delete actions can be added here */}</td>
                            </tr>
                        ))}
                        {schedules.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-2 text-center">
                                    No schedules found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
