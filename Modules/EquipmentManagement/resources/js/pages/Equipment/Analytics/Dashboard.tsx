import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/Modules/Core/resources/js';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Modules/Core/resources/js/components/ui/tabs';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Settings,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/Modules/Core/resources/js/utils/format';

interface EquipmentAnalytics {
  totalEquipment: number;
  activeEquipment: number;
  maintenanceDue: number;
  totalValue: number;
  utilizationRate: number;
  maintenanceCosts: number;
  revenueGenerated: number;
  efficiencyScore: number;
  utilizationTrend: Array<{
    date: string;
    utilization: number;
    revenue: number;
    maintenanceCost: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
    utilization: number;
  }>;
  maintenanceSchedule: Array<{
    equipmentName: string;
    dueDate: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
  }>;
  performanceMetrics: Array<{
    equipmentId: number;
    name: string;
    efficiency: number;
    uptime: number;
    costPerHour: number;
    revenuePerHour: number;
  }>;
  predictiveInsights: Array<{
    type: 'maintenance' | 'replacement' | 'optimization';
    equipment: string;
    prediction: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    recommendedAction: string;
  }>;
}

interface Props {
  analytics: EquipmentAnalytics;
}

const EquipmentAnalyticsDashboard: React.FC<Props> = ({ analytics }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Handle undefined analytics prop
  if (!analytics) {
    return (
      <AdminLayout>
        <Head title="Equipment Analytics Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900">Loading analytics...</div>
            <div className="text-sm text-gray-500">Please wait while we fetch the data.</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <AdminLayout>
      <Head title="Equipment Analytics Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Analytics</h1>
            <p className="text-muted-foreground">Advanced insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEquipment}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeEquipment} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Asset portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.utilizationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all equipment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.efficiencyScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall performance rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Utilization Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Utilization & Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.utilizationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="utilization"
                        stroke="#8884d8"
                        name="Utilization %"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#82ca9d"
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipment by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analytics.revenueGenerated)}
                    </div>
                    <p className="text-sm text-muted-foreground">Revenue Generated</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(analytics.maintenanceCosts)}
                    </div>
                    <p className="text-sm text-muted-foreground">Maintenance Costs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(analytics.revenueGenerated - analytics.maintenanceCosts)}
                    </div>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performanceMetrics.map((equipment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">ID: {equipment.equipmentId}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">{equipment.efficiency}%</div>
                          <p className="text-xs text-muted-foreground">Efficiency</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{equipment.uptime}%</div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{formatCurrency(equipment.costPerHour)}</div>
                          <p className="text-xs text-muted-foreground">Cost/Hour</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{formatCurrency(equipment.revenuePerHour)}</div>
                          <p className="text-xs text-muted-foreground">Revenue/Hour</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.maintenanceSchedule.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                          {item.priority}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{item.equipmentName}</h4>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.dueDate}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.estimatedCost)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.predictiveInsights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                            {insight.type}
                          </Badge>
                          <span className="font-medium">{insight.equipment}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {insight.confidence}% confidence
                        </div>
                      </div>
                      <p className="text-sm mb-2">{insight.prediction}</p>
                      <div className="text-sm text-blue-600 font-medium">
                        Recommended: {insight.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EquipmentAnalyticsDashboard;

















