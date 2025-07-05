import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { Button } from "@/Core";
import { Progress } from "@/Core";
import { Alert, AlertDescription } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
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
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Shield,
  Cpu
} from 'lucide-react';
import { formatCurrency } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Equipment {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  operatingHours: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceScore: number;
  failureRisk: 'low' | 'medium' | 'high' | 'critical';
  predictedFailureDate?: string;
  maintenanceCost: number;
  downtimeCost: number;
}

interface MaintenancePrediction {
  equipmentId: number;
  component: string;
  failureProbability: number;
  predictedFailureDate: string;
  recommendedAction: string;
  confidenceLevel: number;
  costImpact: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

interface HealthMetric {
  name: string;
  current: number;
  threshold: number;
  trend: 'improving' | 'stable' | 'degrading';
  impact: number;
}

interface MaintenanceRecommendation {
  id: number;
  equipmentId: number;
  type: 'preventive' | 'predictive' | 'corrective';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  estimatedDuration: number;
  potentialSavings: number;
  scheduledDate?: string;
  assignedTechnician?: string;
}

interface Props {
  equipment: Equipment[];
  predictions: MaintenancePrediction[];
  recommendations: MaintenanceRecommendation[];
}

const PredictiveMaintenance: React.FC<Props> = ({
  equipment = [],
  predictions = [],
  recommendations = []
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(equipment[0] || null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30'); // days
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    if (selectedEquipment) {
      setHealthMetrics([
        {
          name: 'Engine Health',
          current: 85,
          threshold: 80,
          trend: 'degrading',
          impact: 0.8
        },
        {
          name: 'Hydraulic System',
          current: 92,
          threshold: 85,
          trend: 'stable',
          impact: 0.6
        },
        {
          name: 'Transmission',
          current: 78,
          threshold: 75,
          trend: 'degrading',
          impact: 0.9
        },
        {
          name: 'Electrical System',
          current: 95,
          threshold: 90,
          trend: 'improving',
          impact: 0.4
        },
        {
          name: 'Cooling System',
          current: 88,
          threshold: 85,
          trend: 'stable',
          impact: 0.5
        }
      ]);
    }
  }, [selectedEquipment]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const scheduleMaintenanceTask = (recommendationId: number) => {
    // Implementation for scheduling maintenance
    console.log('Scheduling maintenance for recommendation:', recommendationId);
  };

  // Mock data for charts
  const failureRiskData = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 30, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#F97316' },
    { name: 'Critical Risk', value: 5, color: '#EF4444' }
  ];

  const maintenanceTrendData = Array.from({ length: 12 }, (_, i) => ({
    month: formatDateMedium(new Date(2024, i, 1)),
    preventive: Math.floor(Math.random() * 20) + 10,
    predictive: Math.floor(Math.random() * 15) + 5,
    corrective: Math.floor(Math.random() * 10) + 2,
    cost: Math.floor(Math.random() * 50000) + 20000
  }));

  const healthScoreData = healthMetrics.map(metric => ({
    name: metric.name,
    score: metric.current,
    threshold: metric.threshold,
    impact: metric.impact * 100
  }));

  return (
    <AppLayout>
      <Head title="Predictive Maintenance" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Predictive Maintenance
            </h1>
            <p className="text-muted-foreground">AI-powered maintenance predictions and recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runPredictiveAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipment Monitored</p>
                  <p className="text-2xl font-bold">{equipment.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Predictions</p>
                  <p className="text-2xl font-bold">{predictions.length}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Actions</p>
                  <p className="text-2xl font-bold">{recommendations.length}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold">{formatCurrency(125000)}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="predictions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
                <TabsTrigger value="health">Health Monitoring</TabsTrigger>
                <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="predictions">
                <Card>
                  <CardHeader>
                    <CardTitle>Failure Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No predictions available. Run AI analysis to generate predictions.</p>
                        </div>
                      ) : (
                        predictions.map((prediction, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{prediction.component}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Equipment: {equipment.find(eq => eq.id === prediction.equipmentId)?.name}
                                </p>
                              </div>
                              <Badge className={getPriorityColor(prediction.priority)}>
                                {prediction.priority}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-medium">Failure Probability</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={prediction.failureProbability} className="flex-1" />
                                  <span className="text-sm">{prediction.failureProbability}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Confidence Level</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={prediction.confidenceLevel} className="flex-1" />
                                  <span className="text-sm">{prediction.confidenceLevel}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm"><strong>Predicted Failure:</strong> {prediction.predictedFailureDate}</p>
                              <p className="text-sm"><strong>Recommended Action:</strong> {prediction.recommendedAction}</p>
                              <p className="text-sm"><strong>Cost Impact:</strong> {formatCurrency(prediction.costImpact)}</p>
                              <div className="text-sm">
                                <strong>Key Factors:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {prediction.factors.map((factor, i) => (
                                    <li key={i}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Health Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Equipment Selector */}
                      <div>
                        <Label htmlFor="equipment-select">Select Equipment</Label>
                        <select
                          id="equipment-select"
                          className="w-full mt-1 p-2 border rounded-md"
                          value={selectedEquipment?.id || ''}
                          onChange={(e) => {
                            const eq = equipment.find(eq => eq.id === parseInt(e.target.value));
                            setSelectedEquipment(eq || null);
                          }}
                        >
                          {equipment.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.name}</option>
                          ))}
                        </select>
                      </div>

                      {selectedEquipment && (
                        <>
                          {/* Health Score Chart */}
                          <div>
                            <h4 className="text-lg font-medium mb-4">Component Health Scores</h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={healthScoreData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="score" fill="#3B82F6" />
                                <Bar dataKey="threshold" fill="#EF4444" opacity={0.3} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Health Metrics */}
                          <div>
                            <h4 className="text-lg font-medium mb-4">Detailed Health Metrics</h4>
                            <div className="space-y-3">
                              {healthMetrics.map((metric, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{metric.name}</span>
                                    <div className="flex items-center gap-2">
                                      {getTrendIcon(metric.trend)}
                                      <span className="text-sm capitalize">{metric.trend}</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Current Score</p>
                                      <p className="font-medium">{metric.current}%</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Threshold</p>
                                      <p className="font-medium">{metric.threshold}%</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Impact Level</p>
                                      <p className="font-medium">{(metric.impact * 100).toFixed(0)}%</p>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <Progress
                                      value={metric.current}
                                      className={`h-2 ${metric.current < metric.threshold ? 'bg-red-100' : 'bg-green-100'}`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Trends & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Maintenance Trend Chart */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Maintenance Activities Trend</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={maintenanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="preventive" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="predictive" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="corrective" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Risk Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-medium mb-4">Failure Risk Distribution</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={failureRiskData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                              >
                                {failureRiskData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium mb-4">Cost Analysis</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={maintenanceTrendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(value as number)} />
                              <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Recommendations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No pending recommendations</p>
                    </div>
                  ) : (
                    recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getPriorityColor(rec.urgency)}>
                            {rec.urgency}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{rec.type}</span>
                        </div>

                        <p className="text-sm font-medium mb-2">{rec.description}</p>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Cost: {formatCurrency(rec.estimatedCost)}</div>
                          <div>Duration: {rec.estimatedDuration}h</div>
                          <div>Savings: {formatCurrency(rec.potentialSavings)}</div>
                          {rec.scheduledDate && (
                            <div>Scheduled: {rec.scheduledDate}</div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => scheduleMaintenanceTask(rec.id)}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PredictiveMaintenance;

















