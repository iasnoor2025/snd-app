import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { Button } from "@/Core";
import { Progress } from "@/Core";
import { Alert, AlertDescription } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  Thermometer,
  Zap,
  Fuel,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from "@/Core";

interface EquipmentStatus {
  id: number;
  name: string;
  status: 'running' | 'idle' | 'maintenance' | 'offline';
  location: string;
  operator?: string;
  currentJob?: string;
  operatingHours: number;
  fuelLevel?: number;
  temperature?: number;
  pressure?: number;
  vibration?: number;
  efficiency: number;
  alerts: Alert[];
  lastUpdate: string;
}

interface Alert {
  id: number;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface RealTimeMetric {
  timestamp: string;
  value: number;
  threshold?: number;
  unit: string;
}

interface PerformanceData {
  equipmentId: number;
  metrics: {
    operatingHours: RealTimeMetric[];
    fuelConsumption: RealTimeMetric[];
    temperature: RealTimeMetric[];
    efficiency: RealTimeMetric[];
    vibration: RealTimeMetric[];
  };
}

interface Props {
  equipment: EquipmentStatus[];
  selectedEquipmentId?: number;
}

const EquipmentPerformanceMonitor: React.FC<Props> = ({ equipment, selectedEquipmentId }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentStatus | null>(
    equipment.find(eq => eq.id === selectedEquipmentId) || equipment[0] || null
  );
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Simulate real-time data updates
  const generateRealTimeData = useCallback(() => {
    if (!selectedEquipment) return;

    const now = new Date().toISOString();
    const baseValue = Math.random() * 100;

    setPerformanceData(prev => {
      const newData: PerformanceData = {
        equipmentId: selectedEquipment.id,
        metrics: {
          operatingHours: [
            ...(prev?.metrics.operatingHours.slice(-19) || []),
            {
              timestamp: now,
              value: selectedEquipment.operatingHours + Math.random() * 0.1,
              unit: 'hours'
            }
          ],
          fuelConsumption: [
            ...(prev?.metrics.fuelConsumption.slice(-19) || []),
            {
              timestamp: now,
              value: 15 + Math.random() * 10,
              threshold: 25,
              unit: 'L/hr'
            }
          ],
          temperature: [
            ...(prev?.metrics.temperature.slice(-19) || []),
            {
              timestamp: now,
              value: 85 + Math.random() * 20,
              threshold: 100,
              unit: '°C'
            }
          ],
          efficiency: [
            ...(prev?.metrics.efficiency.slice(-19) || []),
            {
              timestamp: now,
              value: selectedEquipment.efficiency + (Math.random() - 0.5) * 10,
              threshold: 80,
              unit: '%'
            }
          ],
          vibration: [
            ...(prev?.metrics.vibration.slice(-19) || []),
            {
              timestamp: now,
              value: 2 + Math.random() * 3,
              threshold: 4,
              unit: 'mm/s'
            }
          ]
        }
      };
      return newData;
    });
  }, [selectedEquipment]);

  useEffect(() => {
    if (isMonitoring && selectedEquipment) {
      const interval = setInterval(generateRealTimeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, selectedEquipment, refreshInterval, generateRealTimeData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      idle: 'secondary',
      maintenance: 'destructive',
      offline: 'outline'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const acknowledgeAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <AppLayout>
      <Head title="Equipment Performance Monitor" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Monitor</h1>
            <p className="text-muted-foreground">Real-time equipment monitoring and diagnostics</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isMonitoring ? 'Pause' : 'Start'} Monitoring
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Equipment Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {equipment.map((eq) => (
                <div
                  key={eq.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedEquipment?.id === eq.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEquipment(eq)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{eq.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(eq.status)}`} />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Status: {getStatusBadge(eq.status)}</div>
                    <div>Location: {eq.location}</div>
                    <div>Efficiency: {eq.efficiency}%</div>
                    {eq.alerts.length > 0 && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {eq.alerts.length} alerts
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedEquipment && (
          <>
            {/* Equipment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {selectedEquipment.name} - Live Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="performance" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                        <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                      </TabsList>

                      <TabsContent value="performance">
                        {performanceData && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Fuel Consumption</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={performanceData.metrics.fuelConsumption}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestamp"
                                      tickFormatter={formatTime}
                                      interval="preserveStartEnd"
                                    />
                                    <YAxis />
                                    <Tooltip labelFormatter={formatTime} />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                                    <ReferenceLine y={25} stroke="red" strokeDasharray="5 5" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Temperature</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <AreaChart data={performanceData.metrics.temperature}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestamp"
                                      tickFormatter={formatTime}
                                      interval="preserveStartEnd"
                                    />
                                    <YAxis />
                                    <Tooltip labelFormatter={formatTime} />
                                    <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                                    <ReferenceLine y={100} stroke="red" strokeDasharray="5 5" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="diagnostics">
                        {performanceData && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Vibration Levels</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={performanceData.metrics.vibration}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestamp"
                                      tickFormatter={formatTime}
                                      interval="preserveStartEnd"
                                    />
                                    <YAxis />
                                    <Tooltip labelFormatter={formatTime} />
                                    <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} />
                                    <ReferenceLine y={4} stroke="red" strokeDasharray="5 5" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Fuel Level</span>
                                  <span className="text-sm">{selectedEquipment.fuelLevel || 0}%</span>
                                </div>
                                <Progress value={selectedEquipment.fuelLevel || 0} className="h-2" />

                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Temperature</span>
                                  <span className="text-sm">{selectedEquipment.temperature || 0}°C</span>
                                </div>
                                <Progress value={(selectedEquipment.temperature || 0) / 120 * 100} className="h-2" />

                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Efficiency</span>
                                  <span className="text-sm">{selectedEquipment.efficiency}%</span>
                                </div>
                                <Progress value={selectedEquipment.efficiency} className="h-2" />
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="efficiency">
                        {performanceData && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Efficiency Trend</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={performanceData.metrics.efficiency}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="timestamp"
                                  tickFormatter={formatTime}
                                  interval="preserveStartEnd"
                                />
                                <YAxis />
                                <Tooltip labelFormatter={formatTime} />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                <ReferenceLine y={80} stroke="green" strokeDasharray="5 5" label="Target" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Equipment Info & Alerts */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      {getStatusBadge(selectedEquipment.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm">{selectedEquipment.location}</span>
                    </div>
                    {selectedEquipment.operator && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Operator:</span>
                        <span className="text-sm">{selectedEquipment.operator}</span>
                      </div>
                    )}
                    {selectedEquipment.currentJob && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Current Job:</span>
                        <span className="text-sm">{selectedEquipment.currentJob}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Operating Hours:</span>
                      <span className="text-sm">{selectedEquipment.operatingHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Update:</span>
                      <span className="text-sm">{formatTime(selectedEquipment.lastUpdate)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedEquipment.alerts.length === 0 ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          No active alerts
                        </div>
                      ) : (
                        selectedEquipment.alerts.map((alert) => (
                          <Alert key={alert.id} className={alert.type === 'error' ? 'border-red-200' : alert.type === 'warning' ? 'border-yellow-200' : 'border-blue-200'}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div>{alert.message}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatTime(alert.timestamp)}
                                  </div>
                                </div>
                                {!alert.acknowledged && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                  >
                                    Ack
                                  </Button>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default EquipmentPerformanceMonitor;

















