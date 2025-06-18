/**
 * GDPR Compliance Dashboard
 * Manages GDPR data requests, consent records, and compliance monitoring
 */

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  Filter,
  Plus
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
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

interface GdprDataRequest {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  type: 'export' | 'delete' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  expires_at: string;
  notes?: string;
  file_path?: string;
}

interface ConsentRecord {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  consent_type: string;
  given: boolean;
  given_at?: string;
  withdrawn_at?: string;
  ip_address?: string;
  user_agent?: string;
}

interface ComplianceStats {
  total_requests: number;
  pending_requests: number;
  overdue_requests: number;
  completed_requests: number;
  consent_rate: number;
  data_retention_compliance: number;
}

interface GdprDashboardProps {
  dataRequests: {
    data: GdprDataRequest[];
    links: any[];
  };
  consentRecords: {
    data: ConsentRecord[];
    links: any[];
  };
  stats: ComplianceStats;
  filters: {
    status?: string;
    type?: string;
    from_date?: string;
    to_date?: string;
  };
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-500', icon: Clock, label: 'Processing' },
    completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
    rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-400',
    icon: Clock,
    label: status
  };

  const Icon = config.icon;

  return (
    <Badge className={cn('text-white flex items-center space-x-1', config.color)}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

function getTypeBadge(type: string) {
  const typeConfig = {
    export: { color: 'bg-blue-500', icon: Download, label: 'Data Export' },
    delete: { color: 'bg-red-500', icon: Trash2, label: 'Data Deletion' },
    rectification: { color: 'bg-orange-500', icon: FileText, label: 'Data Rectification' },
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

function StatsCard({ title, value, subtitle, icon: Icon, trend }: {
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

function DataRequestsTable({ requests }: { requests: GdprDataRequest[] }) {
  const { t } = useTranslation();

  const handleProcessRequest = (requestId: number, action: 'approve' | 'reject') => {
    router.post(route('gdpr.requests.process', requestId), {
      action,
    });
  };

  const handleDownload = (request: GdprDataRequest) => {
    if (request.file_path) {
      window.open(route('gdpr.requests.download', request.id));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => {
          const isOverdue = new Date(request.expires_at) < new Date() && request.status === 'pending';

          return (
            <TableRow key={request.id} className={isOverdue ? 'bg-red-50' : ''}>
              <TableCell className="font-mono">#{request.id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{request.user.name}</div>
                  <div className="text-sm text-muted-foreground">{request.user.email}</div>
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(request.type)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(request.status)}
                  {isOverdue && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(request.requested_at)}</TableCell>
              <TableCell>
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {formatDate(request.expires_at)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleProcessRequest(request.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProcessRequest(request.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {request.status === 'completed' && request.file_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(request)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}

                  <Link href={route('gdpr.requests.show', request.id)}>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}

        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              No GDPR requests found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function ConsentRecordsTable({ records }: { records: ConsentRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Consent Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Given At</TableHead>
          <TableHead>Withdrawn At</TableHead>
          <TableHead>IP Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <div>
                <div className="font-medium">{record.user.name}</div>
                <div className="text-sm text-muted-foreground">{record.user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{record.consent_type}</Badge>
            </TableCell>
            <TableCell>
              {record.given ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Given
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white">
                  <XCircle className="h-3 w-3 mr-1" />
                  Withdrawn
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {record.given_at ? formatDate(record.given_at) : '-'}
            </TableCell>
            <TableCell>
              {record.withdrawn_at ? formatDate(record.withdrawn_at) : '-'}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {record.ip_address || '-'}
            </TableCell>
          </TableRow>
        ))}

        {records.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6">
              No consent records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function GdprDashboard({
  dataRequests,
  consentRecords,
  stats,
  filters
}: GdprDashboardProps) {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    status: filters.status || '',
    type: filters.type || '',
    from_date: filters.from_date ? new Date(filters.from_date) : undefined,
    to_date: filters.to_date ? new Date(filters.to_date) : undefined,
  });

  const handleFilterChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    router.get(route('gdpr.dashboard'), {
      ...formState,
      from_date: formState.from_date ? formState.from_date.toISOString().split('T')[0] : null,
      to_date: formState.to_date ? formState.to_date.toISOString().split('T')[0] : null,
    }, { preserveState: true });
  };

  const resetFilters = () => {
    setFormState({
      status: '',
      type: '',
      from_date: undefined,
      to_date: undefined,
    });
    router.get(route('gdpr.dashboard'));
  };

  return (
    <AppLayout>
      <Head title="GDPR Compliance Dashboard" />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <span>GDPR Compliance Dashboard</span>
        </h2>
        <Link href={route('gdpr.requests.create')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Requests"
              value={stats.total_requests}
              icon={FileText}
            />
            <StatsCard
              title="Pending Requests"
              value={stats.pending_requests}
              subtitle={stats.overdue_requests > 0 ? `${stats.overdue_requests} overdue` : undefined}
              icon={Clock}
            />
            <StatsCard
              title="Consent Rate"
              value={`${stats.consent_rate}%`}
              icon={Users}
            />
            <StatsCard
              title="Data Retention Compliance"
              value={`${stats.data_retention_compliance}%`}
              icon={Shield}
            />
          </div>

          {/* Overdue Requests Alert */}
          {stats.overdue_requests > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {stats.overdue_requests} overdue GDPR request(s) that require immediate attention.
                GDPR compliance requires responses within 30 days of the request.
              </AlertDescription>
            </Alert>
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
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={formState.type}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="export">Data Export</SelectItem>
                      <SelectItem value="delete">Data Deletion</SelectItem>
                      <SelectItem value="rectification">Data Rectification</SelectItem>
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

          {/* Main Content */}
          <Tabs defaultValue="requests" className="w-full">
            <TabsList>
              <TabsTrigger value="requests">Data Requests</TabsTrigger>
              <TabsTrigger value="consent">Consent Records</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>GDPR Data Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataRequestsTable requests={dataRequests.data} />
                  <div className="mt-6">
                    {/* TODO: Replace with actual currentPage, totalPages, and onPageChange logic */}
                    {/* <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} /> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consent">
              <Card>
                <CardHeader>
                  <CardTitle>Consent Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsentRecordsTable records={consentRecords.data} />
                  <div className="mt-6">
                    {/* TODO: Replace with actual currentPage, totalPages, and onPageChange logic */}
                    {/* <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} /> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
