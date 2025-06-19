import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { PageProps } from '@/types';
import { Rental, customer } from '@/types/models';
import { AdminLayout } from '@/Modules/Core/resources/js';

// Shadcn UI components
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/Modules/Core/resources/js/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/Modules/Core/resources/js/components/ui/table';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Separator } from '@/Modules/Core/resources/js/components/ui/separator';
import { Calendar } from '@/Modules/Core/resources/js/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Modules/Core/resources/js/components/ui/popover';
import { Skeleton } from '@/Modules/Core/resources/js/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Modules/Core/resources/js/components/ui/tabs';

// Icons
import {
  CalendarIcon,
  Download,
  RotateCcw,
  Printer,
  ArrowUp,
  ArrowDown,
  Loader2,
  BarChart3,
  List,
  FileText,
  RefreshCw
} from "lucide-react";

interface Props extends PageProps {
  rentals: {
    data: Rental[];
    total: number;
  };
  customers: customer[];
  filters: {
    start_date: string | null;
    end_date: string | null;
    status: string | null;
    client_id: number | null;
  };
}

export default function Report({ auth, rentals, customers, filters }: Props) {
  const { t } = useTranslation('rental');

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.start_date ? parseISO(filters.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.end_date ? parseISO(filters.end_date) : undefined
  );
  const [status, setStatus] = useState<string | undefined>(filters.status || undefined);
  const [clientId, setClientId] = useState<string | undefined>(
    filters.client_id ? String(filters.client_id) : undefined
  );
  const [loadingOp, setLoadingOp] = useState<'none' | 'start-date' | 'end-date' | 'status' | 'customer' | 'filter'>('none');

  // Refs for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced apply filters function
  const debouncedApplyFilters = (params: Record<string, any>, filterType: 'none' | 'start-date' | 'end-date' | 'status' | 'customer' | 'filter') => {
    // Cancel any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Set loading state
    setLoadingOp(filterType);

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      router.get(route('rentals.report'), params, {
        preserveState: true,
        onSuccess: () => setLoadingOp('none'),
        onError: () => setLoadingOp('none'),
      });
    }, 300); // 300ms debounce time
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const generateReport = () => {
    setLoadingOp('filter');

    // Clear any pending debounced requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    router.get(route('rentals.report'), {
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      status: status,
      client_id: clientId ? parseInt(clientId) : null,
    }, {
      preserveState: true,
      onSuccess: () => setLoadingOp('none'),
      onError: () => setLoadingOp('none'),
    });
  };

  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus(undefined);
    setClientId(undefined);

    setLoadingOp('filter');

    // Clear any pending debounced requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    router.get(route('rentals.report'), {}, {
      preserveState: true,
      onSuccess: () => setLoadingOp('none'),
      onError: () => setLoadingOp('none'),
    });
  };

  // Handle date change and apply filter
  const handleDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    // Update state immediately for UI feedback
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    // Prepare filter parameters
    const params = {
      start_date: type === 'start' ? (date ? format(date, 'yyyy-MM-dd') : null) : (startDate ? format(startDate, 'yyyy-MM-dd') : null),
      end_date: type === 'end' ? (date ? format(date, 'yyyy-MM-dd') : null) : (endDate ? format(endDate, 'yyyy-MM-dd') : null),
      status: status,
      client_id: clientId ? parseInt(clientId) : null,
    };

    // Apply with debounce
    debouncedApplyFilters(params, type === 'start' ? 'start-date' : 'end-date');
  };

  // Handle status change and apply filter
  const handleStatusChange = (value: string) => {
    // Update state immediately
    setStatus(value);

    // Prepare filter parameters
    const params = {
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      status: value,
      client_id: clientId ? parseInt(clientId) : null,
    };

    // Apply with debounce
    debouncedApplyFilters(params, 'status');
  };

  // Handle customer change and apply filter
  const handleClientChange = (value: string) => {
    // Update state immediately
    setClientId(value);

    // Prepare filter parameters
    const params = {
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      status: status,
      client_id: value ? parseInt(value) : null,
    };

    // Apply with debounce
    debouncedApplyFilters(params, 'customer');
  };

  const exportReport = () => {
    setLoading(true);

    // Build the export URL with current filters
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.append('end_date', format(endDate, 'yyyy-MM-dd'));
    if (status) params.append('status', status);
    if (clientId) params.append('client_id', clientId);

    // Add export format
    params.append('export', 'csv');

    // Navigate to the export URL
    window.location.href = `${route('rentals.report-export')}?${params.toString()}`;

    // Reset loading after a short delay
    setTimeout(() => setLoading(false), 1000);
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
      case 'active':
        return <Badge variant="default">{status.toUpperCase()}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{status.toUpperCase()}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{status.toUpperCase()}</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  // Calculate summary data with robust type checking and error handling
  const calculateTotalAmount = () => {
    try {
      if (!rentals?.data) return 0;
      return rentals.data.reduce((sum, rental) => {
        // Ensure the total_amount exists and is a valid number
        const amount = (rental.total_amount !== undefined && rental.total_amount !== null)
          ? Number(rental.total_amount)
          : 0;

        // Check if conversion resulted in a valid number
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      return 0;
    }
  };

  const totalAmount = calculateTotalAmount();

  const calculateAverageAmount = () => {
    try {
      if (!rentals?.data?.length) return 0;
      return totalAmount / rentals.data.length;
    } catch (error) {
      return 0;
    }
  };

  const averageAmount = calculateAverageAmount();

  // Rest of the existing calculations
  const averageDuration = rentals?.data?.length > 0
    ? rentals.data.reduce((sum, rental) => {
        const days = (rental.duration_days !== undefined && rental.duration_days !== null)
          ? Number(rental.duration_days)
          : 0;
        return sum + (isNaN(days) ? 0 : days);
      }, 0) / rentals.data.length
    : 0;

  // Count by status
  const statusCounts = rentals?.data ? rentals.data.reduce((counts: Record<string, number>, rental) => {
    // Ensure status exists and is a string
    const status = rental.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {}) : {};

  // Get trend indicator (just as an example - in a real app you might compare with previous period)
  const getTrendIndicator = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (value < threshold) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Helper to get a readable filter summary
  const getFilterSummary = () => {
    const parts = [];

    if (filters.start_date && filters.end_date) {
      parts.push(`${formatDate(filters.start_date)} - ${formatDate(filters.end_date)}`);
    } else if (filters.start_date) {
      parts.push(`From ${formatDate(filters.start_date)}`);
    } else if (filters.end_date) {
      parts.push(`Until ${formatDate(filters.end_date)}`);
    }

    if (filters.status) {
      parts.push(`Status: ${filters.status.toUpperCase()}`);
    }

    if (filters.client_id) {
      const clientName = customers.find(c => c.id === filters.client_id)?.company_name;
      if (clientName) {
        parts.push(`customer: ${clientName}`);
      }
    }

    return parts.length > 0 ? parts.join(' • ') : 'All rentals';
  };

  return (
    <AdminLayout title={t('rental_reports')} breadcrumbs={[
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Rentals', href: '/rentals' },
      { title: 'Reports', href: '/rentals/reports' }
    ]}>
      <Head title={t('rental_reports')} />

      <div className="py-6 print:py-2" id="print-section">
        <div className="container mx-auto print:px-0">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('rental_reports')}</h1>
              <p className="text-muted-foreground">
                {getFilterSummary()}
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="outline"
                onClick={printReport}
                disabled={!rentals?.data?.length || loading}
                size="sm"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={exportReport}
                disabled={!rentals?.data?.length || loading}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Filters Card */}
          <Card className="mb-6 print:hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>{t('configure_report_parameters')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3 lg:gap-4">
                {/* Date Range Start */}
                <div className="w-full sm:w-auto">
                  <Label className="mb-2 block">{t('lbl_start_date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-[160px] pl-3 text-left font-normal justify-start"
                      >
                        {startDate ? (
                          format(startDate, "MMM d, yyyy")
                        ) : (
                          <span className="text-muted-foreground">{t('start_date_4')}</span>
                        )}
                        {loadingOp === 'start-date' ? (
                          <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                        ) : (
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateChange(date, 'start')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date Range End */}
                <div className="w-full sm:w-auto">
                  <Label className="mb-2 block">{t('end_date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-[160px] pl-3 text-left font-normal justify-start"
                      >
                        {endDate ? (
                          format(endDate, "MMM d, yyyy")
                        ) : (
                          <span className="text-muted-foreground">{t('end_date_1')}</span>
                        )}
                        {loadingOp === 'end-date' ? (
                          <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                        ) : (
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateChange(date, 'end')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status */}
                <div className="w-full sm:w-auto">
                  <Label className="mb-2 block">Status</Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      {loadingOp === 'status' ? (
                        <div className="flex items-center">
                          <span className="mr-2">Loading...</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectValue placeholder={t('ph_all_statuses')} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* customer */}
                <div className="w-full sm:w-auto">
                  <Label className="mb-2 block">customer</Label>
                  <Select value={clientId} onValueChange={handleClientChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      {loadingOp === 'customer' ? (
                        <div className="flex items-center">
                          <span className="mr-2">Loading...</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectValue placeholder={t('ph_all_customers')} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateReport}
                  disabled={loadingOp !== 'none'}
                  className="mt-2 sm:mt-0"
                >
                  {loadingOp === 'filter' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Filters"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading || loadingOp !== 'none' ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-[250px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px] mx-auto" />
                        <Skeleton className="h-8 w-[80px] mx-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <>
              {/* Main Content with Tabs */}
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="print:hidden">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="data">
                    <List className="h-4 w-4 mr-2" />
                    Detailed Data
                  </TabsTrigger>
                  <TabsTrigger value="print">
                    <FileText className="h-4 w-4 mr-2" />
                    Print View
                  </TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>{t('total_rentals')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{rentals.total}</div>
                          {getTrendIndicator(rentals.total)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>{t('total_revenue')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                          {getTrendIndicator(totalAmount)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>{t('average_rental_value')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{formatCurrency(averageAmount)}</div>
                          {getTrendIndicator(averageAmount)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>{t('average_duration')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{averageDuration.toFixed(1)} days</div>
                          {getTrendIndicator(averageDuration)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Distribution */}
                  {Object.keys(statusCounts).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('status_distribution')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                              <div className="mb-2">{getStatusBadge(status)}</div>
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-muted-foreground text-sm">
                                {((count / (rentals?.total || 1)) * 100).toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Detailed Data Tab */}
                <TabsContent value="data">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('rental_details')}</CardTitle>
                      <CardDescription>
                        Showing {rentals?.data?.length || 0} of {rentals?.total || 0} rentals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rental #</TableHead>
                              <TableHead>customer</TableHead>
                              <TableHead>{t('lbl_start_date')}</TableHead>
                              <TableHead>{t('end_date')}</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Duration (Days)</TableHead>
                              <TableHead className="text-right">{t('th_total_amount')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {!rentals?.data?.length ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                  No rentals found for the selected criteria
                                </TableCell>
                              </TableRow>
                            ) : (
                              rentals.data.map((rental) => (
                                <TableRow key={rental.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">{rental.rental_number}</TableCell>
                                  <TableCell>{rental.customer?.company_name}</TableCell>
                                  <TableCell>{formatDate(rental.start_date)}</TableCell>
                                  <TableCell>{formatDate(rental.expected_end_date)}</TableCell>
                                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                                  <TableCell>{rental.duration_days}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(rental.total_amount)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={6} className="text-right font-bold">
                                Total:
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(totalAmount)}
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Print Preview Tab */}
                <TabsContent value="print">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ttl_print_preview')}</CardTitle>
                      <CardDescription>
                        Use the print button at the top to print this report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-lg font-bold mb-2">{t('report_summary')}</h2>
                          <p className="text-muted-foreground mb-4">{getFilterSummary()}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="border rounded-md p-4">
                              <div className="text-muted-foreground text-sm">{t('total_rentals')}</div>
                              <div className="text-xl font-bold">{rentals?.total || 0}</div>
                            </div>
                            <div className="border rounded-md p-4">
                              <div className="text-muted-foreground text-sm">{t('total_revenue')}</div>
                              <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
                            </div>
                            <div className="border rounded-md p-4">
                              <div className="text-muted-foreground text-sm">{t('average_rental_value')}</div>
                              <div className="text-xl font-bold">{formatCurrency(averageAmount)}</div>
                            </div>
                            <div className="border rounded-md p-4">
                              <div className="text-muted-foreground text-sm">{t('average_duration')}</div>
                              <div className="text-xl font-bold">{averageDuration.toFixed(1)} days</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h2 className="text-lg font-bold mb-4">{t('rental_details')}</h2>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Rental #</TableHead>
                                <TableHead>customer</TableHead>
                                <TableHead>{t('lbl_start_date')}</TableHead>
                                <TableHead>{t('end_date')}</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {!rentals?.data?.length ? (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-4">
                                    No rentals found for the selected criteria
                                  </TableCell>
                                </TableRow>
                              ) : (
                                rentals.data.map((rental) => (
                                  <TableRow key={rental.id}>
                                    <TableCell>{rental.rental_number}</TableCell>
                                    <TableCell>{rental.customer?.company_name}</TableCell>
                                    <TableCell>{formatDate(rental.start_date)}</TableCell>
                                    <TableCell>{formatDate(rental.expected_end_date)}</TableCell>
                                    <TableCell>{rental.status.toUpperCase()}</TableCell>
                                    <TableCell>{rental.duration_days} days</TableCell>
                                    <TableCell className="text-right">{formatCurrency(rental.total_amount)}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell colSpan={6} className="text-right">
                                  Total:
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(totalAmount)}
                                </TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Print-optimized view (hidden in normal view, shown when printing) */}
              <div className="hidden print:block">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">{t('rental_report')}</h1>
                  <p className="text-muted-foreground mb-6">{getFilterSummary()}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">{t('total_rentals')}</div>
                      <div className="text-xl font-bold">{rentals?.total || 0}</div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">{t('total_revenue')}</div>
                      <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">{t('average_rental_value')}</div>
                      <div className="text-xl font-bold">{formatCurrency(averageAmount)}</div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-muted-foreground text-sm">{t('average_duration')}</div>
                      <div className="text-xl font-bold">{averageDuration.toFixed(1)} days</div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-4">{t('status_distribution')}</h2>
                  <div className="flex gap-4 mb-4">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="border rounded-md p-4 flex-1">
                        <div className="font-medium">{status.toUpperCase()}</div>
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-muted-foreground text-sm">
                          {((count / (rentals?.total || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold mb-4">{t('rental_details')}</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rental #</TableHead>
                        <TableHead>customer</TableHead>
                        <TableHead>{t('lbl_start_date')}</TableHead>
                        <TableHead>{t('end_date')}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!rentals?.data?.length ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No rentals found for the selected criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        rentals.data.map((rental) => (
                          <TableRow key={rental.id}>
                            <TableCell>{rental.rental_number}</TableCell>
                            <TableCell>{rental.customer?.company_name}</TableCell>
                            <TableCell>{formatDate(rental.start_date)}</TableCell>
                            <TableCell>{formatDate(rental.expected_end_date)}</TableCell>
                            <TableCell>{rental.status.toUpperCase()}</TableCell>
                            <TableCell>{rental.duration_days} days</TableCell>
                            <TableCell className="text-right">{formatCurrency(rental.total_amount)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right">
                          Total:
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`
        @media print {
          @page {
            size: portrait;
            margin: 1cm;
          }
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          .hidden.print\\:block {
            display: block !important;
          }
          body {
            font-size: 12pt;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
        `}
      </style>
    </AdminLayout>
  );
}
















