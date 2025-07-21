import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert } from '@/Core/components/ui/alert';
import { Badge } from '@/Core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';

interface HealthCheck {
    status: 'healthy' | 'warning' | 'unhealthy';
    message: string;
}

interface HealthStatus {
    overall_status: 'healthy' | 'warning' | 'unhealthy';
    checks: Record<string, HealthCheck>;
    last_checked: string;
}

const statusColor = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
};

export default function SystemHealth() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/system-settings/health');
            const data = await res.json();
            setHealth(data);
        } catch (e) {
            toast.error('Failed to fetch system health');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !health) return <div>Loading system health...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor the health of core system components</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                    <span className={`inline-block h-3 w-3 rounded-full ${statusColor[health.overall_status]}`}></span>
                    <span className="font-semibold">Overall Status:</span>
                    <Badge
                        variant={health.overall_status === 'healthy' ? 'success' : health.overall_status === 'warning' ? 'warning' : 'destructive'}
                    >
                        {health.overall_status.charAt(0).toUpperCase() + health.overall_status.slice(1)}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">Last checked: {new Date(health.last_checked)}</span>
                </div>
                <div className="space-y-4">
                    {Object.entries(health.checks).map(([key, check]) => (
                        <Alert key={key} variant={check.status === 'healthy' ? 'success' : check.status === 'warning' ? 'warning' : 'destructive'}>
                            <AlertTitle className="flex items-center gap-2">
                                <span className={`inline-block h-2 w-2 rounded-full ${statusColor[check.status]}`}></span>
                                {key.replace(/_/g, ' ').toUpperCase()}
                            </AlertTitle>
                            <AlertDescription>{check.message}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
