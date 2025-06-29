import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';

interface Forecast {
  avg_daily_usage_minutes: number;
  incoming_orders: number;
  forecast_quantity: number;
}

export function InventoryForecastDashboard({ equipmentId }: { equipmentId: number }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/forecast`);
      const data = await res.json();
      setForecast(data.data);
    } catch {
      toast.error('Failed to fetch forecast');
    } finally {
      setIsLoading(false);
    }
  };

  if (!forecast) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Average Daily Usage (minutes): {forecast.avg_daily_usage_minutes.toFixed(2)}</div>
        <div>Incoming Orders: {forecast.incoming_orders}</div>
        <div>Forecast Quantity (30 days): {forecast.forecast_quantity.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
