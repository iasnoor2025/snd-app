import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { Button } from "@/Core";
import { Progress } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
import { Switch } from "@/Core";
import { Slider } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  Truck,
  MapPin,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Fuel,
  Gauge,
  Activity,
  Zap,
  Settings,
  BarChart3,
  PieChart,
  Map,
  Route,
  Calendar,
  Users,
  Wrench,
  Shield,
  Award,
  Brain,
  Lightbulb,
  Maximize,
  Minimize,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Play,
  Pause,
  SkipForward,
  Layers,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from "@/Core";

interface FleetEquipment {
  id: number;
  name: string;
  type: string;
  category: string;
  status: 'active' | 'idle' | 'maintenance' | 'transit';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  utilization: number;
  efficiency: number;
  fuelConsumption: number;
  operatingCost: number;
  maintenanceScore: number;
  assignedProject?: string;
  operator?: string;
  nextMaintenance: string;
  alerts: {
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    timestamp: string;
  }[];
  metrics: {
    hoursOperated: number;
    fuelUsed: number;
    distanceTraveled: number;
    jobsCompleted: number;
    downtime: number;
  };
}

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  type: 'cost_reduction' | 'utilization' | 'efficiency' | 'maintenance' | 'route';
  impact: {
    costSavings: number;
    utilizationImprovement: number;
    efficiencyGain: number;
    timeReduction: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    requirements: string[];
    risks: string[];
  };
  status: 'recommended' | 'in_progress' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

interface FleetMetrics {
  totalEquipment: number;
  activeEquipment: number;
  averageUtilization: number;
  totalOperatingCost: number;
  fuelEfficiency: number;
  maintenanceCompliance: number;
  safetyScore: number;
  customerSatisfaction: number;
  profitability: number;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  estimatedValue?: number;
  timeline?: string;
}

interface Props {
  fleet: FleetEquipment[];
  metrics: FleetMetrics;
  scenarios: OptimizationScenario[];
  insights: AIInsight[];
}

const FleetOptimization: React.FC<Props> = ({
  fleet = [],
  metrics,
  scenarios = [],
  insights = []
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<FleetEquipment | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<OptimizationScenario | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [optimizationTarget, setOptimizationTarget] = useState<'cost' | 'utilization' | 'efficiency'>('cost');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock fleet data
  const mockFleet: FleetEquipment[] = [
    {
      id: 1,
      name: 'Excavator CAT-320',
      type: 'Excavator',
      category: 'Heavy Equipment',
      status: 'active',
      location: { lat: 40.7128, lng: -74.0060, address: 'Site A, New York' },
      utilization: 85,
      efficiency: 92,
      fuelConsumption: 15.2,
      operatingCost: 125,
      maintenanceScore: 88,
      assignedProject: 'Downtown Construction',
      operator: 'John Smith',
      nextMaintenance: '2024-02-15',
      alerts: [
        { id: '1', type: 'warning', message: 'Hydraulic pressure slightly low', timestamp: '2024-01-10T10:30:00Z' }
      ],
      metrics: {
        hoursOperated: 1250,
        fuelUsed: 18500,
        distanceTraveled: 2500,
        jobsCompleted: 45,
        downtime: 25
      }
    },
    {
      id: 2,
      name: 'Bulldozer CAT-D8',
      type: 'Bulldozer',
      category: 'Heavy Equipment',
      status: 'idle',
      location: { lat: 40.7589, lng: -73.9851, address: 'Depot, Manhattan' },
      utilization: 45,
      efficiency: 78,
      fuelConsumption: 22.8,
      operatingCost: 180,
      maintenanceScore: 75,
      nextMaintenance: '2024-01-25',
      alerts: [
        { id: '2', type: 'critical', message: 'Scheduled maintenance overdue', timestamp: '2024-01-08T14:20:00Z' }
      ],
      metrics: {
        hoursOperated: 890,
        fuelUsed: 20300,
        distanceTraveled: 1800,
        jobsCompleted: 28,
        downtime: 45
      }
    },
    {
      id: 3,
      name: 'Crane Liebherr-LTM',
      type: 'Mobile Crane',
      category: 'Lifting Equipment',
      status: 'maintenance',
      location: { lat: 40.6892, lng: -74.0445, address: 'Service Center, Brooklyn' },
      utilization: 0,
      efficiency: 0,
      fuelConsumption: 0,
      operatingCost: 0,
      maintenanceScore: 60,
      nextMaintenance: '2024-01-20',
      alerts: [
        { id: '3', type: 'info', message: 'Undergoing scheduled maintenance', timestamp: '2024-01-05T09:00:00Z' }
      ],
      metrics: {
        hoursOperated: 1580,
        fuelUsed: 24500,
        distanceTraveled: 3200,
        jobsCompleted: 62,
        downtime: 120
      }
    }
  ];

  const mockScenarios: OptimizationScenario[] = [
    {
      id: '1',
      name: 'Route Optimization',
      description: 'Optimize equipment routing to reduce fuel consumption and travel time',
      type: 'route',
      impact: {
        costSavings: 25000,
        utilizationImprovement: 15,
        efficiencyGain: 12,
        timeReduction: 20
      },
      implementation: {
        effort: 'medium',
        timeline: '3 months',
        requirements: ['GPS tracking upgrade', 'Route planning software', 'Driver training'],
        risks: ['Initial productivity dip', 'Driver resistance']
      },
      status: 'recommended',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Predictive Maintenance',
      description: 'Implement AI-driven predictive maintenance to reduce unplanned downtime',
      type: 'maintenance',
      impact: {
        costSavings: 45000,
        utilizationImprovement: 25,
        efficiencyGain: 8,
        timeReduction: 30
      },
      implementation: {
        effort: 'high',
        timeline: '6 months',
        requirements: ['IoT sensors', 'AI platform', 'Maintenance team training'],
        risks: ['High initial investment', 'Technology adoption challenges']
      },
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Fleet Right-sizing',
      description: 'Optimize fleet size based on demand patterns and utilization data',
      type: 'utilization',
      impact: {
        costSavings: 120000,
        utilizationImprovement: 35,
        efficiencyGain: 20,
        timeReduction: 0
      },
      implementation: {
        effort: 'low',
        timeline: '2 months',
        requirements: ['Demand analysis', 'Equipment reallocation', 'Contract adjustments'],
        risks: ['Capacity constraints during peak demand']
      },
      status: 'recommended',
      priority: 'medium'
    }
  ];

  const mockInsights: AIInsight[] = [
    {
      id: '1',
      type: 'prediction',
      title: 'Equipment Failure Prediction',
      description: 'Bulldozer CAT-D8 shows 78% probability of hydraulic system failure within 30 days',
      confidence: 78,
      impact: 'high',
      category: 'Maintenance',
      actionable: true,
      estimatedValue: 15000,
      timeline: '30 days'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Utilization Optimization',
      description: 'Crane Liebherr-LTM has 40% idle time that could be allocated to pending projects',
      confidence: 92,
      impact: 'medium',
      category: 'Operations',
      actionable: true,
      estimatedValue: 8500,
      timeline: '1 week'
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Fuel Consumption Spike',
      description: 'Excavator CAT-320 fuel consumption increased 25% above normal in the last week',
      confidence: 95,
      impact: 'medium',
      category: 'Efficiency',
      actionable: true,
      estimatedValue: 2500
    }
  ];

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Simulate optimization process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setOptimizationProgress(i);
    }

    setIsOptimizing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-yellow-600 bg-yellow-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      case 'transit': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredFleet = mockFleet.filter(equipment => {
    const statusMatch = filterStatus === 'all' || equipment.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || equipment.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Mock performance data
  const performanceData = [
    { month: 'Jan', utilization: 75, efficiency: 82, cost: 45000 },
    { month: 'Feb', utilization: 78, efficiency: 85, cost: 42000 },
    { month: 'Mar', utilization: 82, efficiency: 88, cost: 38000 },
    { month: 'Apr', utilization: 85, efficiency: 90, cost: 35000 },
    { month: 'May', utilization: 88, efficiency: 92, cost: 32000 },
    { month: 'Jun', utilization: 85, efficiency: 89, cost: 36000 }
  ];

  const utilizationDistribution = [
    { range: '0-20%', count: 2, color: '#ef4444' },
    { range: '21-40%', count: 5, color: '#f59e0b' },
    { range: '41-60%', count: 8, color: '#eab308' },
    { range: '61-80%', count: 12, color: '#22c55e' },
    { range: '81-100%', count: 15, color: '#10b981' }
  ];

  return (
    <AppLayout>
      <Head title="Fleet Optimization" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-8 w-8 text-blue-600" />
              Fleet Optimization
            </h1>
            <p className="text-muted-foreground">AI-powered fleet management and optimization platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={runOptimization} disabled={isOptimizing}>
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Fleet Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Equipment</p>
                  <p className="text-2xl font-bold">{mockFleet.length}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {mockFleet.filter(e => e.status === 'active').length} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Utilization</p>
                  <p className="text-2xl font-bold">76%</p>
                </div>
                <Gauge className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Progress value={76} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Operating Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(125000)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">-8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+5% improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Banner */}
        {showAIInsights && mockInsights.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Insights</span>
                  <Badge variant="secondary">{mockInsights.length} new</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAIInsights(false)}>
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                    {insight.estimatedValue && (
                      <div className="text-xs font-medium text-green-600">
                        Potential value: {formatCurrency(insight.estimatedValue)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimization Progress */}
        {isOptimizing && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Running Fleet Optimization</span>
                <span className="text-sm">{optimizationProgress}%</span>
              </div>
              <Progress value={optimizationProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing fleet data and generating optimization recommendations...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fleet">Fleet View</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="utilization"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        stroke="#3b82f6"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" opacity={0.7} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Utilization Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={utilizationDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={(entry) => entry.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Fleet Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {mockFleet.filter(e => e.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {mockFleet.filter(e => e.status === 'idle').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Idle</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {mockFleet.filter(e => e.status === 'maintenance').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Maintenance</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {mockFleet.filter(e => e.status === 'transit').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Transit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            {/* Fleet Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input placeholder="Search equipment..." className="max-w-sm" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="transit">Transit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Heavy Equipment">Heavy Equipment</SelectItem>
                      <SelectItem value="Lifting Equipment">Lifting Equipment</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fleet Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFleet.map((equipment) => (
                <Card key={equipment.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedEquipment(equipment)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{equipment.name}</CardTitle>
                      <Badge className={getStatusColor(equipment.status)}>
                        {equipment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{equipment.type}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Utilization:</span>
                        <span className="font-medium">{equipment.utilization}%</span>
                      </div>
                      <Progress value={equipment.utilization} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Efficiency:</span>
                        <span className="font-medium">{equipment.efficiency}%</span>
                      </div>
                      <Progress value={equipment.efficiency} className="h-2" />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <div className="font-medium truncate">{equipment.location.address}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operator:</span>
                          <div className="font-medium">{equipment.operator || 'Unassigned'}</div>
                        </div>
                      </div>

                      {equipment.alerts.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            <span>{equipment.alerts.length} alert(s)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            {/* Optimization Scenarios */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockScenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`p-3 border rounded cursor-pointer transition-all ${
                          selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedScenario(scenario)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{scenario.name}</span>
                          <Badge variant={scenario.priority === 'high' ? 'destructive' :
                                        scenario.priority === 'medium' ? 'default' : 'secondary'}>
                            {scenario.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                        <div className="text-xs">
                          <span className="font-medium text-green-600">
                            Savings: {formatCurrency(scenario.impact.costSavings)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Details */}
              {selectedScenario && (
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedScenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{selectedScenario.description}</p>

                        {/* Impact Metrics */}
                        <div>
                          <h4 className="font-medium mb-3">Expected Impact</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(selectedScenario.impact.costSavings)}
                              </div>
                              <div className="text-sm text-muted-foreground">Cost Savings</div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-lg font-bold text-blue-600">
                                +{selectedScenario.impact.utilizationImprovement}%
                              </div>
                              <div className="text-sm text-muted-foreground">Utilization</div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-lg font-bold text-purple-600">
                                +{selectedScenario.impact.efficiencyGain}%
                              </div>
                              <div className="text-sm text-muted-foreground">Efficiency</div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-lg font-bold text-orange-600">
                                -{selectedScenario.impact.timeReduction}%
                              </div>
                              <div className="text-sm text-muted-foreground">Time Reduction</div>
                            </div>
                          </div>
                        </div>

                        {/* Implementation Details */}
                        <div>
                          <h4 className="font-medium mb-3">Implementation</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Effort Level:</span>
                              <Badge variant={selectedScenario.implementation.effort === 'high' ? 'destructive' :
                                            selectedScenario.implementation.effort === 'medium' ? 'default' : 'secondary'}>
                                {selectedScenario.implementation.effort}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Timeline:</span>
                              <span className="text-sm font-medium">{selectedScenario.implementation.timeline}</span>
                            </div>

                            <div>
                              <span className="text-sm font-medium">Requirements:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {selectedScenario.implementation.requirements.map((req, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <span className="text-sm font-medium">Risks:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {selectedScenario.implementation.risks.map((risk, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1">
                            <Play className="h-4 w-4 mr-2" />
                            Implement Scenario
                          </Button>
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Fleet Performance Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { subject: 'Utilization', A: 85, B: 90, fullMark: 100 },
                      { subject: 'Efficiency', A: 78, B: 85, fullMark: 100 },
                      { subject: 'Reliability', A: 92, B: 88, fullMark: 100 },
                      { subject: 'Safety', A: 88, B: 95, fullMark: 100 },
                      { subject: 'Cost Control', A: 75, B: 80, fullMark: 100 },
                      { subject: 'Maintenance', A: 82, B: 85, fullMark: 100 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Radar name="Target" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Efficiency vs Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={mockFleet.map(e => ({
                      utilization: e.utilization,
                      efficiency: e.efficiency,
                      name: e.name
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="utilization" name="Utilization" unit="%" />
                      <YAxis dataKey="efficiency" name="Efficiency" unit="%" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="efficiency" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(450000)}</div>
                    <div className="text-sm text-muted-foreground">Total Operating Cost</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(85000)}</div>
                    <div className="text-sm text-muted-foreground">Fuel Costs</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(125000)}</div>
                    <div className="text-sm text-muted-foreground">Maintenance Costs</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(240000)}</div>
                    <div className="text-sm text-muted-foreground">Labor Costs</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Insights Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockInsights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {getInsightIcon(insight.type)}
                        {insight.title}
                      </CardTitle>
                      <Badge variant={insight.impact === 'high' ? 'destructive' :
                                    insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{insight.description}</p>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Confidence Level:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={insight.confidence} className="w-20 h-2" />
                          <span className="text-sm">{insight.confidence}%</span>
                        </div>
                      </div>

                      {insight.estimatedValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Estimated Value:</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(insight.estimatedValue)}
                          </span>
                        </div>
                      )}

                      {insight.timeline && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Timeline:</span>
                          <span className="text-sm">{insight.timeline}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>

                      {insight.actionable && (
                        <Button className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Take Action
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Insight Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insight Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-muted-foreground">Predictions</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-muted-foreground">Anomalies</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-muted-foreground">Opportunities</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FleetOptimization;

















