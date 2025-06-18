/**
 * Audit Log Details Component
 * Displays detailed information about a specific audit log entry
 */

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Calendar, Database, FileText, Eye, EyeOff, Copy, Check } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: number;
  event: string;
  auditable_type: string;
  auditable_id: number;
  user_id?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  url?: string;
  ip_address?: string;
  user_agent?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  log: AuditLog;
  relatedLogs?: AuditLog[];
}

function JsonViewer({ data, title }: { data: Record<string, any> | null; title: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {title.toLowerCase()} available
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <ScrollArea className="h-64 w-full rounded border">
          <pre className="p-4 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      ) : (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-start space-x-2 text-sm">
              <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
                {key}:
              </span>
              <span className="break-all">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getEventBadge(event: string) {
  const eventConfig = {
    created: { color: 'bg-green-500', label: 'Created' },
    updated: { color: 'bg-blue-500', label: 'Updated' },
    deleted: { color: 'bg-red-500', label: 'Deleted' },
    restored: { color: 'bg-yellow-500', label: 'Restored' },
    viewed: { color: 'bg-gray-500', label: 'Viewed' },
    exported: { color: 'bg-purple-500', label: 'Exported' },
  };

  const config = eventConfig[event as keyof typeof eventConfig] || {
    color: 'bg-gray-400',
    label: event
  };

  return (
    <Badge className={cn('text-white', config.color)}>
      {config.label}
    </Badge>
  );
}

function RelatedLogsTable({ logs }: { logs: AuditLog[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No related audit logs found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm text-muted-foreground">#{log.id}</span>
            {getEventBadge(log.event)}
            <span className="text-sm">{log.user?.name || 'System'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(log.created_at)}
            </span>
          </div>
          <Link href={route('audit.logs.show', log.id)}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function Show({ log, relatedLogs = [] }: ShowProps) {
  const modelName = log.auditable_type.split('\\').pop();

  return (
    <AppLayout
      title={`Audit Log #${log.id}`}
      renderHeader={() => (
        <div className="flex items-center space-x-4">
          <Link href={route('audit.logs')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Audit Logs
            </Button>
          </Link>
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Audit Log #{log.id}
          </h2>
        </div>
      )}
    >
      <Head title={`Audit Log #${log.id}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Audit Log Overview</span>
                </CardTitle>
                {getEventBadge(log.event)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>Model Information</span>
                  </div>
                  <div>
                    <div className="font-medium">{modelName}</div>
                    <div className="text-sm text-muted-foreground">ID: {log.auditable_id}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>User Information</span>
                  </div>
                  <div>
                    {log.user ? (
                      <>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-sm text-muted-foreground">{log.user.email}</div>
                      </>
                    ) : (
                      <div className="font-medium text-muted-foreground">System</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Timestamp</span>
                  </div>
                  <div>
                    <div className="font-medium">{formatDateTime(log.created_at)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Technical Details</div>
                  <div className="space-y-1">
                    {log.ip_address && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">IP:</span> {log.ip_address}
                      </div>
                    )}
                    {log.url && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">URL:</span> {log.url}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {log.tags && log.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {log.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Data Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Data Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="changes" className="w-full">
                <TabsList>
                  <TabsTrigger value="changes">Changes Overview</TabsTrigger>
                  <TabsTrigger value="old">Old Values</TabsTrigger>
                  <TabsTrigger value="new">New Values</TabsTrigger>
                </TabsList>

                <TabsContent value="changes" className="space-y-4">
                  {log.event === 'created' && (
                    <Alert>
                      <AlertDescription>
                        This record was created. All values shown are the initial values.
                      </AlertDescription>
                    </Alert>
                  )}

                  {log.event === 'deleted' && (
                    <Alert>
                      <AlertDescription>
                        This record was deleted. The old values show the state before deletion.
                      </AlertDescription>
                    </Alert>
                  )}

                  {log.event === 'updated' && log.old_values && log.new_values && (
                    <div className="space-y-4">
                      {Object.keys({ ...log.old_values, ...log.new_values }).map((key) => {
                        const oldValue = log.old_values?.[key];
                        const newValue = log.new_values?.[key];
                        const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

                        if (!hasChanged) return null;

                        return (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="font-medium mb-2">{key}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Old Value</div>
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                  {oldValue !== undefined ? String(oldValue) : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">New Value</div>
                                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                                  {newValue !== undefined ? String(newValue) : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="old">
                  <JsonViewer data={log.old_values} title="Old Values" />
                </TabsContent>

                <TabsContent value="new">
                  <JsonViewer data={log.new_values} title="New Values" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Related Logs */}
          {relatedLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <RelatedLogsTable logs={relatedLogs} />
              </CardContent>
            </Card>
          )}

          {/* User Agent */}
          {log.user_agent && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">User Agent</div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {log.user_agent}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
