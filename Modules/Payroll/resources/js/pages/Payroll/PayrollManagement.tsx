import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';
import { Payroll } from '../../types/payroll';
import { Employee } from '../../types/employee';
import PayrollList from '../../components/payroll/PayrollList';
import PayrollGeneration from '../../components/payroll/PayrollGeneration';
import PayrollDetails from '../../components/payroll/PayrollDetails';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown, Download, Plus, RefreshCw } from 'lucide-react';
import { t } from '@/lib/i18n';

const PayrollManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const month = format(selectedMonth, 'yyyy-MM');
      const response = await axios.get(`/api/payroll?month=${month}`);
      setPayrolls(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setError('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayroll = () => {
    setActiveTab('generate');
  };

  const handlePayrollCreated = () => {
    setActiveTab('list');
    fetchPayrolls();
  };

  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setActiveTab('details');
  };

  const handleApprovePayroll = async (payrollId: number) => {
    try {
      await axios.post(`/api/payroll/${payrollId}/approve`);
      fetchPayrolls();
      if (selectedPayroll?.id === payrollId) {
        const response = await axios.get(`/api/payroll/${payrollId}`);
        setSelectedPayroll(response.data.data);
      }
    } catch (error) {
      console.error('Error approving payroll:', error);
      setError('Failed to approve payroll');
    }
  };

  const handleProcessPayment = async (payrollId: number, paymentMethod: string, reference: string) => {
    try {
      await axios.post(`/api/payroll/${payrollId}/process-payment`, {
        payment_method: paymentMethod,
        reference: reference,
      });
      fetchPayrolls();
      if (selectedPayroll?.id === payrollId) {
        const response = await axios.get(`/api/payroll/${payrollId}`);
        setSelectedPayroll(response.data.data);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment');
    }
  };

  const handleRunMonthlyPayroll = async () => {
    setIsLoading(true);
    try {
      const month = format(selectedMonth, 'yyyy-MM-dd');
      await axios.post('/api/payroll/generate-monthly', { month });
      fetchPayrolls();
      setError(null);
    } catch (error) {
      console.error('Error running monthly payroll:', error);
      setError('Failed to run monthly payroll');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPayroll = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const month = format(selectedMonth, 'yyyy-MM');
      const response = await axios.get(`/api/payroll/export?month=${month}&format=${format}`, {
        responseType: 'blob',
      });

      // Create a download link and trigger it
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll_${month}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting payroll:', error);
      setError('Failed to export payroll');
    }
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedPayroll(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { title: 'Dashboard', href: '/' },
              { title: 'Payroll Management', href: '#' },
            ]}
          />
          <h1 className="text-3xl font-bold tracking-tight">{t('payroll_management')}</h1>
          <p className="text-muted-foreground">
            Generate and manage employee payrolls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => fetchPayrolls()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportPayroll('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPayroll('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPayroll('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleGeneratePayroll} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Payroll
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">{t('payroll_list')}</TabsTrigger>
          <TabsTrigger value="generate">{t('generate_payroll')}</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedPayroll}>
            {t('ttl_payroll_details')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t('ttl_payroll_records')}</CardTitle>
                <CardDescription>
                  View and manage employee payroll records for{' '}
                  <span className="font-medium">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setSelectedMonth(new Date())}
                >
                  <Calendar className="h-4 w-4" />
                  Current Month
                </Button>
                <Button onClick={handleRunMonthlyPayroll} disabled={isLoading}>
                  Run Monthly Payroll
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PayrollList
                payrolls={payrolls}
                isLoading={isLoading}
                error={error}
                onViewPayroll={handleViewPayroll}
                onApprovePayroll={handleApprovePayroll}
                onProcessPayment={handleProcessPayment}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <PayrollGeneration
            employees={employees}
            onPayrollCreated={handlePayrollCreated}
            onCancel={handleBackToList}
          />
        </TabsContent>

        <TabsContent value="details">
          {selectedPayroll && (
            <PayrollDetails
              payroll={selectedPayroll}
              onBack={handleBackToList}
              onApprove={() => handleApprovePayroll(selectedPayroll.id)}
              onProcessPayment={(paymentMethod, reference) =>
                handleProcessPayment(selectedPayroll.id, paymentMethod, reference)
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollManagement;
