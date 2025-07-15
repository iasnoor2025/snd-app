import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Reservation {
    id: number;
    equipment: { id: number; name: string };
    user: { id: number; name: string };
    reserved_from: string;
    reserved_to: string;
    status: string;
    notes: string;
}

export function ReservationList({ equipmentId }: { equipmentId: number }) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/equipment/${equipmentId}/reservations`);
            const data = await res.json();
            setReservations(data.data);
        } catch {
            toast.error('Failed to fetch reservations');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reservations</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">User</th>
                            <th className="border px-2 py-1">From</th>
                            <th className="border px-2 py-1">To</th>
                            <th className="border px-2 py-1">Status</th>
                            <th className="border px-2 py-1">Notes</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((r) => (
                            <tr key={r.id}>
                                <td className="border px-2 py-1">{r.user?.name}</td>
                                <td className="border px-2 py-1">{new Date(r.reserved_from)}</td>
                                <td className="border px-2 py-1">{new Date(r.reserved_to)}</td>
                                <td className="border px-2 py-1">{r.status}</td>
                                <td className="border px-2 py-1">{r.notes}</td>
                                <td className="border px-2 py-1">{/* Edit/Delete actions can be added here */}</td>
                            </tr>
                        ))}
                        {reservations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-2 text-center">
                                    No reservations found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
