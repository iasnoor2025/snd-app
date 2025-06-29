import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';

interface Analytics {
  total_usage_minutes: number;
  usage_count: number;
  average_duration_minutes: number;
}

export function EquipmentUsageAnalytics({ equipmentId }: { equipmentId: number }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/usage/analytics`);
      const data = await res.json();
      setAnalytics(data.data);
    } catch {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Total Usage (minutes): {analytics.total_usage_minutes}</div>
        <div>Usage Count: {analytics.usage_count}</div>
        <div>Average Duration (minutes): {analytics.average_duration_minutes.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
