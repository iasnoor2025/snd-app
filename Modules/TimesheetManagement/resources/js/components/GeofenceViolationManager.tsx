import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Badge } from "@/Core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Core";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Core";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Core";
import { Textarea } from "@/Core";
import { Label } from "@/Core";
import {
    AlertTriangle,
    MapPin,
    Clock,
    User,
    Building,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Filter,
    Search,
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    Target,
    Navigation,
    Phone,
    Mail,
    FileText,
    Archive,
    Flag,
    Shield,
    Activity,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface GeofenceViolation {
    id: number;
    timesheet_id: number;
    employee_id: number;
    employee_name: string;
    employee_email: string;
    employee_phone?: string;
    project_id: number;
    project_name: string;
    violation_type: 'outside_zone' | 'unauthorized_zone' | 'time_restriction' | 'accuracy_low' | 'suspicious_location';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed' | 'escalated';
    detected_at: string;
    resolved_at?: string;
    location: {
        latitude: number;
        longitude: number;
        accuracy: number;
        address?: string;
    };
    expected_zone?: {
        id: number;
        name: string;
        center_latitude: number;
        center_longitude: number;
        radius_meters: number;
    };
    distance_from_zone?: number;
    violation_duration?: number;
    metadata?: {
        device_id?: string;
        app_version?: string;
        network_type?: string;
        battery_level?: number;
        movement_pattern?: string;
        previous_violations?: number;
    };
    notes?: Array<{
        id: number;
        user_id: number;
        user_name: string;
        note: string;
        created_at: string;
        type: 'system' | 'admin' | 'employee' | 'manager';
    }>;
    actions_taken?: Array<{
        id: number;
        action_type: 'notification_sent' | 'manager_notified' | 'hr_escalated' | 'policy_reminder' | 'training_assigned';
        performed_by: string;
        performed_at: string;
        details?: string;
    }>;
}

interface ViolationFilters {
    search: string;
    severity: string;
    status: string;
    violation_type: string;
    employee_id: string;
    project_id: string;
    date_from: string;
    date_to: string;
}

interface ViolationStats {
    total_violations: number;
    pending_violations: number;
    resolved_violations: number;
    critical_violations: number;
    top_violators: Array<{
        employee_id: number;
        employee_name: string;
        violation_count: number;
        last_violation: string;
    }>;
    violation_trends: Array<{
        date: string;
        count: number;
        severity_breakdown: {
            low: number;
            medium: number;
            high: number;
            critical: number;
        };
    }>;
    zone_violations: Array<{
        zone_id: number;
        zone_name: string;
        violation_count: number;
        avg_distance: number;
    }>;
}

const GeofenceViolationManager: React.FC = () => {
    const [violations, setViolations] = useState<GeofenceViolation[]>([]);
    const [stats, setStats] = useState<ViolationStats | null>(null);
    const [selectedViolation, setSelectedViolation] = useState<GeofenceViolation | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [newNote, setNewNote] = useState('');
    const [filters, setFilters] = useState<ViolationFilters>({
        search: '',
        severity: '',
        status: '',
        violation_type: '',
        employee_id: '',
        project_id: '',
        date_from: '',
        date_to: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0
    });
    const { t } = useTranslation('TimesheetManagement');

    useEffect(() => {
        fetchViolations();
        fetchStats();
    }, [filters, pagination.page]);

    const fetchViolations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                per_page: pagination.per_page.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
            });

            const response = await axios.get(`/api/geofences/violations?${params}`);
            setViolations(response.data.data.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.data.total || 0,
                total_pages: response.data.data.last_page || 0
            }));
        } catch (error) {
            console.error('Failed to fetch violations:', error);
            toast.error(t('load_violations_failed', 'Failed to load violations'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams({
                date_from: filters.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                date_to: filters.date_to || new Date().toISOString().split('T')[0]
            });

            const response = await axios.get(`/api/geofences/violation-stats?${params}`);
            setStats(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFilterChange = (key: keyof ViolationFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const updateViolationStatus = async (violationId: number, status: string, note?: string) => {
        try {
            setActionLoading(violationId);
            await axios.patch(`/api/geofences/violations/${violationId}/status`, {
                status,
                note
            });

            setViolations(prev => prev.map(v =>
                v.id === violationId
                    ? { ...v, status: status as any, resolved_at: status === 'resolved' ? new Date().toISOString() : undefined }
                    : v
            ));

            toast.success('Violation status updated');

            if (selectedViolation?.id === violationId) {
                setSelectedViolation(prev => prev ? { ...prev, status: status as any } : null);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error(t('update_violation_failed', 'Failed to update violation status'));
        } finally {
            setActionLoading(null);
        }
    };

    const addNote = async (violationId: number, note: string) => {
        try {
            await axios.post(`/api/geofences/violations/${violationId}/notes`, {
                note,
                type: 'admin'
            });

            const newNoteObj = {
                id: Date.now(),
                user_id: 1, // Current user ID
                user_name: 'Admin', // Current user name
                note,
                created_at: new Date().toISOString(),
                type: 'admin' as const
            };

            setViolations(prev => prev.map(v =>
                v.id === violationId
                    ? { ...v, notes: [...(v.notes || []), newNoteObj] }
                    : v
            ));

            if (selectedViolation?.id === violationId) {
                setSelectedViolation(prev => prev ? {
                    ...prev,
                    notes: [...(prev.notes || []), newNoteObj]
                } : null);
            }

            setNewNote('');
            toast.success('Note added successfully');
        } catch (error) {
            console.error('Failed to add note:', error);
            toast.error(t('add_note_failed', 'Failed to add note'));
        }
    };

    const sendNotification = async (violationId: number, type: 'employee' | 'manager' | 'hr') => {
        try {
            setActionLoading(violationId);
            await axios.post(`/api/geofences/violations/${violationId}/notify`, {
                notification_type: type
            });

            toast.success(`Notification sent to ${type}`);
        } catch (error) {
            console.error('Failed to send notification:', error);
            toast.error(t('send_notification_failed', 'Failed to send notification'));
        } finally {
            setActionLoading(null);
        }
    };

    const exportViolations = async () => {
        try {
            const params = new URLSearchParams({
                ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value)),
                format: 'csv'
            });

            const response = await axios.get(`/api/geofences/violations/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `violations_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Violations exported successfully');
        } catch (error) {
            console.error('Failed to export violations:', error);
            toast.error(t('export_violations_failed', 'Failed to export violations'));
        }
    };

    const getSeverityColor = (severity: string) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            acknowledged: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            dismissed: 'bg-gray-100 text-gray-800',
            escalated: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getViolationTypeIcon = (type: string) => {
        const icons = {
            outside_zone: MapPin,
            unauthorized_zone: Shield,
            time_restriction: Clock,
            accuracy_low: Target,
            suspicious_location: Flag
        };
        const Icon = icons[type as keyof typeof icons] || AlertTriangle;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('geofence_violations')}</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage geofence violations across all projects
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={exportViolations}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        <Activity className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_violations')}</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_violations}</div>
                            <p className="text-xs text-muted-foreground">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_violations}</div>
                            <p className="text-xs text-muted-foreground">
                                Require attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.critical_violations}</div>
                            <p className="text-xs text-muted-foreground">
                                High priority
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_resolution_rate')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {Math.round((stats.resolved_violations / stats.total_violations) * 100)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.resolved_violations} resolved
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('ph_employee_project')}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('opt_all_severities')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('opt_all_severities')}</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('opt_all_statuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('opt_all_statuses')}</SelectItem>
                                    <SelectItem value="pending">{t('pending', 'Pending')}</SelectItem>
                                    <SelectItem value="acknowledged">{t('acknowledged', 'Acknowledged')}</SelectItem>
                                    <SelectItem value="resolved">{t('resolved', 'Resolved')}</SelectItem>
                                    <SelectItem value="dismissed">{t('dismissed', 'Dismissed')}</SelectItem>
                                    <SelectItem value="escalated">{t('escalated', 'Escalated')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('lbl_violation_type')}</Label>
                            <Select value={filters.violation_type} onValueChange={(value) => handleFilterChange('violation_type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('opt_all_types')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t('opt_all_types')}</SelectItem>
                                    <SelectItem value="outside_zone">{t('opt_outside_zone')}</SelectItem>
                                    <SelectItem value="unauthorized_zone">{t('opt_unauthorized_zone')}</SelectItem>
                                    <SelectItem value="time_restriction">{t('opt_time_restriction')}</SelectItem>
                                    <SelectItem value="accuracy_low">{t('opt_low_accuracy')}</SelectItem>
                                    <SelectItem value="suspicious_location">{t('opt_suspicious_location')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="space-y-2">
                            <Label>{t('lbl_date_from')}</Label>
                            <Input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('lbl_date_to')}</Label>
                            <Input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Violations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Violations ({pagination.total})</CardTitle>
                    <CardDescription>
                        Showing {violations.length} of {pagination.total} violations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Detected</TableHead>
                                        <TableHead>Distance</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {violations.map((violation) => (
                                        <TableRow key={violation.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{violation.employee_name}</div>
                                                        <div className="text-sm text-muted-foreground">{violation.employee_email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <span>{violation.project_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getViolationTypeIcon(violation.violation_type)}
                                                    <span className="capitalize">{violation.violation_type.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(violation.severity)}>
                                                    {violation.severity.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(violation.status)}>
                                                    {violation.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {new Date(violation.detected_at).toLocaleDateString()}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(violation.detected_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {violation.distance_from_zone && (
                                                    <span className="text-sm">
                                                        {Math.round(violation.distance_from_zone)}m
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedViolation(violation);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => updateViolationStatus(violation.id, 'acknowledged')}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Acknowledge
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateViolationStatus(violation.id, 'resolved')}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Resolve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateViolationStatus(violation.id, 'dismissed')}>
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Dismiss
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => sendNotification(violation.id, 'employee')}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Notify Employee
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => sendNotification(violation.id, 'manager')}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Notify Manager
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} results
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page >= pagination.total_pages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Violation Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            {selectedViolation && getViolationTypeIcon(selectedViolation.violation_type)}
                            <span>{t('violation_details')}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information about the geofence violation
                        </DialogDescription>
                    </DialogHeader>

                    {selectedViolation && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Employee</Label>
                                        <div className="mt-1">
                                            <div className="font-medium">{selectedViolation.employee_name}</div>
                                            <div className="text-sm text-muted-foreground">{selectedViolation.employee_email}</div>
                                            {selectedViolation.employee_phone && (
                                                <div className="text-sm text-muted-foreground">{selectedViolation.employee_phone}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Project</Label>
                                        <div className="mt-1 font-medium">{selectedViolation.project_name}</div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">{t('lbl_violation_type')}</Label>
                                        <div className="mt-1 flex items-center space-x-2">
                                            {getViolationTypeIcon(selectedViolation.violation_type)}
                                            <span className="capitalize">{selectedViolation.violation_type.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">Severity</Label>
                                        <div className="mt-1">
                                            <Badge className={getSeverityColor(selectedViolation.severity)}>
                                                {selectedViolation.severity.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div className="mt-1">
                                            <Badge className={getStatusColor(selectedViolation.status)}>
                                                {selectedViolation.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">{t('lbl_detected_at')}</Label>
                                        <div className="mt-1">
                                            <div>{new Date(selectedViolation.detected_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium">{t('lbl_location_information')}</Label>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-4 border rounded-lg">
                                        <div className="font-medium mb-2">{t('actual_location')}</div>
                                        <div className="space-y-1 text-sm">
                                            <div className="font-mono">
                                                {selectedViolation.location.latitude.toFixed(6)}, {selectedViolation.location.longitude.toFixed(6)}
                                            </div>
                                            {selectedViolation.location.address && (
                                                <div className="text-muted-foreground">{selectedViolation.location.address}</div>
                                            )}
                                            <div className="text-muted-foreground">
                                                Accuracy: ±{Math.round(selectedViolation.location.accuracy)}m
                                            </div>
                                        </div>
                                    </div>

                                    {selectedViolation.expected_zone && (
                                        <div className="p-4 border rounded-lg">
                                            <div className="font-medium mb-2">{t('expected_zone')}</div>
                                            <div className="space-y-1 text-sm">
                                                <div className="font-medium">{selectedViolation.expected_zone.name}</div>
                                                <div className="font-mono">
                                                    {selectedViolation.expected_zone.center_latitude.toFixed(6)}, {selectedViolation.expected_zone.center_longitude.toFixed(6)}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    Radius: {selectedViolation.expected_zone.radius_meters}m
                                                </div>
                                                {selectedViolation.distance_from_zone && (
                                                    <div className="text-red-600 font-medium">
                                                        Distance: {Math.round(selectedViolation.distance_from_zone)}m outside
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Device Info */}
                            {selectedViolation.metadata && (
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">{t('lbl_device_information')}</Label>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {selectedViolation.metadata.device_id && (
                                            <div>
                                                <div className="text-sm font-medium">{t('device_id')}</div>
                                                <div className="text-sm text-muted-foreground font-mono">
                                                    {selectedViolation.metadata.device_id}
                                                </div>
                                            </div>
                                        )}
                                        {selectedViolation.metadata.app_version && (
                                            <div>
                                                <div className="text-sm font-medium">{t('app_version')}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedViolation.metadata.app_version}
                                                </div>
                                            </div>
                                        )}
                                        {selectedViolation.metadata.battery_level && (
                                            <div>
                                                <div className="text-sm font-medium">{t('battery_level')}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedViolation.metadata.battery_level}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions Taken */}
                            {selectedViolation.actions_taken && selectedViolation.actions_taken.length > 0 && (
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">{t('lbl_actions_taken')}</Label>
                                    <div className="space-y-2">
                                        {selectedViolation.actions_taken.map((action) => (
                                            <div key={action.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium capitalize">
                                                            {action.action_type.replace('_', ' ')}
                                                        </div>
                                                        {action.details && (
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {action.details}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right text-sm text-muted-foreground">
                                                        <div>{action.performed_by}</div>
                                                        <div>{new Date(action.performed_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Notes</Label>

                                {/* Existing Notes */}
                                {selectedViolation.notes && selectedViolation.notes.length > 0 && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedViolation.notes.map((note) => (
                                            <div key={note.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium">{note.user_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(note.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="text-sm">{note.note}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Note */}
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder={t('ph_add_a_note_about_this_violation')}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        rows={3}
                                    />
                                    <Button
                                        onClick={() => addNote(selectedViolation.id, newNote)}
                                        disabled={!newNote.trim()}
                                        size="sm"
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Add Note
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Button
                                    onClick={() => updateViolationStatus(selectedViolation.id, 'acknowledged')}
                                    disabled={actionLoading === selectedViolation.id}
                                    variant="outline"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Acknowledge
                                </Button>
                                <Button
                                    onClick={() => updateViolationStatus(selectedViolation.id, 'resolved')}
                                    disabled={actionLoading === selectedViolation.id}
                                    variant="outline"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Resolve
                                </Button>
                                <Button
                                    onClick={() => updateViolationStatus(selectedViolation.id, 'dismissed')}
                                    disabled={actionLoading === selectedViolation.id}
                                    variant="outline"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Dismiss
                                </Button>
                                <Button
                                    onClick={() => sendNotification(selectedViolation.id, 'employee')}
                                    disabled={actionLoading === selectedViolation.id}
                                    variant="outline"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Notify Employee
                                </Button>
                                <Button
                                    onClick={() => sendNotification(selectedViolation.id, 'manager')}
                                    disabled={actionLoading === selectedViolation.id}
                                    variant="outline"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Notify Manager
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GeofenceViolationManager;














