import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DepreciationSummary,
  EquipmentNeedingReplacement
} from '../../../types/DepreciationTypes';
import DepreciationTrackingService from '../../../services/DepreciationTrackingService';
import FinancialSummaryCard from './components/FinancialSummaryCard';
import EquipmentCountsCard from './components/EquipmentCountsCard';
import ReplacementNeedsTable from './components/ReplacementNeedsTable';
import DepreciationByCategoryChart from './components/DepreciationByCategoryChart';
import AssetValueTrendChart from './components/AssetValueTrendChart';
import CategorySummaryTable from './components/CategorySummaryTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AlertTriangle, TrendingDown, Calculator, Clock, BarChart } from 'lucide-react';

const DepreciationDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DepreciationSummary | null>(null);
  const [replacementNeeds, setReplacementNeeds] = useState<EquipmentNeedingReplacement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summaryData = await DepreciationTrackingService.getFleetDepreciationSummary();
        const replacementData = await DepreciationTrackingService.getEquipmentNeedingReplacement();

        setSummary(summaryData);
        setReplacementNeeds(replacementData);
        setError(null);
      } catch (err) {
        console.error('Error fetching depreciation data:', err);
        setError('Failed to load depreciation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <AppLayout title="Depreciation Dashboard">
        <Head title="Depreciation Dashboard" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Depreciation Dashboard">
        <Head title="Depreciation Dashboard" />
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Depreciation Dashboard">
      <Head title="Depreciation Dashboard" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Depreciation Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline">Export Report</Button>
            <Button>Run Depreciation Update</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="replacement">Replacement Planning</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FinancialSummaryCard summary={summary.financial_summary} />
                  <EquipmentCountsCard counts={summary.equipment_counts} />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset Value Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '300px' }}>
                      <DepreciationByCategoryChart categories={summary.category_summary} />
                    </div>
                  </CardContent>
                </Card>

                {summary.replacement_needs && summary.replacement_needs.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Equipment Needing Replacement</CardTitle>
                      <Badge variant="destructive">
                        {summary.equipment_counts.needing_replacement} Items
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <ReplacementNeedsTable
                        replacementNeeds={summary.replacement_needs.slice(0, 5)}
                        formatCurrency={formatCurrency}
                      />
                      {summary.replacement_needs.length > 5 && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="link"
                            onClick={() => setActiveTab('replacement')}
                          >
                            View all {summary.replacement_needs.length} items
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {summary && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategorySummaryTable
                      categories={summary.category_summary}
                      formatCurrency={formatCurrency}
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Depreciation by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: '300px' }}>
                        {/* <PieChart
                          data={summary.category_summary.map(cat => ({
                            name: cat.category_name,
                            value: cat.depreciation
                          }))}
                          dataKey="value"
                        /> */}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Distribution by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: '300px' }}>
                        {/* <PieChart
                          data={summary.category_summary.map(cat => ({
                            name: cat.category_name,
                            value: cat.current_value
                          }))}
                          dataKey="value"
                        /> */}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="replacement" className="space-y-6">
            {replacementNeeds && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Items Needing Replacement
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{replacementNeeds.count}</div>
                      <p className="text-xs text-muted-foreground">
                        Equipment items requiring replacement
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Replacement Cost
                      </CardTitle>
                      <Calculator className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          replacementNeeds.equipment.reduce((sum, item) => sum + item.replacement_cost, 0)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Estimated cost to replace all items
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg. Remaining Life
                      </CardTitle>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {replacementNeeds.equipment.length > 0
                          ? (replacementNeeds.equipment.reduce((sum, item) => sum + item.remaining_life, 0) /
                             replacementNeeds.equipment.length).toFixed(1)
                          : 'N/A'
                        } years
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average remaining useful life
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Requiring Replacement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead>Replacement Cost</TableHead>
                          <TableHead>Remaining Life</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {replacementNeeds.equipment.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{new Date(item.purchase_date).toLocaleDateString()}</TableCell>
                            <TableCell>{formatCurrency(item.current_value)}</TableCell>
                            <TableCell>{formatCurrency(item.replacement_cost)}</TableCell>
                            <TableCell>{item.remaining_life.toFixed(1)} years</TableCell>
                            <TableCell>
                              <Badge variant={item.is_fully_depreciated ? "destructive" : "warning"}>
                                {item.is_fully_depreciated ? 'Fully Depreciated' : 'Approaching End of Life'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {summary && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Value Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '350px' }}>
                      <AssetValueTrendChart />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recently Depreciated Equipment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summary.recently_depreciated && summary.recently_depreciated.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Last Update</TableHead>
                              <TableHead>Current Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {summary.recently_depreciated.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{new Date(item.last_update).toLocaleDateString()}</TableCell>
                                <TableCell>{formatCurrency(item.current_value)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No recently depreciated equipment
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Depreciation Rate Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex flex-col space-y-2">
                          <div className="text-sm font-medium">Current Fleet Depreciation Rate</div>
                          <div className="text-3xl font-bold">
                            {formatPercent(summary.financial_summary.depreciation_rate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Average percentage of asset value depreciated
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Average Remaining Useful Life</div>
                          <div className="text-3xl font-bold">
                            {summary.financial_summary.average_remaining_life.toFixed(1)} years
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Average remaining life across all equipment
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DepreciationDashboard;
