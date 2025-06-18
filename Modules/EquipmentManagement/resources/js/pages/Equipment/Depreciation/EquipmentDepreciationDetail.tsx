import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DepreciationReport,
  ValuationHistory
} from '../../../types/DepreciationTypes';
import DepreciationTrackingService from '../../../services/DepreciationTrackingService';
import {
  Clock,
  DollarSign,
  AlertTriangle,
  Banknote,
  Calculator,
  BarChart,
  ArrowLeftRight,
  ChevronLeft
} from 'lucide-react';

// Custom LineChart wrapper component to maintain compatibility with existing code
interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  yAxisWidth?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  categories,
  index,
  colors,
  valueFormatter,
  showLegend = true,
  yAxisWidth = 40
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

const EquipmentDepreciationDetail: React.FC = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const [report, setReport] = useState<DepreciationReport | null>(null);
  const [valuationHistory, setValuationHistory] = useState<ValuationHistory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const id = parseInt(equipmentId || '0');

        if (id <= 0) {
          setError('Invalid equipment ID');
          return;
        }

        const reportData = await DepreciationTrackingService.getDepreciationReport(id);
        const valuationData = await DepreciationTrackingService.getValuationHistory(id);

        setReport(reportData);
        setValuationHistory(valuationData);
        setError(null);
      } catch (err) {
        console.error('Error fetching depreciation data:', err);
        setError('Failed to load equipment depreciation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipmentId]);

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <AppLayout title="Equipment Depreciation">
        <Head title="Equipment Depreciation" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Equipment Depreciation">
        <Head title="Equipment Depreciation" />
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout title="Equipment Depreciation">
        <Head title="Equipment Depreciation" />
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>No depreciation data found for this equipment.</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { equipment, has_depreciation, error: reportError } = report;

  // Generate the schedule chart data
  const scheduleChartData = report.depreciation_schedule?.map(item => ({
    year: `Year ${item.year}`,
    'Book Value': item.book_value,
    'Depreciation': item.depreciation_amount,
  })) || [];

  return (
    <AppLayout title={`${equipment.name} - Depreciation`}>
      <Head title={`${equipment.name} - Depreciation`} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/equipment">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Equipment
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{equipment.name} - Depreciation</h1>
            {report.current_status?.is_fully_depreciated && (
              <Badge variant="destructive">Fully Depreciated</Badge>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              Recalculate Value
            </Button>
            <Button size="sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Record Valuation
            </Button>
          </div>
        </div>

        {!has_depreciation && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Depreciation Setup</AlertTitle>
            <AlertDescription>
              This equipment does not have depreciation tracking set up.
              <Button variant="link" className="p-0 h-auto text-amber-600">
                Click here to set up depreciation
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {has_depreciation && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(report.current_status?.current_value)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    As of {formatDate(report.current_status?.last_update)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Depreciation
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      report.depreciation_details?.initial_value && report.current_status?.current_value
                        ? report.depreciation_details.initial_value - report.current_status.current_value
                        : undefined
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report.depreciation_details?.initial_value && report.current_status?.current_value
                      ? formatPercent(
                          ((report.depreciation_details.initial_value - report.current_status.current_value) /
                           report.depreciation_details.initial_value) * 100
                        )
                      : 'N/A'
                    } of original value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Remaining Life
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {report.current_status?.remaining_useful_life?.toFixed(1) || 'N/A'} years
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report.current_status?.is_fully_depreciated
                      ? 'Fully depreciated'
                      : `Until ${formatDate(
                          report.depreciation_details?.start_date
                            ? new Date(
                                new Date(report.depreciation_details.start_date).getTime() +
                                (report.depreciation_details.useful_life_years * 365.25 * 24 * 60 * 60 * 1000)
                              ).toISOString()
                            : undefined
                        )}`
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Depreciation Schedule</TabsTrigger>
                <TabsTrigger value="valuation">Valuation History</TabsTrigger>
                <TabsTrigger value="replacement">Replacement Planning</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Depreciation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Method</dt>
                          <dd className="text-sm font-medium">
                            {report.depreciation_details?.method === 'straight_line'
                              ? 'Straight Line'
                              : report.depreciation_details?.method === 'double_declining'
                                ? 'Double Declining Balance'
                                : report.depreciation_details?.method === 'sum_of_years_digits'
                                  ? 'Sum of Years Digits'
                                  : report.depreciation_details?.method === 'units_of_production'
                                    ? 'Units of Production'
                                    : report.depreciation_details?.method || 'N/A'
                            }
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Initial Value</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(report.depreciation_details?.initial_value)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Residual Value</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(report.depreciation_details?.residual_value)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Useful Life</dt>
                          <dd className="text-sm font-medium">
                            {report.depreciation_details?.useful_life_years} years
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                          <dd className="text-sm font-medium">
                            {formatDate(report.depreciation_details?.start_date)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Annual Depreciation</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(report.depreciation_details?.annual_depreciation_amount)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Annual Rate</dt>
                          <dd className="text-sm font-medium">
                            {formatPercent(report.depreciation_details?.annual_depreciation_rate || 0 * 100)}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Current Book Value</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(report.current_status?.current_value)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Accumulated Depreciation</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(
                              report.depreciation_details?.initial_value && report.current_status?.current_value
                                ? report.depreciation_details.initial_value - report.current_status.current_value
                                : undefined
                            )}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Depreciation Rate</dt>
                          <dd className="text-sm font-medium">
                            {report.depreciation_details?.initial_value && report.current_status?.current_value
                              ? formatPercent(
                                  ((report.depreciation_details.initial_value - report.current_status.current_value) /
                                   report.depreciation_details.initial_value) * 100
                                )
                              : 'N/A'
                            }
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                          <dd className="text-sm font-medium">
                            <Badge variant={report.current_status?.is_fully_depreciated ? "destructive" : "secondary"}>
                              {report.current_status?.is_fully_depreciated ? 'Fully Depreciated' : 'Active'}
                            </Badge>
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Remaining Useful Life</dt>
                          <dd className="text-sm font-medium">
                            {report.current_status?.remaining_useful_life?.toFixed(1) || 'N/A'} years
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-muted-foreground">Last Update</dt>
                          <dd className="text-sm font-medium">
                            {formatDate(report.current_status?.last_update)}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                {report.valuation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Latest Valuation</CardTitle>
                      <CardDescription>
                        Last appraisal or valuation of this equipment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-1.5">
                          <span className="text-sm font-medium text-muted-foreground">Valuation Date</span>
                          <span className="text-sm font-medium">
                            {formatDate(report.valuation.latest_valuation_date)}
                          </span>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <span className="text-sm font-medium text-muted-foreground">Valuation Amount</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(report.valuation.latest_valuation_amount)}
                          </span>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <span className="text-sm font-medium text-muted-foreground">Book-to-Market Ratio</span>
                          <span className="text-sm font-medium">
                            {report.valuation.book_to_market_ratio?.toFixed(2) || 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col space-y-1.5 md:col-span-3">
                          <span className="text-sm font-medium text-muted-foreground">Valuation Method</span>
                          <span className="text-sm font-medium">
                            {report.valuation.valuation_method === 'market_comparison'
                              ? 'Market Comparison Approach'
                              : report.valuation.valuation_method === 'cost_approach'
                                ? 'Cost Approach'
                                : report.valuation.valuation_method === 'income_approach'
                                  ? 'Income Approach'
                                  : report.valuation.valuation_method === 'age_life'
                                    ? 'Age-Life Method'
                                    : report.valuation.valuation_method === 'expert_opinion'
                                      ? 'Expert Opinion'
                                      : report.valuation.valuation_method || 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Depreciation Schedule</CardTitle>
                    <CardDescription>
                      Projected depreciation over the useful life of the equipment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div style={{ height: '300px' }} className="mb-6">
                      <LineChart
                        data={scheduleChartData}
                        categories={['Book Value', 'Depreciation']}
                        index="year"
                        colors={['#3B82F6', '#F97316']}
                        valueFormatter={(value) => formatCurrency(value)}
                        showLegend={true}
                        yAxisWidth={70}
                      />
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Starting Value</TableHead>
                          <TableHead>Depreciation</TableHead>
                          <TableHead>Ending Value</TableHead>
                          <TableHead>Accum. Depreciation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.depreciation_schedule?.map((item) => (
                          <TableRow key={item.year}>
                            <TableCell>Year {item.year}</TableCell>
                            <TableCell>{formatDate(item.start_date)}</TableCell>
                            <TableCell>{formatDate(item.end_date)}</TableCell>
                            <TableCell>{formatCurrency(item.starting_value)}</TableCell>
                            <TableCell>{formatCurrency(item.depreciation_amount)}</TableCell>
                            <TableCell>{formatCurrency(item.ending_value)}</TableCell>
                            <TableCell>{formatCurrency(item.accumulated_depreciation)}</TableCell>
                          </TableRow>
                        ))}
                        {(!report.depreciation_schedule || report.depreciation_schedule.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                              No depreciation schedule available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="valuation" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Valuation History</CardTitle>
                      <CardDescription>
                        Record of all valuations and appraisals for this equipment
                      </CardDescription>
                    </div>
                    <Button>
                      <Banknote className="h-4 w-4 mr-2" />
                      Add Valuation
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Appraiser</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {valuationHistory?.valuations.map((valuation) => (
                          <TableRow key={valuation.id}>
                            <TableCell>{formatDate(valuation.valuation_date)}</TableCell>
                            <TableCell>{formatCurrency(valuation.valuation_amount)}</TableCell>
                            <TableCell>
                              {valuation.valuation_method === 'market_comparison'
                                ? 'Market Comparison'
                                : valuation.valuation_method === 'cost_approach'
                                  ? 'Cost Approach'
                                  : valuation.valuation_method === 'income_approach'
                                    ? 'Income Approach'
                                    : valuation.valuation_method === 'age_life'
                                      ? 'Age-Life Method'
                                      : valuation.valuation_method === 'expert_opinion'
                                        ? 'Expert Opinion'
                                        : valuation.valuation_method
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {valuation.valuation_type === 'appraisal'
                                  ? 'Professional Appraisal'
                                  : valuation.valuation_type === 'market_estimation'
                                    ? 'Market Estimation'
                                    : valuation.valuation_type === 'internal_assessment'
                                      ? 'Internal Assessment'
                                      : valuation.valuation_type
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>{valuation.appraiser_name || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                        {(!valuationHistory?.valuations || valuationHistory.valuations.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                              No valuation history available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="replacement" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Replacement Planning</CardTitle>
                    <CardDescription>
                      Details about when this equipment should be replaced
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Replacement Status
                            </CardTitle>
                            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center space-x-2">
                              <Badge variant={report.replacement_planning?.should_consider_replacement ? "destructive" : "secondary"}>
                                {report.replacement_planning?.should_consider_replacement
                                  ? 'Consider Replacement'
                                  : 'No Replacement Needed'
                                }
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Replacement Cost
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {formatCurrency(report.replacement_planning?.replacement_cost_estimate)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Estimated cost to replace
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Expected Replacement Date
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-xl font-bold">
                              {report.replacement_planning?.expected_replacement_date
                                ? formatDate(report.replacement_planning.expected_replacement_date)
                                : 'Not scheduled'
                              }
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {report.current_status?.remaining_useful_life !== undefined &&
                               report.current_status.remaining_useful_life > 0
                                ? `Approximately ${report.current_status.remaining_useful_life.toFixed(1)} years remaining`
                                : 'Based on useful life calculation'
                              }
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Replacement Recommendations</h3>
                        <ul className="space-y-3">
                          {report.replacement_planning?.should_consider_replacement ? (
                            <>
                              <li className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm">
                                  This equipment has {
                                    report.current_status?.is_fully_depreciated
                                      ? 'reached the end of its useful life and is fully depreciated.'
                                      : `approximately ${report.current_status?.remaining_useful_life?.toFixed(1)} years of useful life remaining.`
                                  }
                                </span>
                              </li>
                              <li className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm">
                                  The current book value is {formatCurrency(report.current_status?.current_value)} compared to
                                  the original value of {formatCurrency(report.depreciation_details?.initial_value)}.
                                </span>
                              </li>
                              <li className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm">
                                  Consider budgeting {formatCurrency(report.replacement_planning.replacement_cost_estimate)} for replacement.
                                </span>
                              </li>
                            </>
                          ) : (
                            <li className="flex items-start">
                              <Clock className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">
                                This equipment is still within its useful life period. No immediate replacement is needed.
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default EquipmentDepreciationDetail;
