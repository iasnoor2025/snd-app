/**
 * Mobile Analytics Component
 * Touch-optimized analytics dashboard with charts and insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    activeRentals: number;
    customerCount: number;
    revenueChange: number;
    bookingsChange: number;
    utilizationRate: number;
  };
  charts: {
    revenueChart: Array<{ date: string; revenue: number; bookings: number }>;
    categoryChart: Array<{ category: string; revenue: number; bookings: number; color: string }>;
    locationChart: Array<{ location: string; bookings: number; revenue: number }>;
    timeChart: Array<{ hour: number; bookings: number }>;
  };
  insights: Array<{
    id: string;
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    value?: string;
    trend?: number;
  }>;
  topEquipment: Array<{
    id: string;
    name: string;
    category: string;
    bookings: number;
    revenue: number;
    utilizationRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'booking' | 'return' | 'maintenance' | 'payment';
    description: string;
    timestamp: string;
    amount?: number;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

interface MobileAnalyticsProps {
  data?: AnalyticsData;
  onRefresh?: () => void;
  onExport?: (format: string) => void;
  className?: string;
}

const MobileAnalytics: React.FC<MobileAnalyticsProps> = ({
  data,
  onRefresh,
  onExport,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { isOnline } = usePWA();
  const { t } = useTranslation(['common', 'analytics']);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    overview: {
      totalRevenue: 45280,
      totalBookings: 156,
      activeRentals: 23,
      customerCount: 89,
      revenueChange: 12.5,
      bookingsChange: -3.2,
      utilizationRate: 78.5
    },
    charts: {
      revenueChart: [
        { date: '2024-01-01', revenue: 5200, bookings: 18 },
        { date: '2024-01-02', revenue: 6800, bookings: 22 },
        { date: '2024-01-03', revenue: 4900, bookings: 16 },
        { date: '2024-01-04', revenue: 7200, bookings: 25 },
        { date: '2024-01-05', revenue: 6100, bookings: 20 },
        { date: '2024-01-06', revenue: 8300, bookings: 28 },
        { date: '2024-01-07', revenue: 6700, bookings: 23 }
      ],
      categoryChart: [
        { category: 'Construction', revenue: 18500, bookings: 45, color: '#3b82f6' },
        { category: 'Landscaping', revenue: 12300, bookings: 38, color: '#10b981' },
        { category: 'Events', revenue: 8900, bookings: 28, color: '#f59e0b' },
        { category: 'Moving', revenue: 5580, bookings: 22, color: '#ef4444' }
      ],
      locationChart: [
        { location: 'Downtown', bookings: 45, revenue: 15200 },
        { location: 'North Side', bookings: 38, revenue: 12800 },
        { location: 'South Side', bookings: 32, revenue: 10500 },
        { location: 'West End', bookings: 28, revenue: 9200 },
        { location: 'East Side', bookings: 13, revenue: 4300 }
      ],
      timeChart: [
        { hour: 8, bookings: 12 },
        { hour: 9, bookings: 18 },
        { hour: 10, bookings: 25 },
        { hour: 11, bookings: 22 },
        { hour: 12, bookings: 15 },
        { hour: 13, bookings: 20 },
        { hour: 14, bookings: 28 },
        { hour: 15, bookings: 24 },
        { hour: 16, bookings: 19 },
        { hour: 17, bookings: 16 }
      ]
    },
    insights: [
      {
        id: '1',
        type: 'positive',
        title: 'Revenue Growth',
        description: 'Revenue increased by 12.5% compared to last period',
        value: '+$4,850',
        trend: 12.5
      },
      {
        id: '2',
        type: 'negative',
        title: 'Booking Decline',
        description: 'Bookings decreased by 3.2% this week',
        value: '-5 bookings',
        trend: -3.2
      },
      {
        id: '3',
        type: 'positive',
        title: 'High Utilization',
        description: 'Equipment utilization rate is above target',
        value: '78.5%',
        trend: 5.2
      }
    ],
    topEquipment: [
      {
        id: '1',
        name: 'Excavator CAT 320',
        category: 'Construction',
        bookings: 12,
        revenue: 8400,
        utilizationRate: 85.2
      },
      {
        id: '2',
        name: 'Forklift Toyota 8FGU25',
        category: 'Warehouse',
        bookings: 8,
        revenue: 3200,
        utilizationRate: 72.1
      },
      {
        id: '3',
        name: 'Generator Caterpillar XQ60',
        category: 'Power',
        bookings: 6,
        revenue: 2800,
        utilizationRate: 68.5
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'booking',
        description: 'New booking for Excavator CAT 320',
        timestamp: '2 hours ago',
        amount: 450,
        status: 'completed'
      },
      {
        id: '2',
        type: 'payment',
        description: 'Payment received from John Smith',
        timestamp: '4 hours ago',
        amount: 1200,
        status: 'completed'
      },
      {
        id: '3',
        type: 'return',
        description: 'Equipment returned - Forklift Toyota',
        timestamp: '6 hours ago',
        status: 'completed'
      },
      {
        id: '4',
        type: 'maintenance',
        description: 'Scheduled maintenance for Generator',
        timestamp: '1 day ago',
        status: 'pending'
      }
    ]
  };

  const analyticsData = data || mockData;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'return': return <Package className="h-4 w-4" />;
      case 'maintenance': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics:revenue', 'Revenue')}</p>
                <p className="text-lg font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {analyticsData.overview.revenueChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${
                    analyticsData.overview.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analyticsData.overview.revenueChange)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics:bookings', 'Bookings')}</p>
                <p className="text-lg font-bold">{analyticsData.overview.totalBookings}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {analyticsData.overview.bookingsChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${
                    analyticsData.overview.bookingsChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analyticsData.overview.bookingsChange)}
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics:active_rentals', 'Active Rentals')}</p>
                <p className="text-lg font-bold">{analyticsData.overview.activeRentals}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('analytics:currently_rented', 'Currently rented')}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('analytics:customers', 'Customers')}</p>
                <p className="text-lg font-bold">{analyticsData.overview.customerCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('analytics:total_customers', 'Total customers')}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{t('analytics:equipment_utilization', 'Equipment Utilization')}</p>
            <span className="text-sm font-bold">{analyticsData.overview.utilizationRate}%</span>
          </div>
          <Progress value={analyticsData.overview.utilizationRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {t('analytics:utilization_target', 'Target: 75% • Current: {{rate}}%', { rate: analyticsData.overview.utilizationRate })}
          </p>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('analytics:key_insights', 'Key Insights')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {analyticsData.insights.map((insight) => (
            <div key={insight.id} className="flex items-start space-x-3">
              <div className={`mt-0.5 ${
                insight.type === 'positive' ? 'text-green-600' :
                insight.type === 'negative' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {insight.type === 'positive' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : insight.type === 'negative' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
                {insight.value && (
                  <p className={`text-xs font-medium mt-1 ${
                    insight.type === 'positive' ? 'text-green-600' :
                    insight.type === 'negative' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {insight.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderChartsTab = () => (
    <div className="space-y-4">
      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('analytics:revenue_trend', 'Revenue Trend')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32 flex items-end justify-between space-x-1">
            {analyticsData.charts.revenueChart.map((item, index) => {
              const maxRevenue = Math.max(...analyticsData.charts.revenueChart.map(d => d.revenue));
              const height = (item.revenue / maxRevenue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).getDate()}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{t('analytics:days_ago', '7 days ago')}</span>
            <span>{t('analytics:today', 'Today')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {analyticsData.charts.categoryChart.map((category) => {
            const maxRevenue = Math.max(...analyticsData.charts.categoryChart.map(c => c.revenue));
            const percentage = (category.revenue / maxRevenue) * 100;

            return (
              <div key={category.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8">
                    {category.bookings}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Location Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Locations</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {analyticsData.charts.locationChart.slice(0, 5).map((location, index) => (
            <div key={location.location} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{location.location}</p>
                  <p className="text-xs text-muted-foreground">{location.bookings} bookings</p>
                </div>
              </div>
              <span className="text-sm font-medium">{formatCurrency(location.revenue)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderEquipmentTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Performing Equipment</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {analyticsData.topEquipment.map((equipment, index) => (
            <div key={equipment.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    <h4 className="text-sm font-medium">{equipment.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{equipment.category}</p>
                </div>
                <Badge variant="outline">{equipment.bookings} bookings</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-medium">{formatCurrency(equipment.revenue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Utilization</p>
                  <p className="font-medium">{equipment.utilizationRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="mt-2">
                <Progress value={equipment.utilizationRate} className="h-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {analyticsData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="mt-0.5 text-muted-foreground">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-xs font-medium">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`mobile-analytics ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">{t('analytics:title', 'Analytics')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('analytics:last_updated', 'Last updated: {{time}}', { time: lastUpdated.toLocaleTimeString() })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">{t('analytics:today', 'Today')}</SelectItem>
                <SelectItem value="7d">{t('analytics:7_days', '7 Days')}</SelectItem>
                <SelectItem value="30d">{t('analytics:30_days', '30 Days')}</SelectItem>
                <SelectItem value="90d">{t('analytics:90_days', '90 Days')}</SelectItem>
              </SelectContent>
            </Select>

            {onExport && (
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 className="h-4 w-4 mr-1" />
              {t('analytics:overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">
              <PieChart className="h-4 w-4 mr-1" />
              {t('analytics:charts', 'Charts')}
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              {t('analytics:equipment', 'Equipment')}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="h-4 w-4 mr-1" />
              {t('analytics:activity', 'Activity')}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="overview" className="mt-0">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="charts" className="mt-0">
              {renderChartsTab()}
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              {renderEquipmentTab()}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {renderActivityTab()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileAnalytics;
