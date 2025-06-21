import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, isSameDay, addDays, subDays, isWithinInterval } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MaintenanceDetailView } from './MaintenanceDetailView';

interface Equipment {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
}

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  type: string;
  description: string;
  status: string;
  scheduled_date: string;
  performed_date: string | null;
  performed_by: number | null;
  notes: string | null;
  equipment: Equipment;
  performedBy?: User;
}

interface ScheduleCalendarProps {
  schedule: MaintenanceRecord[];
  startDate: Date;
  endDate: Date;
}

export function ScheduleCalendar({ schedule, startDate, endDate }: ScheduleCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [visibleStartDate, setVisibleStartDate] = useState<Date>(startDate);
  const [visibleEndDate, setVisibleEndDate] = useState<Date>(endDate);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // Generate array of dates between visibleStartDate and visibleEndDate
    const days = eachDayOfInterval({
      start: visibleStartDate,
      end: visibleEndDate
    });
    setCalendarDays(days);
  }, [visibleStartDate, visibleEndDate]);

  const moveCalendarBackward = () => {
    const daysToMove = 7;
    setVisibleStartDate(prevDate => subDays(prevDate, daysToMove));
    setVisibleEndDate(prevDate => subDays(prevDate, daysToMove));
  };

  const moveCalendarForward = () => {
    const daysToMove = 7;
    setVisibleStartDate(prevDate => addDays(prevDate, daysToMove));
    setVisibleEndDate(prevDate => addDays(prevDate, daysToMove));
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'repair':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'inspection':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getMaintenanceRecordsForDay = (day: Date) => {
    return schedule.filter(record => {
      const recordDate = parseISO(record.scheduled_date);
      return isSameDay(day, recordDate);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {format(visibleStartDate, 'MMMM d')} - {format(visibleEndDate, 'MMMM d, yyyy')}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={moveCalendarBackward}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={moveCalendarForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Day Labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(day => {
          const dayRecords = getMaintenanceRecordsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isInRange = isWithinInterval(day, { start: startDate, end: endDate });

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[100px] border rounded-md p-1
                ${isToday ? 'bg-accent border-primary-500' : ''}
                ${!isInRange ? 'bg-gray-50' : ''}
              `}
            >
              <div className="text-right p-1">
                <span className={`
                  text-sm font-medium rounded-full w-6 h-6 inline-flex items-center justify-center
                  ${isToday ? 'bg-primary text-white' : ''}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto">
                {dayRecords.map(record => (
                  <div
                    key={record.id}
                    className={`
                      text-xs p-1 border-l-2 rounded truncate cursor-pointer hover:bg-muted
                      ${getMaintenanceTypeColor(record.type)}
                    `}
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="font-medium truncate">{record.equipment.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="truncate">{record.type}</span>
                      {record.performedBy && (
                        <span className="truncate">{record.performedBy.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-4 pt-2">
        <div className="flex items-center space-x-1">
          <Badge className="bg-blue-100 border-blue-300 text-blue-800" variant="outline">
            <span className="w-2 h-2"></span>
          </Badge>
          <span className="text-xs">Preventive</span>
        </div>
        <div className="flex items-center space-x-1">
          <Badge className="bg-amber-100 border-amber-300 text-amber-800" variant="outline">
            <span className="w-2 h-2"></span>
          </Badge>
          <span className="text-xs">Repair</span>
        </div>
        <div className="flex items-center space-x-1">
          <Badge className="bg-green-100 border-green-300 text-green-800" variant="outline">
            <span className="w-2 h-2"></span>
          </Badge>
          <span className="text-xs">Inspection</span>
        </div>
      </div>

      {/* Maintenance Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecord && <MaintenanceDetailView record={selectedRecord} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

















