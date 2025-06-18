/**
 * Data Retention Policy Management
 * Manages data retention policies, schedules, and automated cleanup processes
 */

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Database,
  Calendar,
  Trash2,
  Edit,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Shield,
  Settings,
  BarChart3,
  FileText,
  Eye
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

interface DataRetentionPolicy {
  id: number;
  name: string;
  description: string;
  model_type: string;
  retention_period: number;
  retention_unit: 'days' | 'months' | 'years';
  action: 'delete' | 'archive' | 'anonymize';
  conditions?: Record<string, any>;
  is_active: boolean;
  last_executed_at?: string;
  next_execution_at?: string;
  records_affected: number;
  created_at: string;
  updated_at: string;
}

interface RetentionExecution {
  id: number;
  policy_id: number;
  policy: DataRetentionPolicy;
  status: 'pending' | 'running' | 'completed' | 'failed';
  records_processed: number;
  records_affected: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  summary?: {
    deleted: number;
    archived: number;
    anonymized: number;
    errors: number;
  };
}

interface RetentionStats {
  total_policies: number;
  active_policies: number;
  total_executions: number;
  records_processed_today: number;
  storage_freed_mb: number;
  compliance_score: number;
}

interface DataRetentionProps {
  policies: {
    data: DataRetentionPolicy[];
    links: any[];
  };
  executions: {
    data: RetentionExecution[];
    links: any[];
  };
  stats: RetentionStats;
  modelTypes: string[];
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
    running: { color: 'bg-blue-500', icon: Play, label: 'Running' },
    completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'bg-red-500', icon: AlertTriangle, label: 'Failed' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gray-400',
    icon: Clock,
    label: status
  };

  const Icon = config.icon;

  return (
    <Badge className={cn('text-white flex items-center space-x-1', config.color)}>
      <Icon className={cn('h-3 w-3', status === 'running' && 'animate-pulse')} />
      <span>{config.label}</span>
    </Badge>
  );
}

function getActionBadge(action: string) {
  const actionConfig = {
    delete: { color: 'bg-red-500', icon: Trash2, label: 'Delete' },
    archive: { color: 'bg-blue-500', icon: Archive, label: 'Archive' },
    anonymize: { color: 'bg-orange-500', icon: Shield, label: 'Anonymize' },
  };

  const config = actionConfig[action as keyof typeof actionConfig] || {
    color: 'bg-gray-400',
    icon: FileText,
    label: action
  };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

function formatRetentionPeriod(period: number, unit: string): string {
  return `${period} ${unit}${period !== 1 ? '' : unit.slice(0, -1)}`;
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

function PolicyFormDialog({ policy, onSave, modelTypes }: {
  policy?: DataRetentionPolicy;
  onSave: (data: any) => void;
  modelTypes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    model_type: policy?.model_type || '',
    retention_period: policy?.retention_period || 30,
    retention_unit: policy?.retention_unit || 'days',
    action: policy?.action || 'delete',
    is_active: policy?.is_active ?? true,
    conditions: policy?.conditions || {},
  });

  const handleSubmit = () => {
    onSave(formData);
    setOpen(false);
    if (!policy) {
      setFormData({
        name: '',
        description: '',
        model_type: '',
        retention_period: 30,
        retention_unit: 'days',
        action: 'delete',
        is_active: true,
        conditions: {},
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {policy ? (
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {policy ? 'Edit Data Retention Policy' : 'Create Data Retention Policy'}
          </DialogTitle>
          <DialogDescription>
            Configure how long data should be retained and what action to take when the retention period expires.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter policy name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_type">Model Type</Label>
              <Select
                value={formData.model_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {modelTypes.map(type => {
                    const displayName = type.split('\\').pop();
                    return (
                      <SelectItem key={type} value={type}>{displayName}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this policy does"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention_period">Retention Period</Label>
              <Input
                id="retention_period"
                type="number"
                min="1"
                value={formData.retention_period}
                onChange={(e) => setFormData(prev => ({ ...prev, retention_period: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_unit">Unit</Label>
              <Select
                value={formData.retention_unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, retention_unit: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData(prev => ({ ...prev, action: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="anonymize">Anonymize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Policy is active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.model_type}
          >
            {policy ? 'Update Policy' : 'Create Policy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PoliciesTable({ policies, modelTypes }: { policies: DataRetentionPolicy[]; modelTypes: string[] }) {
  const handleTogglePolicy = (policyId: number, isActive: boolean) => {
    router.patch(route('data-retention.policies.toggle', policyId), {
      is_active: isActive
    });
  };

  const handleExecutePolicy = (policyId: number) => {
    if (confirm('Are you sure you want to execute this retention policy now?')) {
      router.post(route('data-retention.policies.execute', policyId));
    }
  };

  const handleDeletePolicy = (policyId: number) => {
    if (confirm('Are you sure you want to delete this retention policy?')) {
      router.delete(route('data-retention.policies.destroy', policyId));
    }
  };

  const handleSavePolicy = (data: any, policyId?: number) => {
    if (policyId) {
      router.patch(route('data-retention.policies.update', policyId), data);
    } else {
      router.post(route('data-retention.policies.store'), data);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Policy Name</TableHead>
          <TableHead>Model Type</TableHead>
          <TableHead>Retention Period</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Executed</TableHead>
          <TableHead>Records Affected</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => {
          const modelName = policy.model_type.split('\\').pop();

          return (
            <TableRow key={policy.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{policy.name}</div>
                  <div className="text-sm text-muted-foreground">{policy.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{modelName}</Badge>
              </TableCell>
              <TableCell>
                {formatRetentionPeriod(policy.retention_period, policy.retention_unit)}
              </TableCell>
              <TableCell>{getActionBadge(policy.action)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={policy.is_active}
                    onCheckedChange={(checked) => handleTogglePolicy(policy.id, checked)}
                  />
                  <span className="text-sm">
                    {policy.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {policy.last_executed_at ? (
                  <div className="text-sm">
                    <div>{new Date(policy.last_executed_at).toLocaleString()}</div>
                    {policy.next_execution_at && (
                      <div className="text-muted-foreground">
                        Next: {new Date(policy.next_execution_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell className="font-mono">
                {policy.records_affected.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <PolicyFormDialog
                    policy={policy}
                    onSave={(data) => handleSavePolicy(data, policy.id)}
                    modelTypes={modelTypes}
                  />

                  {policy.is_active && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExecutePolicy(policy.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}

        {policies.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6">
              No data retention policies found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function ExecutionsTable({ executions }: { executions: RetentionExecution[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Policy</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Records Processed</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions.map((execution) => {
          const duration = execution.completed_at
            ? Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000 / 60)
            : null;

          return (
            <TableRow key={execution.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{execution.policy.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {execution.policy.model_type.split('\\').pop()}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(execution.status)}</TableCell>
              <TableCell>{new Date(execution.started_at).toLocaleString()}</TableCell>
              <TableCell>
                {duration !== null ? `${duration}min` : '-'}
              </TableCell>
              <TableCell className="font-mono">
                {execution.records_processed.toLocaleString()}
              </TableCell>
              <TableCell>
                {execution.summary && (
                  <div className="text-sm space-y-1">
                    {execution.summary.deleted > 0 && (
                      <div>Deleted: {execution.summary.deleted}</div>
                    )}
                    {execution.summary.archived > 0 && (
                      <div>Archived: {execution.summary.archived}</div>
                    )}
                    {execution.summary.anonymized > 0 && (
                      <div>Anonymized: {execution.summary.anonymized}</div>
                    )}
                    {execution.summary.errors > 0 && (
                      <div className="text-red-600">Errors: {execution.summary.errors}</div>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Link href={route('data-retention.executions.show', execution.id)}>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}

        {executions.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              No retention executions found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function DataRetention({
  policies,
  executions,
  stats,
  modelTypes
}: DataRetentionProps) {
  const { t } = useTranslation();

  const handleSavePolicy = (data: any) => {
    router.post(route('data-retention.policies.store'), data);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center space-x-2">
        <Database className="h-6 w-6" />
        <span>Data Retention Management</span>
      </h2>
      <PolicyFormDialog onSave={handleSavePolicy} modelTypes={modelTypes} />
    </div>
  );

  return (
    <AppLayout>
      <Head title="Data Retention Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Policies"
              value={stats.total_policies}
              subtitle={`${stats.active_policies} active`}
              icon={FileText}
            />
            <StatsCard
              title="Total Executions"
              value={stats.total_executions}
              icon={Play}
            />
            <StatsCard
              title="Records Processed Today"
              value={stats.records_processed_today.toLocaleString()}
              icon={BarChart3}
            />
            <StatsCard
              title="Storage Freed"
              value={formatFileSize(stats.storage_freed_mb * 1024 * 1024)}
              icon={Archive}
            />
          </div>

          {/* Compliance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Data Retention Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Progress value={stats.compliance_score} className="flex-1" />
                <span className="text-2xl font-bold">{stats.compliance_score}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Overall compliance score based on active policies and execution success rate.
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="mb-6">
            {renderHeader()}
          </div>
          <Tabs defaultValue="policies" className="w-full">
            <TabsList>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>

            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Data Retention Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <PoliciesTable policies={policies.data} modelTypes={modelTypes} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="executions">
              <Card>
                <CardHeader>
                  <CardTitle>Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExecutionsTable executions={executions.data} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
