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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
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
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Wrench,
  Users,
  Building,
  Truck,
  Calendar,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  Receipt,
  FileText,
  Activity,
  Zap,
  Shield,
  Award,
  Lightbulb,
  Brain
} from 'lucide-react';
import { formatCurrency, formatPercentage } from "@/utils/format";

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  subcategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

interface EquipmentCost {
  id: number;
  name: string;
  type: string;
  category: string;
  totalCost: number;
  operatingCost: number;
  maintenanceCost: number;
  fuelCost: number;
  laborCost: number;
  depreciationCost: number;
  insuranceCost: number;
  costPerHour: number;
  costPerProject: number;
  utilizationRate: number;
  efficiency: number;
  roi: number;
  paybackPeriod: number;
  monthlyTrend: {
    month: string;
    cost: number;
    budget: number;
    variance: number;
  }[];
}

interface CostOptimization {
  id: string;
  title: string;
  description: string;
  category: 'fuel' | 'maintenance' | 'labor' | 'depreciation' | 'insurance' | 'operations';
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    investment: number;
    paybackPeriod: string;
  };
  impact: 'high' | 'medium' | 'low';
  status: 'identified' | 'planned' | 'in_progress' | 'completed';
}

interface BudgetAnalysis {
  period: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  forecast: number;
  categories: {
    name: string;
    budgeted: number;
    actual: number;
    variance: number;
  }[];
}

interface Props {
  equipmentCosts: EquipmentCost[];
  costBreakdown: CostBreakdown[];
  optimizations: CostOptimization[];
  budgetAnalysis: BudgetAnalysis;
}

const CostAnalysis: React.FC<Props> = ({
  equipmentCosts = [],
  costBreakdown = [],
  optimizations = [],
  budgetAnalysis
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentCost | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'comparison'>('summary');
  const [showBudgetVariance, setShowBudgetVariance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date} | undefined>();

  // Mock data
  const mockCostBreakdown: CostBreakdown[] = [
    {
      category: 'Fuel & Energy',
      amount: 125000,
      percentage: 28,
      trend: 'up',
      trendValue: 8.5,
      subcategories: [
        { name: 'Diesel Fuel', amount: 85000, percentage: 68 },
        { name: 'Electricity', amount: 25000, percentage: 20 },
        { name: 'Hydraulic Fluid', amount: 15000, percentage: 12 }
      ]
    },
    {
      category: 'Maintenance & Repairs',
      amount: 95000,
      percentage: 21,
      trend: 'down',
      trendValue: -5.2,
      subcategories: [
        { name: 'Scheduled Maintenance', amount: 55000, percentage: 58 },
        { name: 'Emergency Repairs', amount: 25000, percentage: 26 },
        { name: 'Parts & Components', amount: 15000, percentage: 16 }
      ]
    },
    {
      category: 'Labor Costs',
      amount: 110000,
      percentage: 25,
      trend: 'up',
      trendValue: 3.8,
      subcategories: [
        { name: 'Operator Wages', amount: 75000, percentage: 68 },
        { name: 'Maintenance Staff', amount: 25000, percentage: 23 },
        { name: 'Overtime', amount: 10000, percentage: 9 }
      ]
    },
    {
      category: 'Depreciation',
      amount: 65000,
      percentage: 15,
      trend: 'stable',
      trendValue: 0.5,
      subcategories: [
        { name: 'Equipment Depreciation', amount: 50000, percentage: 77 },
        { name: 'Technology Depreciation', amount: 15000, percentage: 23 }
      ]
    },
    {
      category: 'Insurance & Compliance',
      amount: 45000,
      percentage: 10,
      trend: 'up',
      trendValue: 2.1,
      subcategories: [
        { name: 'Equipment Insurance', amount: 30000, percentage: 67 },
        { name: 'Liability Insurance', amount: 10000, percentage: 22 },
        { name: 'Compliance Costs', amount: 5000, percentage: 11 }
      ]
    }
  ];

  const mockEquipmentCosts: EquipmentCost[] = [
    {
      id: 1,
      name: 'Excavator CAT-320',
      type: 'Excavator',
      category: 'Heavy Equipment',
      totalCost: 85000,
      operatingCost: 45000,
      maintenanceCost: 15000,
      fuelCost: 18000,
      laborCost: 25000,
      depreciationCost: 12000,
      insuranceCost: 8000,
      costPerHour: 125,
      costPerProject: 8500,
      utilizationRate: 85,
      efficiency: 92,
      roi: 15.8,
      paybackPeriod: 3.2,
      monthlyTrend: [
        { month: 'Jan', cost: 7200, budget: 7500, variance: -300 },
        { month: 'Feb', cost: 7800, budget: 7500, variance: 300 },
        { month: 'Mar', cost: 7100, budget: 7500, variance: -400 },
        { month: 'Apr', cost: 7600, budget: 7500, variance: 100 },
        { month: 'May', cost: 7900, budget: 7500, variance: 400 },
        { month: 'Jun', cost: 7300, budget: 7500, variance: -200 }
      ]
    },
    {
      id: 2,
      name: 'Bulldozer CAT-D8',
      type: 'Bulldozer',
      category: 'Heavy Equipment',
      totalCost: 125000,
      operatingCost: 65000,
      maintenanceCost: 25000,
      fuelCost: 28000,
      laborCost: 35000,
      depreciationCost: 18000,
      insuranceCost: 12000,
      costPerHour: 180,
      costPerProject: 12500,
      utilizationRate: 68,
      efficiency: 78,
      roi: 12.3,
      paybackPeriod: 4.1,
      monthlyTrend: [
        { month: 'Jan', cost: 10200, budget: 10000, variance: 200 },
        { month: 'Feb', cost: 10800, budget: 10000, variance: 800 },
        { month: 'Mar', cost: 9800, budget: 10000, variance: -200 },
        { month: 'Apr', cost: 10500, budget: 10000, variance: 500 },
        { month: 'May', cost: 11200, budget: 10000, variance: 1200 },
        { month: 'Jun', cost: 10100, budget: 10000, variance: 100 }
      ]
    },
    {
      id: 3,
      name: 'Crane Liebherr-LTM',
      type: 'Mobile Crane',
      category: 'Lifting Equipment',
      totalCost: 95000,
      operatingCost: 50000,
      maintenanceCost: 20000,
      fuelCost: 22000,
      laborCost: 28000,
      depreciationCost: 15000,
      insuranceCost: 10000,
      costPerHour: 155,
      costPerProject: 9500,
      utilizationRate: 75,
      efficiency: 85,
      roi: 18.5,
      paybackPeriod: 2.8,
      monthlyTrend: [
        { month: 'Jan', cost: 8200, budget: 8000, variance: 200 },
        { month: 'Feb', cost: 8500, budget: 8000, variance: 500 },
        { month: 'Mar', cost: 7800, budget: 8000, variance: -200 },
        { month: 'Apr', cost: 8300, budget: 8000, variance: 300 },
        { month: 'May', cost: 8700, budget: 8000, variance: 700 },
        { month: 'Jun', cost: 8100, budget: 8000, variance: 100 }
      ]
    }
  ];

  const mockOptimizations: CostOptimization[] = [
    {
      id: '1',
      title: 'Fuel Efficiency Program',
      description: 'Implement driver training and route optimization to reduce fuel consumption by 15%',
      category: 'fuel',
      currentCost: 125000,
      optimizedCost: 106250,
      savings: 18750,
      savingsPercentage: 15,
      implementation: {
        effort: 'medium',
        timeline: '3 months',
        investment: 5000,
        paybackPeriod: '3.2 months'
      },
      impact: 'high',
      status: 'identified'
    },
    {
      id: '2',
      title: 'Predictive Maintenance',
      description: 'Reduce unplanned maintenance costs through predictive analytics and IoT monitoring',
      category: 'maintenance',
      currentCost: 95000,
      optimizedCost: 76000,
      savings: 19000,
      savingsPercentage: 20,
      implementation: {
        effort: 'high',
        timeline: '6 months',
        investment: 25000,
        paybackPeriod: '15.8 months'
      },
      impact: 'high',
      status: 'planned'
    },
    {
      id: '3',
      title: 'Insurance Optimization',
      description: 'Negotiate better rates and optimize coverage based on actual risk assessment',
      category: 'insurance',
      currentCost: 45000,
      optimizedCost: 38250,
      savings: 6750,
      savingsPercentage: 15,
      implementation: {
        effort: 'low',
        timeline: '1 month',
        investment: 1000,
        paybackPeriod: '1.8 months'
      },
      impact: 'medium',
      status: 'in_progress'
    },
    {
      id: '4',
      title: 'Labor Optimization',
      description: 'Optimize crew scheduling and reduce overtime through better planning',
      category: 'labor',
      currentCost: 110000,
      optimizedCost: 99000,
      savings: 11000,
      savingsPercentage: 10,
      implementation: {
        effort: 'medium',
        timeline: '2 months',
        investment: 3000,
        paybackPeriod: '3.3 months'
      },
      impact: 'medium',
      status: 'identified'
    }
  ];

  const mockBudgetAnalysis: BudgetAnalysis = {
    period: 'Q2 2024',
    budgeted: 450000,
    actual: 485000,
    variance: 35000,
    variancePercentage: 7.8,
    forecast: 520000,
    categories: [
      { name: 'Fuel & Energy', budgeted: 120000, actual: 125000, variance: 5000 },
      { name: 'Maintenance', budgeted: 90000, actual: 95000, variance: 5000 },
      { name: 'Labor', budgeted: 105000, actual: 110000, variance: 5000 },
      { name: 'Depreciation', budgeted: 65000, actual: 65000, variance: 0 },
      { name: 'Insurance', budgeted: 45000, actual: 45000, variance: 0 },
      { name: 'Other', budgeted: 25000, actual: 45000, variance: 20000 }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'labor': return <Users className="h-4 w-4" />;
      case 'depreciation': return <TrendingDown className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'operations': return <Activity className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'text-blue-600 bg-blue-100';
      case 'planned': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalSavings = mockOptimizations.reduce((sum, opt) => sum + opt.savings, 0);
  const totalCurrentCost = mockCostBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <AdminLayout>
      <Head title="Cost Analysis" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="h-8 w-8 text-green-600" />
              Cost Analysis
            </h1>
            <p className="text-muted-foreground">Comprehensive financial analysis and cost optimization insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCurrentCost)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">+5.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <Percent className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">{formatPercentage((totalSavings / totalCurrentCost) * 100)} reduction</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Variance</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(mockBudgetAnalysis.variance)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">{formatPercentage(mockBudgetAnalysis.variancePercentage)} over budget</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost per Hour</p>
                  <p className="text-2xl font-bold">{formatCurrency(153)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">-2.8% improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Costs</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cost Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Cost Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockCostBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {mockCostBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <TrendingUp className="h-5 w-5" />
                    Cost Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Jan', total: 42000, fuel: 12000, maintenance: 8000, labor: 15000 },
                      { month: 'Feb', total: 45000, fuel: 13000, maintenance: 9000, labor: 16000 },
                      { month: 'Mar', total: 43000, fuel: 12500, maintenance: 8500, labor: 15500 },
                      { month: 'Apr', total: 47000, fuel: 14000, maintenance: 10000, labor: 17000 },
                      { month: 'May', total: 49000, fuel: 15000, maintenance: 11000, labor: 18000 },
                      { month: 'Jun', total: 46000, fuel: 13500, maintenance: 9500, labor: 16500 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} />
                      <Line type="monotone" dataKey="fuel" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="labor" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(153)}</div>
                    <div className="text-sm text-muted-foreground">Cost per Hour</div>
                    <div className="text-xs text-green-500 mt-1">-2.8%</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(9500)}</div>
                    <div className="text-sm text-muted-foreground">Cost per Project</div>
                    <div className="text-xs text-green-500 mt-1">-5.2%</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-orange-600">76%</div>
                    <div className="text-sm text-muted-foreground">Utilization Rate</div>
                    <div className="text-xs text-green-500 mt-1">+3.1%</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">15.5%</div>
                    <div className="text-sm text-muted-foreground">Average ROI</div>
                    <div className="text-xs text-green-500 mt-1">+1.8%</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-red-600">3.4</div>
                    <div className="text-sm text-muted-foreground">Payback Period (years)</div>
                    <div className="text-xs text-green-500 mt-1">-0.3</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-teal-600">87%</div>
                    <div className="text-sm text-muted-foreground">Efficiency Score</div>
                    <div className="text-xs text-green-500 mt-1">+4.2%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            {/* Detailed Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockCostBreakdown.map((category, index) => (
                <Card key={category.category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(category.trend)}
                        <span className={`text-sm font-medium ${
                          category.trend === 'up' ? 'text-red-500' :
                          category.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {category.trend === 'up' ? '+' : category.trend === 'down' ? '-' : ''}
                          {Math.abs(category.trendValue)}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">{formatCurrency(category.amount)}</span>
                        <Badge variant="outline">{category.percentage}% of total</Badge>
                      </div>

                      <div className="space-y-2">
                        {category.subcategories.map((sub) => (
                          <div key={sub.name} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{sub.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(sub.amount)}</span>
                              <span className="text-xs text-muted-foreground">({sub.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cost Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Cost Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={[
                    { month: 'Jan', fuel: 12000, maintenance: 8000, labor: 15000, total: 42000 },
                    { month: 'Feb', fuel: 13000, maintenance: 9000, labor: 16000, total: 45000 },
                    { month: 'Mar', fuel: 12500, maintenance: 8500, labor: 15500, total: 43000 },
                    { month: 'Apr', fuel: 14000, maintenance: 10000, labor: 17000, total: 47000 },
                    { month: 'May', fuel: 15000, maintenance: 11000, labor: 18000, total: 49000 },
                    { month: 'Jun', fuel: 13500, maintenance: 9500, labor: 16500, total: 46000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="fuel" stackId="a" fill="#10b981" />
                    <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="labor" stackId="a" fill="#ef4444" />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            {/* Equipment Cost Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Equipment Cost Analysis
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Heavy Equipment">Heavy Equipment</SelectItem>
                        <SelectItem value="Lifting Equipment">Lifting Equipment</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEquipmentCosts.map((equipment) => (
                    <Card key={equipment.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedEquipment(equipment)}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <h3 className="font-semibold">{equipment.name}</h3>
                            <p className="text-sm text-muted-foreground">{equipment.type}</p>
                            <Badge variant="outline" className="mt-1">{equipment.category}</Badge>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold">{formatCurrency(equipment.totalCost)}</div>
                            <div className="text-xs text-muted-foreground">Total Cost</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{formatCurrency(equipment.costPerHour)}</div>
                            <div className="text-xs text-muted-foreground">Cost/Hour</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{equipment.utilizationRate}%</div>
                            <div className="text-xs text-muted-foreground">Utilization</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{equipment.roi}%</div>
                            <div className="text-xs text-muted-foreground">ROI</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Detail Modal */}
            {selectedEquipment && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedEquipment.name} - Detailed Cost Analysis</CardTitle>
                    <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cost Breakdown */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Cost Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Operating Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.operatingCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.maintenanceCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.fuelCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.laborCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Depreciation:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.depreciationCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance:</span>
                          <span className="font-medium">{formatCurrency(selectedEquipment.insuranceCost)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedEquipment.totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Trend */}
                    <div>
                      <h4 className="font-medium mb-4">Monthly Cost Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={selectedEquipment.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            {/* Optimization Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOptimizations.map((optimization) => (
                      <div key={optimization.id} className="p-4 border rounded hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(optimization.category)}
                            <span className="font-medium">{optimization.title}</span>
                          </div>
                          <Badge className={getStatusColor(optimization.status)}>
                            {optimization.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{optimization.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Cost:</span>
                            <div className="font-medium">{formatCurrency(optimization.currentCost)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Optimized Cost:</span>
                            <div className="font-medium text-green-600">{formatCurrency(optimization.optimizedCost)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Savings:</span>
                            <div className="font-bold text-green-600">{formatCurrency(optimization.savings)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Savings %:</span>
                            <div className="font-bold text-green-600">{optimization.savingsPercentage}%</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Effort: {optimization.implementation.effort}</span>
                            <span>Timeline: {optimization.implementation.timeline}</span>
                            <span>Payback: {optimization.implementation.paybackPeriod}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Optimization Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Total Savings Potential */}
                    <div className="text-center p-6 border rounded bg-green-50">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(totalSavings)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Savings Potential</div>
                      <div className="text-lg font-medium text-green-600 mt-1">
                        {formatPercentage((totalSavings / totalCurrentCost) * 100)} reduction
                      </div>
                    </div>

                    {/* Savings by Category */}
                    <div>
                      <h4 className="font-medium mb-3">Savings by Category</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={mockOptimizations.map(opt => ({
                          category: opt.category,
                          savings: opt.savings,
                          percentage: opt.savingsPercentage
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="savings" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Implementation Timeline */}
                    <div>
                      <h4 className="font-medium mb-3">Implementation Priority</h4>
                      <div className="space-y-2">
                        {mockOptimizations
                          .sort((a, b) => b.savings - a.savings)
                          .map((opt, index) => (
                          <div key={opt.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="text-sm">{opt.title}</span>
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(opt.savings)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            {/* Budget vs Actual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Budget Analysis - {mockBudgetAnalysis.period}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(mockBudgetAnalysis.budgeted)}</div>
                    <div className="text-sm text-muted-foreground">Budgeted</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(mockBudgetAnalysis.actual)}</div>
                    <div className="text-sm text-muted-foreground">Actual</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(mockBudgetAnalysis.variance)}</div>
                    <div className="text-sm text-muted-foreground">Variance</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(mockBudgetAnalysis.forecast)}</div>
                    <div className="text-sm text-muted-foreground">Forecast</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockBudgetAnalysis.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#f59e0b" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Variance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Budget Variance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockBudgetAnalysis.categories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Budget: {formatCurrency(category.budgeted)} | Actual: {formatCurrency(category.actual)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          category.variance > 0 ? 'text-red-600' : category.variance < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                        </div>
                        <div className={`text-sm ${
                          category.variance > 0 ? 'text-red-500' : category.variance < 0 ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {formatPercentage((category.variance / category.budgeted) * 100)}
                        </div>
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

export default CostAnalysis;

















