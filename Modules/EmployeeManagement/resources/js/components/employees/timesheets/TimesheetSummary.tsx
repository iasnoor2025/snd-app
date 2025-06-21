import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format, parseISO, isSameMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Calendar } from "@/Core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core";
import { Button } from "@/Core";
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';
// import { DailyTimesheetRecords } from '../../../../../TimesheetManageme@/Core/components/timesheets/DailyTimesheetRecords';

interface TimesheetSummary {
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
}

interface TimesheetRecord {
  date: string;
  day: string;
  dayName: string;
  regularHours: number;
  overtimeHours: number;
  status: string;
}

interface TimesheetSummaryProps {
  employeeId?: number;
  showEmployeeSelector?: boolean;
}

export const TimesheetSummary: React.FC<TimesheetSummaryProps> = ({
  employeeId,
  showEmployeeSelector = false,
}) => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [summary, setSummary] = useState<TimesheetSummary | null>(null);
  const [dailyRecords, setDailyRecords] = useState<TimesheetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(employeeId);

  // Fetch employees if selector is enabled
  useEffect(() => {
    if (showEmployeeSelector) {
      axios.get('/employees')
        .then(response => {
          setEmployees(response.data.map((emp: any) => ({
            id: emp.id,
            name: emp.name
          })));
        })
        .catch(error => {
          console.error('Error fetching employees:', error);
        })
    }
  }, [showEmployeeSelector]);

  // Set selected employee ID when employeeId prop changes
  useEffect(() => {
    setSelectedEmployeeId(employeeId);
  }, [employeeId]);

  // Fetch timesheet data
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const monthString = format(selectedMonth, 'yyyy-MM');
        const startDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'yyyy-MM-dd');
        const endDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0), 'yyyy-MM-dd');

        // Fetch summary data
        const summaryResponse = await axios.get(
          `/employees/${selectedEmployeeId}/timesheets/total-hours?start_date=${startDate}&end_date=${endDate}`
        );
        setSummary(summaryResponse.data);

        // Fetch timesheets for daily records
        const timesheetsResponse = await axios.get(
          `/employees/${selectedEmployeeId}/timesheets?start_date=${startDate}&end_date=${endDate}`
        );

        // Transform timesheet data for the calendar view
        const records: TimesheetRecord[] = [];
        const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();

        // Initialize the days array with empty records
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayOfWeek = date.getDay();
          const dayName = format(date, 'EEE');

          records.push({
            date: dateStr,
            day: String(day),
            dayName,
            regularHours: 0,
            overtimeHours: 0,
            status: 'absent'
          })
        }

        // Update records with actual timesheet data
        timesheetsResponse.data.timesheets.forEach((timesheet: any) => {
          const timesheetDate = new Date(timesheet.date);
          const dayIndex = timesheetDate.getDate() - 1;

          if (dayIndex >= 0 && dayIndex < records.length) {
            records[dayIndex].regularHours = timesheet.regular_hours;
            records[dayIndex].overtimeHours = timesheet.overtime_hours;
            records[dayIndex].status = timesheet.status;
          }
        })

        setDailyRecords(records);
      } catch (error) {
        if (error?.response?.status === 404) {
          setSummary({ total_hours: 0, regular_hours: 0, overtime_hours: 0 });
          const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
          const records = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayName = format(date, 'EEE');
            records.push({
              date: dateStr,
              day: String(day),
              dayName,
              regularHours: 0,
              overtimeHours: 0,
              status: 'A',
            });
          }
          setDailyRecords(records);
        } else {
          console.error('Error fetching timesheet data:', error);
          toast('Failed to load timesheet data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedEmployeeId, selectedMonth]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">{t('timesheet_summary')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {showEmployeeSelector && employees.length > 0 && (
            <select
              className="rounded-md border border-input bg-background px-3 py-2"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            >
              <option value="">{t('lbl_select_employee')}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 pl-3 pr-3">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, 'MMMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => setSelectedMonth(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !selectedEmployeeId ? (
        <div className="text-center py-8 text-muted-foreground">
          Please select an employee to view timesheet data.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('regular_hours')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.regular_hours?.toFixed(1) || '0.0'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('overtime_hours')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.overtime_hours?.toFixed(1) || '0.0'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('th_total_hours')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.total_hours?.toFixed(1) || '0.0'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('ttl_monthly_timesheet_records')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* {DailyTimesheetRecords ? (
                <DailyTimesheetRecords
                  timesheets={dailyRecords}
                  selectedMonth={format(selectedMonth, 'yyyy-MM')}
                  showSummary={true}
                />
              ) : (
                <div className="text-muted-foreground italic">DailyTimesheetRecords component not found.</div>
              )} */}
              <div className="text-muted-foreground italic">DailyTimesheetRecords component temporarily disabled for build.</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

















