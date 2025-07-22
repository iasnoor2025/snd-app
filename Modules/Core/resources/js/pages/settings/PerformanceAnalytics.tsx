import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core/Components/ui';



interface Metric {
    metric_name: string;
    metric_value: number;
    timestamp: string;
    category: string;
}

export default function PerformanceAnalytics() {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/performance-analytics');
            const data = await res.json();
            setMetrics(data.data);
        } catch (e) {
            toast.error('Failed to fetch performance metrics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Monitor system performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <span className="font-semibold">Recent Metrics</span>
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center">
                                        No performance metrics found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                metrics.map((metric, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{metric.metric_name}</TableCell>
                                        <TableCell>{metric.metric_value}</TableCell>
                                        <TableCell>{metric.category}</TableCell>
                                        <TableCell>{new Date(metric.timestamp)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
