import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';

interface Booking {
  id: number;
  start_date: string;
  end_date: string;
  customer_name: string;
}

export function RentalCalendar({ equipmentId }: { equipmentId: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conflict, setConflict] = useState<boolean | null>(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/calendar`);
      const data = await res.json();
      setBookings(data.data);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkConflict = async () => {
    if (!newStart || !newEnd) return;
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/calendar/conflict?start=${newStart}&end=${newEnd}`);
      const data = await res.json();
      setConflict(data.conflict);
      if (data.conflict) {
        toast.error('Booking conflict detected!');
      } else {
        toast.success('No conflict, booking possible.');
      }
    } catch {
      toast.error('Failed to check conflict');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {bookings.map((b) => (
            <li key={b.id}>
              {b.customer_name}: {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
            </li>
          ))}
          {bookings.length === 0 && <li>No bookings found</li>}
        </ul>
        <div className="mt-4">
          <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} />
          <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
          <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={checkConflict} disabled={!newStart || !newEnd}>Check Conflict</button>
          {conflict !== null && (
            <div className="mt-2">
              {conflict ? <span className="text-red-500">Conflict detected</span> : <span className="text-green-600">No conflict</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
