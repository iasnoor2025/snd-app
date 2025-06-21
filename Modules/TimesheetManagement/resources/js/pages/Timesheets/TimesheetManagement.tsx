import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { Employee } from '../../types/employee';
import { EmployeeTimesheet } from '../../types/timesheet';
import TimesheetCalendar from '../../components/timesheets/TimesheetCalendar';
import TimesheetList from '../../components/timesheets/TimesheetList';
import BulkTimesheetUpload from '../../components/timesheets/BulkTimesheetUpload';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, List, Upload, Plus } from 'lucide-react';
import { Breadcrumbs } from "@/components/breadcrumbs";
import useLoadingState from '../../hooks/useLoadingState';

const TimesheetManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('timesheet');
  const { isLoading, error, withLoading } = useLoadingState('timesheetManagement');

  const [activeTab, setActiveTab] = useState('calendar');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timesheets, setTimesheets] = useState<EmployeeTimesheet[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTimesheets();
  }, [selectedEmployeeId, currentMonth]);

  const fetchEmployees = async () => {
    await withLoading(async () => {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
    });
  };

  const fetchTimesheets = async () => {
    await withLoading(async () => {
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      let url = `/api/timesheets?start_date=${startDate}&end_date=${endDate}`;

      if (selectedEmployeeId !== 'all') {
        url += `&employee_id=${selectedEmployeeId}`;
      }

      const response = await axios.get(url);
      setTimesheets(response.data.data);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCreateTimesheet = () => {
    navigate('/hr/timesheets/create');
  };

  const handleBulkApprove = async (timesheetIds: number[]) => {
    await withLoading(async () => {
      await axios.post('/api/timesheets/bulk-approve', { timesheet_ids: timesheetIds });
      fetchTimesheets();
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumbs
            breadcrumbs={[
              { title: 'Dashboard', href: '/' },
              { title: 'Timesheet Management', href: '#' }
            ]}
          />
          <h1 className="text-3xl font-bold tracking-tight">{t('timesheet_management')}</h1>
          <p className="text-muted-foreground">
            View, create, and manage employee timesheets
          </p>
        </div>
        <Button onClick={handleCreateTimesheet} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Timesheet
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t('ttl_employee_timesheets')}</CardTitle>

            <div className="flex items-center gap-2">
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={t('ph_select_employee')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_employees')}</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 font-medium min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="calendar" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <TimesheetCalendar
                timesheets={timesheets}
                currentMonth={currentMonth}
                employees={employees}
                onTimesheetCreated={fetchTimesheets}
              />
            </TabsContent>

            <TabsContent value="list">
              <TimesheetList
                timesheets={timesheets}
                isLoading={isLoading}
                onApprove={fetchTimesheets}
                onReject={fetchTimesheets}
                onBulkApprove={handleBulkApprove}
              />
            </TabsContent>

            <TabsContent value="upload">
              <BulkTimesheetUpload
                onUploadComplete={fetchTimesheets}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetManagement;














