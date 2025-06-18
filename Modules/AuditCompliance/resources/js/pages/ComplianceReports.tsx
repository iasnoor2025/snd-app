/**
 * Compliance Reports Component
 * Generates and manages compliance reports for audit and regulatory purposes
 */

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

interface ComplianceReport {
  id: number;
  title: string;
  type: 'audit' | 'gdpr' | 'security' | 'data_retention' | 'access_control';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  period_start: string;
  period_end: string;
  generated_by: {
    id: number;
    name: string;
    email: string;
  };
  file_path?: string;
  file_size?: number;
  summary?: {
    total_records: number;
    compliance_score: number;
    issues_found: number;
    recommendations: number;
  };
  created_at: string;
  completed_at?: string;
  notes?: string;
}

interface ComplianceMetrics {
  overall_score: number;
  total_reports: number;
  pending_reports: number;
  failed_reports: number;
  average_generation_time: number;
  compliance_trends: {
    period: string;
    score: number;
  }[];
}

interface ComplianceReportsProps {
  reports: {
    data: ComplianceReport[];
    links: any[];
  };
  metrics: ComplianceMetrics;
  filters: {
    type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  };
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
    generating: { color: 'bg-blue-500', icon: RefreshCw, label: 'Generating' },
    completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'bg-red-500', icon: AlertCircle, label: 'Failed' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-400',
    icon: Clock,
    label: status
  };

  const Icon = config.icon;

  return (
    <Badge className={cn('text-white flex items-center space-x-1', config.color)}>
      <Icon className={cn('h-3 w-3', status === 'generating' && 'animate-spin')} />
      <span>{config.label}</span>
    </Badge>
  );
}

function getTypeBadge(type: string) {
  const typeConfig = {
    audit: { color: 'bg-purple-500', icon: FileText, label: 'Audit Report' },
    gdpr: { color: 'bg-blue-500', icon: FileText, label: 'GDPR Compliance' },
    security: { color: 'bg-red-500', icon: FileText, label: 'Security Report' },
    data_retention: { color: 'bg-orange-500', icon: FileText, label: 'Data Retention' },
    access_control: { color: 'bg-green-500', icon: FileText, label: 'Access Control' },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || {
    color: 'bg-gray-400',
    icon: FileText,
    label: type
  };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function MetricsCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateReportDialog({ onGenerate }: { onGenerate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    period_start: null as Date | null,
    period_end: null as Date | null,
    notes: '',
  });

  const handleSubmit = () => {
    onGenerate({
      ...formData,
      period_start: formData.period_start?.toISOString().split('T')[0],
      period_end: formData.period_end?.toISOString().split('T')[0],
    });
    setOpen(false);
    setFormData({
      title: '',
      type: '',
      period_start: null,
      period_end: null,
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Compliance Report</DialogTitle>
          <DialogDescription>
            Create a new compliance report for the specified period and type.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter report title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audit">Audit Report</SelectItem>
                <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                <SelectItem value="security">Security Report</SelectItem>
                <SelectItem value="data_retention">Data Retention</SelectItem>
                <SelectItem value="access_control">Access Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <DatePicker
                date={formData.period_start === null ? undefined : formData.period_start}
                setDate={(date) => setFormData(prev => ({ ...prev, period_start: date ?? null }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End</Label>
              <DatePicker
                date={formData.period_end === null ? undefined : formData.period_end}
                setDate={(date) => setFormData(prev => ({ ...prev, period_end: date ?? null }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or requirements"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.type || !formData.period_start || !formData.period_end}
          >
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportsTable({ reports }: { reports: ComplianceReport[] }) {
  const handleDownload = (report: ComplianceReport) => {
    if (report.file_path) {
      window.open(route('compliance.reports.download', report.id));
    }
  };

  const handleDelete = (reportId: number) => {
    if (confirm('Are you sure you want to delete this report?')) {
      router.delete(route('compliance.reports.destroy', reportId));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Generated By</TableHead>
          <TableHead>Compliance Score</TableHead>
          <TableHead>File Size</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div>
                <div className="font-medium">{report.title}</div>
                <div className="text-sm text-muted-foreground">
                  Created {formatDateTime(report.created_at)}
                </div>
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(report.type)}</TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{new Date(report.period_start).toLocaleDateString()}</div>
                <div className="text-muted-foreground">
                  to {new Date(report.period_end).toLocaleDateString()}
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(report.status)}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{report.generated_by.name}</div>
                <div className="text-sm text-muted-foreground">{report.generated_by.email}</div>
              </div>
            </TableCell>
            <TableCell>
              {report.summary?.compliance_score !== undefined ? (
                <div className="flex items-center space-x-2">
                  <Progress value={report.summary.compliance_score} className="w-16" />
                  <span className="text-sm font-medium">{report.summary.compliance_score}%</span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {formatFileSize(report.file_size)}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Link href={route('compliance.reports.show', report.id)}>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                {report.status === 'completed' && report.file_path && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(report.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}

        {reports.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6">
              No compliance reports found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function ComplianceReports({
  reports,
  metrics,
  filters
}: ComplianceReportsProps) {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    type: filters.type || '',
    status: filters.status || '',
    from_date: filters.from_date ? new Date(filters.from_date) : undefined,
    to_date: filters.to_date ? new Date(filters.to_date) : undefined,
  });

  const handleFilterChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    router.get(route('compliance.reports'), {
      ...formState,
      from_date: formState.from_date ? formState.from_date.toISOString().split('T')[0] : null,
      to_date: formState.to_date ? formState.to_date.toISOString().split('T')[0] : null,
    }, { preserveState: true });
  };

  const resetFilters = () => {
    setFormState({
      type: '',
      status: '',
      from_date: undefined,
      to_date: undefined,
    });
    router.get(route('compliance.reports'));
  };

  const handleGenerateReport = (data: any) => {
    router.post(route('compliance.reports.store'), data);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center space-x-2">
        <BarChart3 className="h-6 w-6" />
        <span>Compliance Reports</span>
      </h2>
      <GenerateReportDialog onGenerate={handleGenerateReport} />
    </div>
  );

  return (
    <AppLayout>
      <div className="mb-6">{renderHeader()}</div>
      <Head title="Compliance Reports" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Overall Compliance Score"
              value={`${metrics.overall_score}%`}
              icon={TrendingUp}
            />
            <MetricsCard
              title="Total Reports"
              value={metrics.total_reports}
              icon={FileText}
            />
            <MetricsCard
              title="Pending Reports"
              value={metrics.pending_reports}
              subtitle={metrics.failed_reports > 0 ? `${metrics.failed_reports} failed` : undefined}
              icon={Clock}
            />
            <MetricsCard
              title="Avg. Generation Time"
              value={`${metrics.average_generation_time}min`}
              icon={RefreshCw}
            />
          </div>

          {/* Compliance Trends */}
          {metrics.compliance_trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Compliance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.compliance_trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.period}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={trend.score} className="w-32" />
                        <span className="text-sm font-medium w-12">{trend.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Type</label>
                  <Select
                    value={formState.type}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="audit">Audit Report</SelectItem>
                      <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                      <SelectItem value="security">Security Report</SelectItem>
                      <SelectItem value="data_retention">Data Retention</SelectItem>
                      <SelectItem value="access_control">Access Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={formState.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">From Date</label>
                  <DatePicker
                    date={formState.from_date}
                    setDate={(date) => handleFilterChange('from_date', date)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To Date</label>
                  <DatePicker
                    date={formState.to_date}
                    setDate={(date) => handleFilterChange('to_date', date)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportsTable reports={reports.data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
