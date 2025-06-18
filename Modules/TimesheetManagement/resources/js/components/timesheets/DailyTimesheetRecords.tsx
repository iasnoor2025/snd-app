import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TimesheetRecord {
  date: string;
  day: string;
  dayName: string;
  regularHours: number;
  overtimeHours: number;
  status: string;
}

interface DailyTimesheetRecordsProps {
  timesheets: TimesheetRecord[];
  selectedMonth: string;
  showSummary?: boolean;
  className?: string;
}

export const DailyTimesheetRecords: React.FC<DailyTimesheetRecordsProps> = ({
  timesheets,
  selectedMonth,
  showSummary = true,
  className = ''
}) => {
  const calculateMonthlySummary = (records: TimesheetRecord[]) => {
  const { t } = useTranslation('timesheet');

    const summary = {
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      totalDays: 0,
      daysWorked: 0,
      daysAbsent: 0,
      status: {
        approved: 0,
        pending: 0,
        rejected: 0
      }
    };

    // Calculate total days in month
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    summary.totalDays = endDate.getDate();

    // Count days worked and absent (excluding Fridays)
    records.forEach(record => {
      summary.totalRegularHours += Number(record.regularHours || 0);
      summary.totalOvertimeHours += Number(record.overtimeHours || 0);

      // Skip Friday records
      if (isFriday(record.date)) {
        return;
      }

      if (record.status === 'absent') {
        summary.daysAbsent++;
      } else if (record.regularHours > 0 || record.overtimeHours > 0) {
        summary.daysWorked++;
      }

      if (record.status) {
        summary.status[record.status as keyof typeof summary.status]++;
      }
    })

    return summary;
  };

  // Add this function to check if a day is Friday
  const isFriday = (date: string) => {
    const day = new Date(date).getDay();
    return day === 5; // 5 represents Friday
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">{t('lbl_regular_hours')}</h3>
            <p className="text-xl font-bold">{calculateMonthlySummary(timesheets).totalRegularHours.toFixed(1)}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">{t('lbl_overtime_hours')}</h3>
            <p className="text-xl font-bold">{calculateMonthlySummary(timesheets).totalOvertimeHours.toFixed(1)}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">{t('days_worked')}</h3>
            <p className="text-xl font-bold">{calculateMonthlySummary(timesheets).daysWorked}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">{t('days_absent')}</h3>
            <p className="text-xl font-bold">{calculateMonthlySummary(timesheets).daysAbsent}</p>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-3 py-2">
          <h3 className="text-xs font-medium">{t('daily_timesheet_records')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {Array.from({ length: 31 }, (_, i) => {
                  const date = new Date(selectedMonth);
                  date.setDate(i + 1);
                  const isFridayDay = date.getDay() === 5;
                  return (
                    <th
                      key={i + 1}
                      className={`text-center p-1 text-xs font-medium ${
                        isFridayDay ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Days Row */}
              <tr className="border-b">
                {timesheets.map((record) => {
                  const isFridayDay = isFriday(record.date);
                  return (
                    <td
                      key={`day-${record.date}`}
                      className={`p-1 text-center ${isFridayDay ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`text-[10px] ${isFridayDay ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>
                        {record.dayName}
                      </div>
                    </td>
                  );
                })}
              </tr>
              {/* Regular Hours Row */}
              <tr className="border-b">
                {timesheets.map((record) => {
                  const isFridayDay = isFriday(record.date);
                  return (
                    <td
                      key={`regular-${record.date}`}
                      className={`p-1 text-center ${isFridayDay ? 'bg-blue-50' : ''}`}
                    >
                      {record.regularHours > 0 ? (
                        <div className={`text-[10px] font-medium ${isFridayDay ? 'text-blue-700' : 'text-gray-700'}`}>
                          {record.regularHours}h
                        </div>
                      ) : (
                        <div className={`text-[10px] ${isFridayDay ? 'text-blue-400' : 'text-gray-400'}`}>
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* Overtime Hours Row */}
              <tr className="border-b">
                {timesheets.map((record) => {
                  const isFridayDay = isFriday(record.date);
                  return (
                    <td
                      key={`overtime-${record.date}`}
                      className={`p-1 text-center ${isFridayDay ? 'bg-blue-50' : ''}`}
                    >
                      {record.overtimeHours > 0 ? (
                        <div className={`text-[10px] font-medium ${isFridayDay ? 'text-blue-700' : 'text-amber-600'}`}>
                          +{record.overtimeHours}h
                        </div>
                      ) : (
                        <div className={`text-[10px] ${isFridayDay ? 'text-blue-400' : 'text-gray-400'}`}>
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* Status Row */}
              <tr className="border-b">
                {timesheets.map((record) => {
                  const isFridayDay = isFriday(record.date);
                  return (
                    <td
                      key={`status-${record.date}`}
                      className={`p-1 text-center ${isFridayDay ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isFridayDay ? 'bg-blue-100 text-blue-800' :
                        record.status === 'approved' || record.status === 'submitted' || record.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'absent' || record.status === 'A' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isFridayDay ? 'F' :
                          record.status === 'approved' || record.status === 'submitted' || record.status === 'present' ? 'P' :
                          record.status === 'absent' || record.status === 'A' ? 'A' :
                          record.status}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
