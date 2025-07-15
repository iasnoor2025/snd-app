import { Badge } from '@/../../Modules/Core/resources/js/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface TimeEntry {
    id: number;
    employee: { id: number; name: string };
    project: { id: number; name: string };
    date: string;
    hours: number;
    is_overtime: boolean;
    start_time: string;
    end_time: string;
    created_at: string;
}

export default function RealTimeDashboard() {
    const [stats, setStats] = useState({
        totalHours: 0,
        activeEmployees: 0,
        overtimeHours: 0,
        lastUpdated: '',
    });
    const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation('TimesheetManagement');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/timesheets/realtime-dashboard');
            const data = await res.json();
            setStats(data.stats);
            setRecentEntries(data.recentEntries);
            setLoading(false);
        } catch (e) {
            toast.error(t('realtime_dashboard_failed', 'Failed to load real-time dashboard'));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading real-time dashboard...</div>;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Real-Time Timesheet Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <div className="text-2xl font-bold">{stats.totalHours}</div>
                            <div className="text-muted-foreground">Total Hours Today</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
                            <div className="text-muted-foreground">Active Employees</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.overtimeHours}</div>
                            <div className="text-muted-foreground">Overtime Hours</div>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Last updated: {stats.lastUpdated}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="divide-y">
                        {recentEntries.map((entry) => (
                            <li key={entry.id} className="flex items-center gap-4 py-2">
                                <span className="font-medium">{entry.employee.name}</span>
                                <span className="text-muted-foreground">{entry.project.name}</span>
                                <span>{entry.hours}h</span>
                                {entry.is_overtime && <Badge variant="warning">{t('overtime', 'Overtime')}</Badge>}
                                <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleTimeString()}</span>
                            </li>
                        ))}
                        {recentEntries.length === 0 && <li className="py-4 text-center text-muted-foreground">No recent entries</li>}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
