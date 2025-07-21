import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/Core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Input } from '@/Core/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core/components/ui/table';

interface LogEntry {
    id: number;
    user_id: number | null;
    role_id: number | null;
    action: string;
    description: string;
    metadata: any;
    created_at: string;
    user?: { id: number; name: string };
    role?: { id: number; name: string };
}

export default function AuditLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/audit-log');
            const data = await res.json();
            setLogs(data.data);
        } catch (e) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(
        (log) =>
            log.action?.toLowerCase().includes(search.toLowerCase()) ||
            log.description?.toLowerCase().includes(search.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Track all important system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                    <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.user ? <span>{log.user.name}</span> : <Badge variant="secondary">System</Badge>}</TableCell>
                                        <TableCell>{log.role ? log.role.name : <span>-</span>}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>{log.description}</TableCell>
                                        <TableCell>{new Date(log.created_at)}</TableCell>
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
