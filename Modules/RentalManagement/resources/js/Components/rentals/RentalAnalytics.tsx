import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Activity,
  AlertCircle,
  Clock,
  DollarSign,
  Gauge,
  Heart,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Wrench,
  CloudSun,
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

interface RentalAnalyticsProps {
  rental: any;
  maintenanceRecords?: any[];
  weatherData?: any;
  metrics?: {
    rentalEfficiency?: number;
    profitMargin?: number;
    equipmentUtilization?: number;
  };
}

export default function RentalAnalytics({
  rental,
  maintenanceRecords = [],
  weatherData,
  metrics = {
    rentalEfficiency: 85,
    profitMargin: 40,
    equipmentUtilization: 75
  }
}: RentalAnalyticsProps) {
  const { t } = useTranslation('rental');

  const { rentalEfficiency = 85, profitMargin = 40, equipmentUtilization = 75 } = metrics;

  // Calculate equipment health metrics
  const calculateEquipmentHealth = () => {
    const totalEquipment = rental.rentalItems?.length || 0;
    const maintenanceRequired = maintenanceRecords.filter(record =>
      record.status === 'pending' || record.status === 'in_progress'
    ).length;

    return {
      healthScore: totalEquipment ? Math.round(((totalEquipment - maintenanceRequired) / totalEquipment) * 100) : 100,
      maintenanceRequired,
      totalEquipment
    };
  };

  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const totalRevenue = rental.total_amount || 0;
    const totalCosts = (rental.subtotal || 0) * 0.6; // Assuming 60% cost structure
    const profit = totalRevenue - totalCosts;

    return {
      totalRevenue,
      totalCosts,
      profit,
      roi: totalCosts ? Math.round((profit / totalCosts) * 100) : 0
    };
  };

  // Calculate operational metrics
  const calculateOperationalMetrics = () => {
    if (!rental.start_date) {
      return {
        totalDays: 0,
        completedDays: 0,
        progressPercentage: 0
      };
    }

    const startDate = new Date(rental.start_date);
    const endDate = rental.actual_end_date ? new Date(rental.actual_end_date) :
                    rental.expected_end_date ? new Date(rental.expected_end_date) : new Date();
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const completedDays = Math.max(0, Math.min(totalDays, Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))));

    return {
      totalDays,
      completedDays,
      progressPercentage: Math.round((completedDays / totalDays) * 100)
    };
  };

  const equipmentHealth = calculateEquipmentHealth();
  const financialMetrics = calculateFinancialMetrics();
  const operationalMetrics = calculateOperationalMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Equipment Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('ttl_equipment_health')}</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{equipmentHealth.healthScore}%</div>
            <Badge variant={equipmentHealth.healthScore > 80 ? "default" : equipmentHealth.healthScore > 60 ? "secondary" : "destructive"}>
              {equipmentHealth.healthScore > 80 ? "Healthy" : equipmentHealth.healthScore > 60 ? "Fair" : "Critical"}
            </Badge>
          </div>
          <Progress value={equipmentHealth.healthScore} className="mt-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {equipmentHealth.maintenanceRequired} of {equipmentHealth.totalEquipment} equipment need maintenance
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('ttl_financial_performance')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.profit)}</div>
            <Badge variant={financialMetrics.roi > 20 ? "default" : financialMetrics.roi > 10 ? "secondary" : "destructive"}>
              {financialMetrics.roi}% ROI
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Revenue: {formatCurrency(financialMetrics.totalRevenue)}
          </div>
          <div className="text-xs text-muted-foreground">
            Costs: {formatCurrency(financialMetrics.totalCosts)}
          </div>
        </CardContent>
      </Card>

      {/* Operational Efficiency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('ttl_operational_efficiency')}</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{rentalEfficiency}%</div>
            <Badge variant={rentalEfficiency > 80 ? "default" : rentalEfficiency > 60 ? "secondary" : "destructive"}>
              {rentalEfficiency > 80 ? "High" : rentalEfficiency > 60 ? "Medium" : "Low"}
            </Badge>
          </div>
          <Progress value={rentalEfficiency} className="mt-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            Equipment Utilization: {equipmentUtilization}%
          </div>
        </CardContent>
      </Card>

      {/* Rental Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('rental_progress')}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{operationalMetrics.progressPercentage}%</div>
            <Badge variant="outline">
              {operationalMetrics.completedDays}/{operationalMetrics.totalDays} days
            </Badge>
          </div>
          <Progress value={operationalMetrics.progressPercentage} className="mt-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {operationalMetrics.totalDays - operationalMetrics.completedDays} days remaining
          </div>
        </CardContent>
      </Card>

      {/* Weather Impact */}
      {weatherData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('ttl_weather_impact')}</CardTitle>
            <CloudSun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
              <Badge variant={weatherData.temperature > 35 ? "destructive" : weatherData.temperature > 25 ? "secondary" : "default"}>
                {weatherData.conditions}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Humidity: {weatherData.humidity}%
            </div>
            <div className="text-xs text-muted-foreground">
              Wind: {weatherData.wind_speed} km/h
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Status */}
      {maintenanceRecords.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('ttl_maintenance_status')}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {maintenanceRecords.filter(r => r.status === 'completed').length}/{maintenanceRecords.length}
              </div>
              <Badge variant={maintenanceRecords.some(r => r.status === 'critical') ? "destructive" : "default"}>
                {maintenanceRecords.some(r => r.status === 'critical') ? "Critical" : "Normal"}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {maintenanceRecords.filter(r => r.status === 'pending').length} pending tasks
            </div>
            <div className="text-xs text-muted-foreground">
              {maintenanceRecords.filter(r => r.status === 'in_progress').length} in progress
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


