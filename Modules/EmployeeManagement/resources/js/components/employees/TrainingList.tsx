import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { toast } from 'sonner';

interface Training {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  certificate_url: string;
}

export function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trainings');
      const data = await res.json();
      setTrainings(data.data);
    } catch {
      toast.error('Failed to fetch trainings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainings</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Start</th>
              <th className="border px-2 py-1">End</th>
              <th className="border px-2 py-1">Location</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((training) => (
              <tr key={training.id}>
                <td className="border px-2 py-1">{training.title}</td>
                <td className="border px-2 py-1">{training.start_date}</td>
                <td className="border px-2 py-1">{training.end_date}</td>
                <td className="border px-2 py-1">{training.location}</td>
                <td className="border px-2 py-1">
                  {/* Assignment and completion actions can be added here */}
                </td>
              </tr>
            ))}
            {trainings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-2">No trainings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
