import { Badge, Button, Dialog, DialogContent } from '@/Core';
import { addDays, eachDayOfInterval, format, isSameDay, isWithinInterval, parseISO, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
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
            end: visibleEndDate,
        });
        setCalendarDays(days);
    }, [visibleStartDate, visibleEndDate]);

    const moveCalendarBackward = () => {
        const daysToMove = 7;
        setVisibleStartDate((prevDate) => subDays(prevDate, daysToMove));
        setVisibleEndDate((prevDate) => subDays(prevDate, daysToMove));
    };

    const moveCalendarForward = () => {
        const daysToMove = 7;
        setVisibleStartDate((prevDate) => addDays(prevDate, daysToMove));
        setVisibleEndDate((prevDate) => addDays(prevDate, daysToMove));
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
        return schedule.filter((record) => {
            const recordDate = parseISO(record.scheduled_date);
            return isSameDay(day, recordDate);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {format(visibleStartDate, 'MMMM d')} - {format(visibleEndDate, 'MMMM d, yyyy')}
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={moveCalendarBackward}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={moveCalendarForward}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* Day Labels */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-center text-sm font-medium">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day) => {
                    const dayRecords = getMaintenanceRecordsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isInRange = isWithinInterval(day, { start: startDate, end: endDate });

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[100px] rounded-md border p-1 ${isToday ? 'border-primary-500 bg-accent' : ''} ${!isInRange ? 'bg-gray-50' : ''} `}
                        >
                            <div className="p-1 text-right">
                                <span
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-primary text-white' : ''} `}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="mt-1 max-h-[80px] space-y-1 overflow-y-auto">
                                {dayRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className={`cursor-pointer truncate rounded border-l-2 p-1 text-xs hover:bg-muted ${getMaintenanceTypeColor(record.type)} `}
                                        onClick={() => {
                                            setSelectedRecord(record);
                                            setIsDetailOpen(true);
                                        }}
                                    >
                                        <div className="truncate font-medium">{record.equipment.name}</div>
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{record.type}</span>
                                            {record.performedBy && <span className="truncate">{record.performedBy.name}</span>}
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
                    <Badge className="border-blue-300 bg-blue-100 text-blue-800" variant="outline">
                        <span className="h-2 w-2"></span>
                    </Badge>
                    <span className="text-xs">Preventive</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Badge className="border-amber-300 bg-amber-100 text-amber-800" variant="outline">
                        <span className="h-2 w-2"></span>
                    </Badge>
                    <span className="text-xs">Repair</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Badge className="border-green-300 bg-green-100 text-green-800" variant="outline">
                        <span className="h-2 w-2"></span>
                    </Badge>
                    <span className="text-xs">Inspection</span>
                </div>
            </div>

            {/* Maintenance Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px]">{selectedRecord && <MaintenanceDetailView record={selectedRecord} />}</DialogContent>
            </Dialog>
        </div>
    );
}
