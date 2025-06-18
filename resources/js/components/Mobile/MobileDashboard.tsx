/**
 * Mobile Dashboard Component
 * Touch-optimized dashboard for mobile rental management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import {
  Smartphone,
  Package,
  Calendar,
  DollarSign,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';

interface MobileDashboardProps {
  className?: string;
  user?: any;
  stats?: {
    activeRentals: number;
    pendingBookings: number;
    totalRevenue: number;
    equipmentCount: number;
    maintenanceAlerts: number;
    overdueReturns: number;
  };
  recentActivity?: Array<{
    id: string;
    type: 'rental' | 'booking' | 'maintenance' | 'payment';
    title: string;
    description: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    amount?: number;
  }>;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  className = '',
  user,
  stats = {
    activeRentals: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    equipmentCount: 0,
    maintenanceAlerts: 0,
    overdueReturns: 0
  },
  recentActivity = []
}) => {
  const isMobile = useIsMobile();
  const { isOnline, isStandalone } = usePWA();
  const { t } = useTranslation(['common', 'mobile']);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/v1/mobile/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadNotifications();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rental': return <Package className="h-4 w-4" />;
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'maintenance': return <Truck className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const quickActions = [
    {
      title: t('mobile:new_rental', 'New Rental'),
      description: t('mobile:new_rental_desc', 'Start a new equipment rental'),
      icon: <Plus className="h-6 w-6" />,
      href: '/rentals/create',
      color: 'bg-blue-500'
    },
    {
      title: t('mobile:search_equipment', 'Search Equipment'),
      description: t('mobile:search_equipment_desc', 'Find available equipment'),
      icon: <Search className="h-6 w-6" />,
      href: '/equipment/search',
      color: 'bg-green-500'
    },
    {
      title: t('mobile:my_bookings', 'My Bookings'),
      description: t('mobile:my_bookings_desc', 'View your bookings'),
      icon: <Calendar className="h-6 w-6" />,
      href: '/bookings',
      color: 'bg-purple-500'
    },
    {
      title: t('mobile:maintenance', 'Maintenance'),
      description: t('mobile:maintenance_desc', 'Equipment maintenance'),
      icon: <Truck className="h-6 w-6" />,
      href: '/maintenance',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className={`mobile-dashboard ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-bold">{t('common:app_name', 'SND Rental')}</h1>
            </div>
            {!isOnline && (
              <Badge variant="destructive" className="text-xs">
                {t('common:offline', 'Offline')}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t('mobile:welcome_back', 'Welcome back, {{name}}!', { name: user?.name || t('common:user', 'User') })}
            </CardTitle>
            <CardDescription>
              {isStandalone ? t('mobile:mobile_app', 'Mobile App') : t('mobile:web_app', 'Web App')} • {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mobile:active_rentals', 'Active Rentals')}</p>
                  <p className="text-2xl font-bold">{stats.activeRentals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mobile:bookings', 'Bookings')}</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mobile:revenue', 'Revenue')}</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900">
                  <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mobile:equipment', 'Equipment')}</p>
                  <p className="text-2xl font-bold">{stats.equipmentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.maintenanceAlerts > 0 || stats.overdueReturns > 0) && (
          <div className="space-y-3">
            {stats.maintenanceAlerts > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('mobile:maintenance_alert', '{{count}} equipment items need maintenance', { count: stats.maintenanceAlerts })}
                </AlertDescription>
              </Alert>
            )}
            {stats.overdueReturns > 0 && (
              <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {t('mobile:overdue_alert', '{{count}} rentals are overdue for return', { count: stats.overdueReturns })}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mobile:quick_actions', 'Quick Actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className={`p-3 rounded-lg text-white ${action.color}`}>
                          {action.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('mobile:recent_activity', 'Recent Activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-background">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        {activity.amount && (
                          <p className="text-xs font-medium">${activity.amount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/activity">
                  <Button variant="outline" className="w-full mt-3">
                    {t('mobile:view_all_activity', 'View All Activity')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('mobile:no_recent_activity', 'No recent activity')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDashboard;


