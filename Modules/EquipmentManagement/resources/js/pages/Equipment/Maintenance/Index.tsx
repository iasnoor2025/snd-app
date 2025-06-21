import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/Modules/EquipmentManagement/resources/js/types';
import { AppLayout } from '@/Core';
import { Equipment, MaintenanceRecord } from '@/Modules/EquipmentManagement/resources/js/types/models';
// Simple format functions
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Wrench as WrenchIcon,
  DollarSign as DollarSignIcon,
  BarChart3 as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  XCircle as XCircleIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props extends PageProps {
  equipment: Equipment;
  history: MaintenanceRecord[];
  costs: {
    total_cost: number;
    average_cost: number;
    maintenance_count: number;
    cost_by_type: Record<string, {
      count: number;
      total_cost: number;
      average_cost: number;
    }>;
  };
  performance: {
    total_maintenance_count: number;
    preventive_count: number;
    repair_count: number;
    total_downtime_hours: number;
    average_downtime_hours: number;
    maintenance_frequency: number;
    cost_efficiency: number;
  };
  schedule: {
    last_maintenance?: {
      date: string;
      type: string;
    };
    next_maintenance?: {
      due_date: string;
      type: string;
    };
    maintenance_interval_days: number;
  };
}

export default function MaintenanceIndex({ equipment, history, costs, performance, schedule }: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('history');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Equipment', href: route('equipment.index') },
    { title: equipment.name, href: route('equipment.show', equipment.id) },
    { title: 'Maintenance', href: route('equipment.maintenance.index', equipment.id) },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'preventive':
        return <Badge className="bg-blue-100 text-blue-800">Preventive</Badge>;
      case 'repair':
        return <Badge className="bg-red-100 text-red-800">Repair</Badge>;
      case 'inspection':
        return <Badge className="bg-green-100 text-green-800">Inspection</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatMaintenanceDate = (record: MaintenanceRecord) => {
    if (record.performed_date) {
      return formatDate(record.performed_date);
    } else if (record.scheduled_date) {
      return `Scheduled: ${formatDate(record.scheduled_date)}`;
    }
    return 'No date';
  };

  return (
    <AppLayout title={`Maintenance - ${equipment.name}`} breadcrumbs={breadcrumbs}>
      <Head title={`Maintenance - ${equipment.name}`} />

      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Dashboard</h1>
            <p className="text-muted-foreground">
              {equipment.door_number ? `#${equipment.door_number} - ` : ''}{equipment.name} - {equipment.model}
            </p>
          </div>
          <Button asChild>
            <Link href={route('equipment.maintenance.create', equipment.id)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Schedule Maintenance
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Records
              </CardTitle>
              <WrenchIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.total_maintenance_count}</div>
              <p className="text-xs text-muted-foreground">
                {performance.preventive_count} preventive, {performance.repair_count} repairs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cost
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(costs.total_cost)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(costs.average_cost)} per record
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Maintenance
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedule.next_maintenance ? formatDate(schedule.next_maintenance.due_date) : 'Not Scheduled'}
              </div>
              <p className="text-xs text-muted-foreground">
                {schedule.next_maintenance ? schedule.next_maintenance.type : 'No upcoming maintenance'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Downtime
              </CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(performance.total_downtime_hours)} hrs</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(performance.average_downtime_hours)} hrs per record
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="history">Maintenance History</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatMaintenanceDate(record)}</TableCell>
                          <TableCell>{getTypeBadge(record.type)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{formatCurrency(record.cost)}</TableCell>
                          <TableCell>{record.performed_by?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={route('equipment.maintenance.show', [equipment.id, record.id])}>
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No maintenance records found</p>
                    <Button className="mt-4" asChild>
                      <Link href={route('equipment.maintenance.create', equipment.id)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Schedule Maintenance
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cost Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-bold">{formatCurrency(costs.total_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Cost per Record:</span>
                        <span>{formatCurrency(costs.average_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Records:</span>
                        <span>{costs.maintenance_count}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cost by Type</h3>
                    <div className="space-y-2">
                      {Object.entries(costs.cost_by_type).map(([type, data]) => (
                        <div key={type} className="flex justify-between">
                          <span>{type.charAt(0).toUpperCase() + type.slice(1)} ({data.count}):</span>
                          <span>{formatCurrency(data.total_cost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Maintenance Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Maintenance Frequency:</span>
                        <span>{performance.maintenance_frequency.toFixed(1)} per year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Downtime:</span>
                        <span>{Math.round(performance.total_downtime_hours)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Downtime:</span>
                        <span>{Math.round(performance.average_downtime_hours)} hours per record</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Efficiency:</span>
                        <span>{(performance.cost_efficiency * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Maintenance Schedule</h3>
                    <div className="space-y-2">
                      {schedule.last_maintenance ? (
                        <div className="flex justify-between">
                          <span>Last Maintenance:</span>
                          <span>{formatDate(schedule.last_maintenance.date)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span>Last Maintenance:</span>
                          <span>None</span>
                        </div>
                      )}
                      {schedule.next_maintenance ? (
                        <div className="flex justify-between">
                          <span>Next Maintenance:</span>
                          <span>{formatDate(schedule.next_maintenance.due_date)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span>Next Maintenance:</span>
                          <span>Not Scheduled</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Recommended Interval:</span>
                        <span>{schedule.maintenance_interval_days} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

















