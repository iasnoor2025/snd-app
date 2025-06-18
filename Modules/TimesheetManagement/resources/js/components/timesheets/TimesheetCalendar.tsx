import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  getDay,
  parseISO,
  isWeekend
} from 'date-fns';
import { Employee } from '../../types/employee';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  FileText,
  User,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';
import TimesheetForm from './TimesheetForm';

interface TimesheetCalendarProps {
  timesheets: LocalEmployeeTimesheet[];
  currentMonth: Date;
  employees: Employee[];
  onTimesheetCreated: () => void;
}

// Placeholder for EmployeeTimesheet and TimesheetStatus
type TimesheetStatus = 'approved' | 'rejected' | 'pending';
interface LocalEmployeeTimesheet {
  id: number;
  date: string;
  status: TimesheetStatus;
  employee?: { first_name: string; last_name: string };
  regular_hours?: number;
  overtime_hours?: number;
}

const TimesheetCalendar: React.FC<TimesheetCalendarProps> = ({
  timesheets,
  currentMonth,
  employees,
  onTimesheetCreated
}) => {
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<LocalEmployeeTimesheet | undefined>(undefined);
  const { t } = useTranslation('timesheet');

  // Group timesheets by date
  const groupedTimesheets = timesheets.reduce((acc, timesheet) => {
    const date = timesheet.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(timesheet);
    return acc;
  }, {} as Record<string, LocalEmployeeTimesheet[]>);

  // Get days of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const startingDayIndex = getDay(monthStart);

  // Status color mapping
  const getStatusColor = (status: TimesheetStatus): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const handleAddTimesheet = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimesheet(undefined);
    setShowTimesheetForm(true);
  };

  const handleEditTimesheet = (timesheet: LocalEmployeeTimesheet) => {
    setSelectedTimesheet(timesheet);
    setSelectedDate(parseISO(timesheet.date));
    setShowTimesheetForm(true);
  };

  const handleFormClose = () => {
    setShowTimesheetForm(false);
    setSelectedDate(null);
    setSelectedTimesheet(undefined);
  };

  const handleTimesheetSaved = () => {
    setShowTimesheetForm(false);
    setSelectedDate(null);
    setSelectedTimesheet(undefined);
    onTimesheetCreated();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Calendar header with day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
          <div
            key={idx}
            className="bg-white p-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before start of month */}
        {Array.from({ length: startingDayIndex }).map((_, idx) => (
          <div key={`empty-start-${idx}`} className="bg-white p-3 h-36" />
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const dayTimesheets = groupedTimesheets[dateString] || [];
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isWeekendDay = isWeekend(day);

          return (
            <div
              key={day.toString()}
              className={`bg-white p-3 h-36 relative ${
                !isCurrentMonth
                  ? 'text-gray-400'
                  : isWeekendDay
                  ? 'bg-gray-50'
                  : ''
              } ${isCurrentDay ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-medium ${
                    isCurrentDay ? 'text-blue-600' : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleAddTimesheet(day)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('tooltip_add_timesheet')}</TooltipContent>
                </Tooltip>
              </div>

              {dayTimesheets.length > 0 ? (
                <div className="mt-2 space-y-1 max-h-[calc(100%-24px)] overflow-y-auto">
                  {dayTimesheets.map((timesheet) => (
                    <div
                      key={timesheet.id}
                      className={`text-xs p-1 rounded cursor-pointer flex items-center gap-1 ${
                        getStatusColor(timesheet.status)
                      }`}
                      onClick={() => handleEditTimesheet(timesheet)}
                    >
                      <>
                        {timesheet.status === 'approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : timesheet.status === 'rejected' ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock3 className="h-3 w-3" />
                        )}
                        <span className="truncate">
                          {timesheet.employee?.first_name} {timesheet.employee?.last_name}
                        </span>
                        <span className="whitespace-nowrap ml-auto">
                          {(timesheet.regular_hours ?? 0) + (timesheet.overtime_hours ?? 0)}h
                        </span>
                      </>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[calc(100%-24px)]">
                  <span className="text-xs text-gray-400">{t('no_timesheets')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timesheet form dialog */}
      <Dialog open={showTimesheetForm} onOpenChange={setShowTimesheetForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTimesheet ? 'Edit Timesheet' : 'Add Timesheet'}
              {selectedDate && (
                <span className="ml-2 text-sm text-gray-500">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <TimesheetForm
            open={showTimesheetForm}
            onClose={handleFormClose}
            onSaved={handleTimesheetSaved}
            date={selectedDate}
            timesheet={selectedTimesheet as any}
            employees={employees}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimesheetCalendar;
