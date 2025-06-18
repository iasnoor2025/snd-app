import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  Globe,
  Shield,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value?: string | number;
  unit?: string;
  percentage?: number;
  message?: string;
  last_checked?: string;
}

interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
  metrics: {
    database: HealthMetric;
    cache: HealthMetric;
    storage: HealthMetric;
    memory: HealthMetric;
    cpu: HealthMetric;
    queue: HealthMetric;
    mail: HealthMetric;
    security: HealthMetric;
  };
  uptime: {
    days: number;
    hours: number;
    minutes: number;
  };
  version: {
    app: string;
    php: string;
    laravel: string;
  };
}

interface SystemHealthProps {
  healthData: SystemHealthData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const SystemHealth: React.FC<SystemHealthProps> = ({
  healthData,
  onRefresh,
  isRefreshing = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getMetricIcon = (metricName: string) => {
    const icons = {
      database: Database,
      cache: Zap,
      storage: HardDrive,
      memory: MemoryStick,
      cpu: Cpu,
      queue: Clock,
      mail: Globe,
      security: Shield,
    };
    return icons[metricName as keyof typeof icons] || Server;
  };

  const formatUptime = (uptime: { days: number; hours: number; minutes: number }) => {
    const parts = [];
    if (uptime.days > 0) parts.push(`${uptime.days}d`);
    if (uptime.hours > 0) parts.push(`${uptime.hours}h`);
    if (uptime.minutes > 0) parts.push(`${uptime.minutes}m`);
    return parts.join(' ') || '0m';
  };

  const formatLastChecked = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const OverallStatusIcon = getStatusIcon(healthData.overall_status);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <OverallStatusIcon className={`h-5 w-5 mr-2 ${getStatusColor(healthData.overall_status)}`} />
              System Health
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(healthData.overall_status)}>
                {healthData.overall_status.charAt(0).toUpperCase() + healthData.overall_status.slice(1)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium">{formatLastChecked(healthData.last_updated)}</p>
            </div>
            <div>
              <p className="text-gray-500">System Uptime</p>
              <p className="font-medium">{formatUptime(healthData.uptime)}</p>
            </div>
            <div>
              <p className="text-gray-500">App Version</p>
              <p className="font-medium">{healthData.version.app}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(healthData.metrics).map(([key, metric]) => {
          const MetricIcon = getMetricIcon(key);
          const StatusIcon = getStatusIcon(metric.status);

          return (
            <Card key={key} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MetricIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <h4 className="text-sm font-medium capitalize">{metric.name}</h4>
                  </div>
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                </div>

                {metric.percentage !== undefined && (
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Usage</span>
                      <span>{metric.percentage}%</span>
                    </div>
                    <Progress
                      value={metric.percentage}
                      className="h-2"
                    />
                  </div>
                )}

                {metric.value !== undefined && (
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{metric.value}</span>
                    {metric.unit && <span className="ml-1">{metric.unit}</span>}
                  </div>
                )}

                {metric.message && (
                  <p className="text-xs text-gray-500 mb-2">{metric.message}</p>
                )}

                {metric.last_checked && (
                  <p className="text-xs text-gray-400">
                    Checked {formatLastChecked(metric.last_checked)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Application</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-medium">{healthData.version.app}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Environment:</span>
                  <Badge variant="outline" className="text-xs">
                    {process.env.NODE_ENV || 'production'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Runtime</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">PHP:</span>
                  <span className="font-medium">{healthData.version.php}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Laravel:</span>
                  <span className="font-medium">{healthData.version.laravel}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">{formatUptime(healthData.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={getStatusBadgeVariant(healthData.overall_status)} className="text-xs">
                    {healthData.overall_status.charAt(0).toUpperCase() + healthData.overall_status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col">
              <Zap className="h-4 w-4 mb-1" />
              <span className="text-xs">Clear Cache</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col">
              <Database className="h-4 w-4 mb-1" />
              <span className="text-xs">Optimize DB</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col">
              <HardDrive className="h-4 w-4 mb-1" />
              <span className="text-xs">Clean Storage</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex flex-col">
              <RefreshCw className="h-4 w-4 mb-1" />
              <span className="text-xs">Restart Queue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;
