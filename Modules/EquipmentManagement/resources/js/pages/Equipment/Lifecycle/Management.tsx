import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Download,
  Upload,
  Settings,
  Wrench,
  Truck,
  Factory,
  Recycle,
  Archive,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Target,
  Award,
  Zap,
  Shield,
  Users,
  MapPin,
  Activity
} from 'lucide-react';
import { formatCurrency } from "@/utils/format";

interface Equipment {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  manufacturer: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  status: 'active' | 'maintenance' | 'retired' | 'disposed';
  location: string;
  assignedTo?: string;
  warrantyExpiry?: string;
  expectedLifespan: number; // in years
  currentAge: number; // in years
  utilizationRate: number; // percentage
  maintenanceCost: number;
  operatingCost: number;
  totalCostOfOwnership: number;
  depreciationRate: number;
  resaleValue: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastInspection?: string;
  nextInspection?: string;
  certifications: string[];
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
}

interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  duration?: number; // in days
  cost: number;
  status: 'completed' | 'active' | 'planned';
  milestones: {
    id: string;
    name: string;
    date: string;
    completed: boolean;
    notes?: string;
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
  }[];
  kpis: {
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }[];
}

interface LifecycleEvent {
  id: string;
  type: 'acquisition' | 'deployment' | 'maintenance' | 'upgrade' | 'relocation' | 'retirement' | 'disposal';
  title: string;
  description: string;
  date: string;
  cost?: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  responsible: string;
  attachments?: string[];
}

interface LifecycleAnalytics {
  totalCostOfOwnership: number;
  depreciationCurve: { year: number; value: number; depreciation: number }[];
  utilizationTrend: { month: string; utilization: number; target: number }[];
  maintenanceCosts: { month: string; planned: number; unplanned: number }[];
  performanceMetrics: {
    availability: number;
    reliability: number;
    efficiency: number;
    safety: number;
  };
  costBreakdown: {
    acquisition: number;
    operation: number;
    maintenance: number;
    disposal: number;
  };
  benchmarks: {
    industryAverage: number;
    bestInClass: number;
    companyAverage: number;
  };
}

interface Props {
  equipment: Equipment;
  lifecycleStages: LifecycleStage[];
  lifecycleEvents: LifecycleEvent[];
  analytics: LifecycleAnalytics;
}

const LifecycleManagement: React.FC<Props> = ({
  equipment,
  lifecycleStages = [],
  lifecycleEvents = [],
  analytics
}) => {
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(lifecycleStages[0] || null);
  const [selectedEvent, setSelectedEvent] = useState<LifecycleEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'1y' | '3y' | '5y' | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockStages: LifecycleStage[] = [
    {
      id: '1',
      name: 'Acquisition',
      description: 'Equipment procurement and initial setup',
      startDate: '2020-01-15',
      endDate: '2020-02-28',
      duration: 44,
      cost: 150000,
      status: 'completed',
      milestones: [
        { id: '1', name: 'Vendor Selection', date: '2020-01-20', completed: true },
        { id: '2', name: 'Purchase Order', date: '2020-01-25', completed: true },
        { id: '3', name: 'Delivery', date: '2020-02-15', completed: true },
        { id: '4', name: 'Installation', date: '2020-02-28', completed: true }
      ],
      documents: [
        { id: '1', name: 'Purchase Agreement', type: 'PDF', uploadDate: '2020-01-25', size: '2.5 MB' },
        { id: '2', name: 'Installation Manual', type: 'PDF', uploadDate: '2020-02-15', size: '15.2 MB' }
      ],
      kpis: [
        { name: 'Time to Deploy', value: 44, target: 30, unit: 'days', trend: 'down' },
        { name: 'Budget Variance', value: -5, target: 0, unit: '%', trend: 'up' }
      ]
    },
    {
      id: '2',
      name: 'Active Operation',
      description: 'Equipment in productive use',
      startDate: '2020-03-01',
      endDate: '2024-12-31',
      duration: 1766,
      cost: 85000,
      status: 'active',
      milestones: [
        { id: '1', name: 'Initial Deployment', date: '2020-03-01', completed: true },
        { id: '2', name: 'First Major Service', date: '2021-03-01', completed: true },
        { id: '3', name: 'Mid-life Upgrade', date: '2022-06-15', completed: true },
        { id: '4', name: 'Performance Review', date: '2024-01-15', completed: false }
      ],
      documents: [
        { id: '1', name: 'Operating Manual', type: 'PDF', uploadDate: '2020-03-01', size: '8.7 MB' },
        { id: '2', name: 'Maintenance Log', type: 'Excel', uploadDate: '2024-01-01', size: '1.2 MB' }
      ],
      kpis: [
        { name: 'Uptime', value: 94.5, target: 95, unit: '%', trend: 'stable' },
        { name: 'Utilization', value: 78, target: 80, unit: '%', trend: 'up' },
        { name: 'Efficiency', value: 87, target: 85, unit: '%', trend: 'up' }
      ]
    },
    {
      id: '3',
      name: 'End of Life',
      description: 'Equipment retirement and disposal planning',
      startDate: '2025-01-01',
      cost: 15000,
      status: 'planned',
      milestones: [
        { id: '1', name: 'Retirement Planning', date: '2024-10-01', completed: false },
        { id: '2', name: 'Asset Valuation', date: '2024-11-01', completed: false },
        { id: '3', name: 'Disposal/Sale', date: '2025-03-01', completed: false }
      ],
      documents: [],
      kpis: [
        { name: 'Resale Value', value: 25000, target: 30000, unit: '$', trend: 'down' },
        { name: 'Disposal Cost', value: 5000, target: 3000, unit: '$', trend: 'up' }
      ]
    }
  ];

  const mockEvents: LifecycleEvent[] = [
    {
      id: '1',
      type: 'acquisition',
      title: 'Equipment Purchased',
      description: 'Heavy-duty excavator acquired from CAT dealer',
      date: '2020-01-25',
      cost: 150000,
      impact: 'high',
      category: 'Procurement',
      responsible: 'John Smith'
    },
    {
      id: '2',
      type: 'deployment',
      title: 'Deployed to Site A',
      description: 'Equipment deployed to construction site for foundation work',
      date: '2020-03-01',
      impact: 'medium',
      category: 'Operations',
      responsible: 'Mike Johnson'
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      description: '500-hour service completed',
      date: '2020-06-15',
      cost: 2500,
      impact: 'low',
      category: 'Maintenance',
      responsible: 'Service Team'
    },
    {
      id: '4',
      type: 'upgrade',
      title: 'GPS System Upgrade',
      description: 'Installed advanced GPS tracking and telematics',
      date: '2022-06-15',
      cost: 8500,
      impact: 'medium',
      category: 'Technology',
      responsible: 'Tech Team'
    }
  ];

  const getStageIcon = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'acquisition': return <Factory className="h-4 w-4" />;
      case 'active operation': return <Activity className="h-4 w-4" />;
      case 'end of life': return <Archive className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'acquisition': return <Factory className="h-4 w-4" />;
      case 'deployment': return <Truck className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'upgrade': return <Zap className="h-4 w-4" />;
      case 'relocation': return <MapPin className="h-4 w-4" />;
      case 'retirement': return <Archive className="h-4 w-4" />;
      case 'disposal': return <Recycle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredEvents = eventFilter === 'all'
    ? mockEvents
    : mockEvents.filter(event => event.type === eventFilter);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <Head title="Equipment Lifecycle Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Lifecycle Management - {equipment.name}
            </h1>
            <p className="text-muted-foreground">Comprehensive equipment lifecycle tracking and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Equipment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(equipment.currentValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">-{equipment.depreciationRate}% this year</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilization Rate</p>
                  <p className="text-2xl font-bold">{equipment.utilizationRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Progress value={equipment.utilizationRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Age / Lifespan</p>
                  <p className="text-2xl font-bold">{equipment.currentAge}/{equipment.expectedLifespan}y</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Progress value={(equipment.currentAge / equipment.expectedLifespan) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className={`text-2xl font-bold capitalize ${getConditionColor(equipment.condition)}`}>
                    {equipment.condition}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Last inspection: {equipment.lastInspection || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Lifecycle Stages</TabsTrigger>
            <TabsTrigger value="events">Events Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="planning">Future Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Lifecycle Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Lifecycle Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStages.map((stage, index) => (
                    <div key={stage.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${
                          stage.status === 'completed' ? 'bg-green-100 text-green-600' :
                          stage.status === 'active' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getStageIcon(stage.name)}
                        </div>
                        {index < mockStages.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{stage.name}</h3>
                          <Badge variant={stage.status === 'completed' ? 'default' :
                                        stage.status === 'active' ? 'secondary' : 'outline'}>
                            {stage.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Start: {new Date(stage.startDate).toLocaleDateString()}</span>
                          {stage.endDate && (
                            <span>End: {new Date(stage.endDate).toLocaleDateString()}</span>
                          )}
                          <span>Cost: {formatCurrency(stage.cost)}</span>
                          {stage.duration && (
                            <span>Duration: {stage.duration} days</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Acquisition', value: analytics.costBreakdown.acquisition },
                          { name: 'Operation', value: analytics.costBreakdown.operation },
                          { name: 'Maintenance', value: analytics.costBreakdown.maintenance },
                          { name: 'Disposal', value: analytics.costBreakdown.disposal }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Availability</span>
                      <span className="text-sm">{analytics.performanceMetrics.availability}%</span>
                    </div>
                    <Progress value={analytics.performanceMetrics.availability} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reliability</span>
                      <span className="text-sm">{analytics.performanceMetrics.reliability}%</span>
                    </div>
                    <Progress value={analytics.performanceMetrics.reliability} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Efficiency</span>
                      <span className="text-sm">{analytics.performanceMetrics.efficiency}%</span>
                    </div>
                    <Progress value={analytics.performanceMetrics.efficiency} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Safety</span>
                      <span className="text-sm">{analytics.performanceMetrics.safety}%</span>
                    </div>
                    <Progress value={analytics.performanceMetrics.safety} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stage List */}
              <Card>
                <CardHeader>
                  <CardTitle>Lifecycle Stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockStages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`p-3 border rounded cursor-pointer transition-all ${
                          selectedStage?.id === stage.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedStage(stage)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStageIcon(stage.name)}
                            <span className="font-medium">{stage.name}</span>
                          </div>
                          <Badge variant={stage.status === 'completed' ? 'default' :
                                        stage.status === 'active' ? 'secondary' : 'outline'}>
                            {stage.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Cost: {formatCurrency(stage.cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stage Details */}
              {selectedStage && (
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStageIcon(selectedStage.name)}
                        {selectedStage.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label className="text-sm font-medium">Start Date</Label>
                          <p className="text-sm">{new Date(selectedStage.startDate).toLocaleDateString()}</p>
                        </div>
                        {selectedStage.endDate && (
                          <div>
                            <Label className="text-sm font-medium">End Date</Label>
                            <p className="text-sm">{new Date(selectedStage.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium">Total Cost</Label>
                          <p className="text-sm">{formatCurrency(selectedStage.cost)}</p>
                        </div>
                        {selectedStage.duration && (
                          <div>
                            <Label className="text-sm font-medium">Duration</Label>
                            <p className="text-sm">{selectedStage.duration} days</p>
                          </div>
                        )}
                      </div>

                      {/* Milestones */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Milestones</h4>
                        <div className="space-y-2">
                          {selectedStage.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-3 p-2 border rounded">
                              {milestone.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <div className="flex-1">
                                <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {milestone.name}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(milestone.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Key Performance Indicators</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedStage.kpis.map((kpi, index) => (
                            <div key={index} className="p-3 border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{kpi.name}</span>
                                {getTrendIcon(kpi.trend)}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">{kpi.value}{kpi.unit}</span>
                                <span className="text-sm text-muted-foreground">Target: {kpi.target}{kpi.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Documents */}
                      {selectedStage.documents.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Documents</h4>
                          <div className="space-y-2">
                            {selectedStage.documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <div>
                                    <span className="text-sm font-medium">{doc.name}</span>
                                    <div className="text-xs text-muted-foreground">
                                      {doc.type} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Event Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input placeholder="Search events..." className="max-w-sm" />
                  </div>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                      <SelectItem value="deployment">Deployment</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="relocation">Relocation</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="disposal">Disposal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded hover:bg-gray-50">
                      <div className="flex flex-col items-center">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          {getEventIcon(event.type)}
                        </div>
                        {index < filteredEvents.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(event.impact)}>
                              {event.impact} impact
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="capitalize">{event.category}</span>
                          <span>By: {event.responsible}</span>
                          {event.cost && (
                            <span>Cost: {formatCurrency(event.cost)}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Depreciation Curve */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Depreciation Curve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.depreciationCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => [
                      name === 'value' ? formatCurrency(value as number) : `${value}%`,
                      name === 'value' ? 'Asset Value' : 'Depreciation Rate'
                    ]} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="depreciation"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Utilization and Maintenance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Utilization Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.utilizationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.maintenanceCosts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="planned" fill="#10b981" />
                      <Bar dataKey="unplanned" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Benchmarks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.benchmarks.companyAverage)}</div>
                    <div className="text-sm text-muted-foreground">Company Average TCO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.benchmarks.industryAverage)}</div>
                    <div className="text-sm text-muted-foreground">Industry Average TCO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.benchmarks.bestInClass)}</div>
                    <div className="text-sm text-muted-foreground">Best in Class TCO</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Retirement Planning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Retirement Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Retirement Recommended</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Based on current condition and utilization trends, retirement is recommended within 12 months.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Estimated Resale Value:</span>
                      <span className="text-sm">{formatCurrency(equipment.resaleValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Disposal Cost:</span>
                      <span className="text-sm">{formatCurrency(5000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Net Recovery:</span>
                      <span className="text-sm font-bold">{formatCurrency(equipment.resaleValue - 5000)}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Retirement Assessment
                  </Button>
                </CardContent>
              </Card>

              {/* Replacement Planning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Replacement Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="replacement-budget">Replacement Budget</Label>
                      <Input id="replacement-budget" placeholder="Enter budget" />
                    </div>
                    <div>
                      <Label htmlFor="replacement-timeline">Target Replacement Date</Label>
                      <Input id="replacement-timeline" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="replacement-requirements">Requirements</Label>
                      <Textarea id="replacement-requirements" placeholder="Specify requirements for replacement equipment" />
                    </div>
                  </div>

                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Replacement Plan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Increase Utilization</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Current utilization is 78%. Increasing to 85% could improve ROI by 12%.
                    </p>
                    <div className="text-sm">
                      <strong>Potential Savings:</strong> {formatCurrency(15000)} annually
                    </div>
                  </div>

                  <div className="p-4 border rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Preventive Maintenance</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Implementing predictive maintenance could reduce unplanned downtime by 30%.
                    </p>
                    <div className="text-sm">
                      <strong>Potential Savings:</strong> {formatCurrency(8500)} annually
                    </div>
                  </div>

                  <div className="p-4 border rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Technology Upgrade</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      IoT sensors and telematics could improve efficiency by 15%.
                    </p>
                    <div className="text-sm">
                      <strong>Investment Required:</strong> {formatCurrency(12000)}
                      <br />
                      <strong>Payback Period:</strong> 18 months
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
};

export default LifecycleManagement;

















