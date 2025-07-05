import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Core";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Core";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Core";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Users,
    MapPin,
    Clock,
    Target,
    Activity,
    Download,
    Filter,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface GeofenceStats {
    total_zones: number;
    active_zones: number;
    total_violations: number;
    compliance_rate: number;
    zones_by_type: Record<string, number>;
    violations_by_severity: Record<string, number>;
    daily_compliance: Array<{
        date: string;
        compliance_rate: number;
        total_entries: number;
        violations: number;
    }>;
    top_violating_employees: Array<{
        employee_id: number;
        employee_name: string;
        violation_count: number;
        compliance_rate: number;
    }>;
    zone_performance: Array<{
        zone_id: number;
        zone_name: string;
        total_entries: number;
        violations: number;
        compliance_rate: number;
    }>;
}

interface ViolationRecord {
    id: number;
    employee_name: string;
    project_name: string;
    zone_name: string;
    violation_type: string;
    severity: 'low' | 'medium' | 'high';
    distance_from_zone: number;
    timestamp: string;
    resolved: boolean;
    resolution_notes?: string;
}

interface WorkAreaCoverage {
    project_id: number;
    project_name: string;
    total_area_km2: number;
    covered_area_km2: number;
    coverage_percentage: number;
    zones_count: number;
    gaps: Array<{
        area_km2: number;
        description: string;
        priority: 'low' | 'medium' | 'high';
    }>;
}

const GeofenceStatsDashboard: React.FC = () => {
    const [stats, setStats] = useState<GeofenceStats | null>(null);
    const [violations, setViolations] = useState<ViolationRecord[]>([]);
    const [coverage, setCoverage] = useState<WorkAreaCoverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, [dateRange, selectedProject]);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchViolations(),
                fetchCoverage()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const params = new URLSearchParams({
            period: dateRange,
            ...(selectedProject !== 'all' && { project_id: selectedProject })
        });

        const response = await axios.get(`/api/geofences/statistics?${params}`);
        setStats(response.data.data);
    };

    const fetchViolations = async () => {
        const params = new URLSearchParams({
            period: dateRange,
            ...(selectedProject !== 'all' && { project_id: selectedProject }),
            limit: '50'
        });

        const response = await axios.get(`/api/geofences/violations?${params}`);
        setViolations(response.data.data.data || []);
    };

    const fetchCoverage = async () => {
        const response = await axios.get('/api/geofences/work-area-coverage');
        setCoverage(response.data.data || []);
    };

    const exportData = async (type: 'stats' | 'violations' | 'coverage') => {
        try {
            const params = new URLSearchParams({
                period: dateRange,
                ...(selectedProject !== 'all' && { project_id: selectedProject }),
                format: 'csv'
            });

            const endpoint = {
                stats: '/api/geofences/statistics/export',
                violations: '/api/geofences/violations/export',
                coverage: '/api/geofences/work-area-coverage/export'
            }[type];

            const response = await axios.get(`${endpoint}?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `geofence_${type}_${dateRange}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success(`${type} data exported successfully`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        }
    };

    const getSeverityColor = (severity: string) => {
  const { t } = useTranslation('timesheet');

        const colors = {
            low: 'bg-yellow-100 text-yellow-800',
            medium: 'bg-orange-100 text-orange-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatDistance = (meters: number) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)}km`;
        }
        return `${meters}m`;
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('geofence_analytics')}</h1>
                    <p className="text-muted-foreground">
                        Monitor compliance, violations, and coverage statistics
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1d">{t('opt_last_day')}</SelectItem>
                            <SelectItem value="7d">{t('opt_last_week')}</SelectItem>
                            <SelectItem value="30d">{t('opt_last_month')}</SelectItem>
                            <SelectItem value="90d">{t('opt_last_quarter')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder={t('opt_all_projects')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('opt_all_projects')}</SelectItem>
                            {/* Add project options here */}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_zones')}</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_zones}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_zones} active zones
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_compliance_rate')}</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatPercentage(stats.compliance_rate)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.compliance_rate >= 95 ? 'Excellent' :
                                 stats.compliance_rate >= 85 ? 'Good' :
                                 stats.compliance_rate >= 70 ? 'Fair' : 'Needs Improvement'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('ttl_total_violations')}</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.total_violations}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.violations_by_severity.high || 0} high severity
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {coverage.length > 0 ?
                                    formatPercentage(coverage.reduce((acc, c) => acc + c.coverage_percentage, 0) / coverage.length) :
                                    '0%'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average work area coverage
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="violations">Violations</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="coverage">Coverage</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Zone Types Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_zones_by_type')}</CardTitle>
                                <CardDescription>{t('distribution_of_geofence_zone_types')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.zones_by_type && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(stats.zones_by_type).map(([type, count]) => ({
                                                    name: type.replace('_', ' '),
                                                    value: count
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {Object.entries(stats.zones_by_type).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Violations by Severity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_violations_by_severity')}</CardTitle>
                                <CardDescription>{t('breakdown_of_violation_severity_levels')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.violations_by_severity && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(stats.violations_by_severity).map(([severity, count]) => ({
                                            severity: severity.charAt(0).toUpperCase() + severity.slice(1),
                                            count
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="severity" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#EF4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Compliance Trend */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>{t('ttl_compliance_trend')}</CardTitle>
                                    <CardDescription>{t('daily_compliance_rate_over_time')}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => exportData('stats')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {stats?.daily_compliance && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={stats.daily_compliance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'compliance_rate' ? `${value}%` : value,
                                                name === 'compliance_rate' ? 'Compliance Rate' :
                                                name === 'total_entries' ? 'Total Entries' : 'Violations'
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="compliance_rate"
                                            stroke="#10B981"
                                            fill="#10B981"
                                            fillOpacity={0.3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="violations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>{t('ttl_recent_violations')}</CardTitle>
                                    <CardDescription>{t('latest_geofence_violations_and_their_details')}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => exportData('violations')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Zone</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Distance</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {violations.map((violation) => (
                                        <TableRow key={violation.id}>
                                            <TableCell className="font-medium">
                                                {violation.employee_name}
                                            </TableCell>
                                            <TableCell>{violation.project_name}</TableCell>
                                            <TableCell>{violation.zone_name}</TableCell>
                                            <TableCell>{violation.violation_type}</TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(violation.severity)}>
                                                    {violation.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDistance(violation.distance_from_zone)}</TableCell>
                                            <TableCell>
                                                {new Date(violation.timestamp)}
                                            </TableCell>
                                            <TableCell>
                                                {violation.resolved ? (
                                                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                                                        Resolved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        Open
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Top Violating Employees */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_top_violating_employees')}</CardTitle>
                                <CardDescription>{t('employees_with_most_violations')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.top_violating_employees?.map((employee, index) => (
                                        <div key={employee.employee_id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{employee.employee_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {employee.violation_count} violations
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-medium ${
                                                    employee.compliance_rate >= 90 ? 'text-green-600' :
                                                    employee.compliance_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {formatPercentage(employee.compliance_rate)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">compliance</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Zone Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_zone_performance')}</CardTitle>
                                <CardDescription>{t('compliance_rates_by_zone')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.zone_performance?.map((zone) => (
                                        <div key={zone.zone_id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="font-medium">{zone.zone_name}</div>
                                                <div className={`font-medium ${
                                                    zone.compliance_rate >= 90 ? 'text-green-600' :
                                                    zone.compliance_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {formatPercentage(zone.compliance_rate)}
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        zone.compliance_rate >= 90 ? 'bg-green-500' :
                                                        zone.compliance_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${zone.compliance_rate}%` }}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {zone.total_entries} entries, {zone.violations} violations
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="coverage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>{t('ttl_work_area_coverage')}</CardTitle>
                                    <CardDescription>{t('geofence_coverage_analysis_by_project')}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => exportData('coverage')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {coverage.map((project) => (
                                    <div key={project.project_id} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{project.project_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.zones_count} zones covering {project.covered_area_km2.toFixed(2)} km²
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${
                                                    project.coverage_percentage >= 90 ? 'text-green-600' :
                                                    project.coverage_percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {formatPercentage(project.coverage_percentage)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">coverage</div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full ${
                                                    project.coverage_percentage >= 90 ? 'bg-green-500' :
                                                    project.coverage_percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${project.coverage_percentage}%` }}
                                            />
                                        </div>

                                        {project.gaps.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm">Coverage Gaps:</h4>
                                                {project.gaps.map((gap, index) => (
                                                    <div key={index} className="flex justify-between items-center text-sm">
                                                        <span>{gap.description}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span>{gap.area_km2.toFixed(2)} km²</span>
                                                            <Badge className={getSeverityColor(gap.priority)}>
                                                                {gap.priority}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default GeofenceStatsDashboard;














