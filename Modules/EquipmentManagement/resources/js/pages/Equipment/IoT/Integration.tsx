import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../../../../../../resources/js/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../../resources/js/components/ui/card';
import { Badge } from '../../../../../../../resources/js/components/ui/badge';
import { Button } from '../../../../../../../resources/js/components/ui/button';
import { Progress } from '../../../../../../../resources/js/components/ui/progress';
import { Alert, AlertDescription } from '../../../../../../../resources/js/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../../../resources/js/components/ui/tabs';
import { Input } from '../../../../../../../resources/js/components/ui/input';
import { Label } from '../../../../../../../resources/js/components/ui/label';
import { Switch } from 'Modules/Core/resources/js/components/ui/switch';
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
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import {
  Wifi,
  WifiOff,
  Smartphone,
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  Wind,
  MapPin,
  Signal,
  Battery,
  Satellite,
  Radio,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Shield
} from 'lucide-react';
import { formatCurrency } from '../../../../../../../resources/js/utils/format';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'controller' | 'gateway' | 'actuator';
  equipmentId: number;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  batteryLevel?: number;
  signalStrength: number;
  lastSeen: string;
  firmware: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  sensors: Sensor[];
}

interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'fuel' | 'gps' | 'humidity' | 'voltage' | 'current';
  value: number;
  unit: string;
  threshold: {
    min: number;
    max: number;
  };
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
}

interface SensorData {
  timestamp: string;
  deviceId: string;
  sensorId: string;
  value: number;
  quality: number;
}

interface RemoteCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters: Record<string, any>;
  status: 'pending' | 'sent' | 'acknowledged' | 'executed' | 'failed';
  timestamp: string;
  response?: string;
}

interface Props {
  devices: IoTDevice[];
  equipment: Array<{ id: number; name: string; }>;
}

const IoTIntegration: React.FC<Props> = ({ devices = [], equipment = [] }) => {
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(devices[0] || null);
  const [sensorData, setSensorData] = useState<Record<string, SensorData[]>>({});
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [commands, setCommands] = useState<RemoteCommand[]>([]);
  const [newCommand, setNewCommand] = useState({ command: '', parameters: '' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);

  // Simulate real-time sensor data
  const generateSensorData = useCallback(() => {
    if (!selectedDevice || !isMonitoring) return;

    const now = new Date().toISOString();
    const newData: Record<string, SensorData[]> = {};

    selectedDevice.sensors.forEach(sensor => {
      const currentData = sensorData[sensor.id] || [];
      const baseValue = sensor.value;
      const variation = (Math.random() - 0.5) * 0.2 * baseValue;
      const newValue = Math.max(0, baseValue + variation);

      newData[sensor.id] = [
        ...currentData.slice(-19), // Keep last 20 points
        {
          timestamp: now,
          deviceId: selectedDevice.id,
          sensorId: sensor.id,
          value: newValue,
          quality: 85 + Math.random() * 15
        }
      ];
    });

    setSensorData(prev => ({ ...prev, ...newData }));
  }, [selectedDevice, sensorData, isMonitoring]);

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(generateSensorData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring, refreshInterval, generateSensorData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'default',
      offline: 'destructive',
      error: 'destructive',
      maintenance: 'secondary'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'pressure': return <Gauge className="h-4 w-4" />;
      case 'vibration': return <Activity className="h-4 w-4" />;
      case 'fuel': return <Droplets className="h-4 w-4" />;
      case 'gps': return <MapPin className="h-4 w-4" />;
      case 'humidity': return <Wind className="h-4 w-4" />;
      case 'voltage': return <Zap className="h-4 w-4" />;
      case 'current': return <Zap className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getSensorStatus = (sensor: Sensor) => {
    if (sensor.value < sensor.threshold.min || sensor.value > sensor.threshold.max) {
      return sensor.value < sensor.threshold.min * 0.8 || sensor.value > sensor.threshold.max * 1.2 ? 'critical' : 'warning';
    }
    return 'normal';
  };

  const sendCommand = async () => {
    if (!selectedDevice || !newCommand.command) return;

    const command: RemoteCommand = {
      id: Date.now().toString(),
      deviceId: selectedDevice.id,
      command: newCommand.command,
      parameters: newCommand.parameters ? JSON.parse(newCommand.parameters) : {},
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setCommands(prev => [command, ...prev]);
    setNewCommand({ command: '', parameters: '' });

    // Simulate command execution
    setTimeout(() => {
      setCommands(prev => prev.map(cmd =>
        cmd.id === command.id ? { ...cmd, status: 'sent' } : cmd
      ));
    }, 1000);

    setTimeout(() => {
      setCommands(prev => prev.map(cmd =>
        cmd.id === command.id ? {
          ...cmd,
          status: 'executed',
          response: 'Command executed successfully'
        } : cmd
      ));
    }, 3000);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-yellow-500';
    if (strength >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <AdminLayout>
      <Head title="IoT Integration" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wifi className="h-8 w-8 text-blue-600" />
              IoT Integration
            </h1>
            <p className="text-muted-foreground">Real-time equipment monitoring and remote control</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Connected Devices</p>
                  <p className="text-2xl font-bold">{devices.filter(d => d.status === 'online').length}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sensors</p>
                  <p className="text-2xl font-bold">{devices.reduce((acc, d) => acc + d.sensors.length, 0)}</p>
                </div>
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">
                    {devices.reduce((acc, d) =>
                      acc + d.sensors.filter(s => getSensorStatus(s) !== 'normal').length, 0
                    )}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Points/min</p>
                  <p className="text-2xl font-bold">{Math.floor(devices.length * 2.5)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Selection */}
        <Card>
          <CardHeader>
            <CardTitle>IoT Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDevice?.id === device.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{device.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      {getStatusBadge(device.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span className={getSignalStrengthColor(device.signalStrength)}>
                        {device.signalStrength}%
                      </span>
                    </div>
                    {device.batteryLevel && (
                      <div className="flex justify-between">
                        <span>Battery:</span>
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sensors:</span>
                      <span>{device.sensors.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedDevice && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="sensors" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
                  <TabsTrigger value="control">Remote Control</TabsTrigger>
                  <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                </TabsList>

                <TabsContent value="sensors">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Real-time Sensor Data - {selectedDevice.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Sensor Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDevice.sensors.map((sensor) => {
                            const status = getSensorStatus(sensor);
                            return (
                              <div key={sensor.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getSensorIcon(sensor.type)}
                                    <span className="font-medium">{sensor.name}</span>
                                  </div>
                                  <Badge
                                    variant={status === 'normal' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                                  >
                                    {status}
                                  </Badge>
                                </div>
                                <div className="text-2xl font-bold mb-1">
                                  {sensor.value.toFixed(1)} {sensor.unit}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                  Last update: {formatTimestamp(sensor.lastUpdate)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Sensor Charts */}
                        <div className="space-y-4">
                          {selectedDevice.sensors.slice(0, 2).map((sensor) => {
                            const data = sensorData[sensor.id] || [];
                            return (
                              <div key={sensor.id}>
                                <h4 className="text-sm font-medium mb-2">{sensor.name} Trend</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <ComposedChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="timestamp"
                                      tickFormatter={formatTimestamp}
                                      interval="preserveStartEnd"
                                    />
                                    <YAxis />
                                    <Tooltip
                                      labelFormatter={formatTimestamp}
                                      formatter={(value: number) => [`${value.toFixed(2)} ${sensor.unit}`, 'Value']}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="value"
                                      stroke="#3B82F6"
                                      fill="#3B82F6"
                                      fillOpacity={0.3}
                                    />
                                    <ReferenceLine y={sensor.threshold.min} stroke="red" strokeDasharray="5 5" />
                                    <ReferenceLine y={sensor.threshold.max} stroke="red" strokeDasharray="5 5" />
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="control">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5" />
                        Remote Control - {selectedDevice.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Command Interface */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4">Send Command</h4>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="command">Command</Label>
                              <Input
                                id="command"
                                value={newCommand.command}
                                onChange={(e) => setNewCommand(prev => ({ ...prev, command: e.target.value }))}
                                placeholder="e.g., start_engine, stop_engine, set_temperature"
                              />
                            </div>
                            <div>
                              <Label htmlFor="parameters">Parameters (JSON)</Label>
                              <Input
                                id="parameters"
                                value={newCommand.parameters}
                                onChange={(e) => setNewCommand(prev => ({ ...prev, parameters: e.target.value }))}
                                placeholder='{"temperature": 25, "mode": "auto"}'
                              />
                            </div>
                            <Button onClick={sendCommand} disabled={!newCommand.command}>
                              <Radio className="h-4 w-4 mr-2" />
                              Send Command
                            </Button>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4">Quick Actions</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button variant="outline" size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                            <Button variant="outline" size="sm">
                              <Pause className="h-3 w-3 mr-1" />
                              Stop
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3 mr-1" />
                              Config
                            </Button>
                          </div>
                        </div>

                        {/* Command History */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4">Command History</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {commands.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No commands sent yet</p>
                            ) : (
                              commands.map((cmd) => (
                                <div key={cmd.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="font-medium">{cmd.command}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {formatTimestamp(cmd.timestamp)}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={cmd.status === 'executed' ? 'default' : cmd.status === 'failed' ? 'destructive' : 'secondary'}
                                  >
                                    {cmd.status}
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diagnostics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Device Diagnostics - {selectedDevice.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Device Health */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3">Connectivity</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">Signal Strength</span>
                                <span className={`text-sm ${getSignalStrengthColor(selectedDevice.signalStrength)}`}>
                                  {selectedDevice.signalStrength}%
                                </span>
                              </div>
                              <Progress value={selectedDevice.signalStrength} className="h-2" />

                              {selectedDevice.batteryLevel && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Battery Level</span>
                                    <span className="text-sm">{selectedDevice.batteryLevel}%</span>
                                  </div>
                                  <Progress value={selectedDevice.batteryLevel} className="h-2" />
                                </>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3">System Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Device ID:</span>
                                <span className="font-mono">{selectedDevice.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="capitalize">{selectedDevice.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Firmware:</span>
                                <span>{selectedDevice.firmware}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Last Seen:</span>
                                <span>{formatTimestamp(selectedDevice.lastSeen)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Address:</strong> {selectedDevice.location.address}</div>
                            <div><strong>Coordinates:</strong> {selectedDevice.location.lat.toFixed(6)}, {selectedDevice.location.lng.toFixed(6)}</div>
                          </div>
                        </div>

                        {/* Sensor Status */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">Sensor Status</h4>
                          <div className="space-y-2">
                            {selectedDevice.sensors.map((sensor) => {
                              const status = getSensorStatus(sensor);
                              return (
                                <div key={sensor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    {getSensorIcon(sensor.type)}
                                    <span className="text-sm">{sensor.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{sensor.value.toFixed(1)} {sensor.unit}</span>
                                    <Badge
                                      variant={status === 'normal' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {status}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Device Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(selectedDevice.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Equipment:</span>
                    <span className="text-sm">
                      {equipment.find(eq => eq.id === selectedDevice.equipmentId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm capitalize">{selectedDevice.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Sensors:</span>
                    <span className="text-sm">{selectedDevice.sensors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Signal:</span>
                    <span className={`text-sm ${getSignalStrengthColor(selectedDevice.signalStrength)}`}>
                      {selectedDevice.signalStrength}%
                    </span>
                  </div>
                  {selectedDevice.batteryLevel && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Battery:</span>
                      <span className="text-sm">{selectedDevice.batteryLevel}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedDevice.sensors.filter(s => getSensorStatus(s) !== 'normal').length === 0 ? (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        All sensors normal
                      </div>
                    ) : (
                      selectedDevice.sensors
                        .filter(s => getSensorStatus(s) !== 'normal')
                        .map((sensor) => {
                          const status = getSensorStatus(sensor);
                          return (
                            <Alert key={sensor.id} className={status === 'critical' ? 'border-red-200' : 'border-yellow-200'}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                <div className="font-medium">{sensor.name}</div>
                                <div>Value: {sensor.value.toFixed(1)} {sensor.unit}</div>
                                <div className="text-xs text-muted-foreground">
                                  Expected: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                                </div>
                              </AlertDescription>
                            </Alert>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default IoTIntegration;
