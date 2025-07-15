import { formatDateMedium } from '@/Core/utils/dateFormatter';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MoreHorizontal, Plus, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Project {
    id: number;
    name: string;
    location: string;
}

interface TimesheetEntry {
    id: number;
    employee_id: number;
    project_id: number;
    date: string;
    start_time: string;
    end_time: string;
    break_duration: number;
    hours_worked: number;
    overtime_hours: number;
    status: 'pending' | 'approved' | 'rejected';
    description: string;
    project?: Project;
    created_at: string;
    updated_at: string;
}

interface TimesheetEntryProps {
    employeeId: number;
    initialEntries?: TimesheetEntry[];
}

export const TimesheetEntry: React.FC<TimesheetEntryProps> = ({ employeeId, initialEntries = [] }) => {
    const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
    const [loading, setLoading] = useState(!initialEntries.length);
    const [projects, setProjects] = useState<Project[]>([]);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentEntry, setCurrentEntry] = useState<{
        project_id: number | null;
        date: string;
        start_time: string;
        end_time: string;
        break_duration: number;
        description: string;
    }>({
        project_id: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        break_duration: 60,
        description: '',
    });
    const [calculatedHours, setCalculatedHours] = useState({
        hours_worked: 0,
        overtime_hours: 0,
    });
    const [filter, setFilter] = useState({
        startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'all',
        project_id: 'all',
    });

    useEffect(() => {
        if (!initialEntries.length) {
            fetchTimesheetEntries();
        }
        fetchProjects();
    }, [employeeId, initialEntries]);

    useEffect(() => {
        if (selectedDate) {
            setCurrentEntry((prev) => ({
                ...prev,
                date: format(selectedDate, 'yyyy-MM-dd'),
            }));
        }
    }, [selectedDate]);

    useEffect(() => {
        calculateHours();
    }, [currentEntry.start_time, currentEntry.end_time, currentEntry.break_duration]);

    const fetchTimesheetEntries = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/employees/${employeeId}/timesheets`, {
                params: filter,
            });
            setEntries(response.data.data);
        } catch (error) {
            console.error('Error fetching timesheet entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects');
            setProjects(response.data.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        const { t } = useTranslation('employee');

        setFilter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        fetchTimesheetEntries();
    };

    const calculateHours = () => {
        if (!currentEntry.start_time || !currentEntry.end_time) {
            setCalculatedHours({ hours_worked: 0, overtime_hours: 0 });
            return;
        }

        const [startHour, startMinute] = currentEntry.start_time.split(':').map(Number);
        const [endHour, endMinute] = currentEntry.end_time.split(':').map(Number);

        let totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
        totalMinutes -= currentEntry.break_duration;

        if (totalMinutes <= 0) {
            setCalculatedHours({ hours_worked: 0, overtime_hours: 0 });
            return;
        }

        const totalHours = totalMinutes / 60;
        const standardHours = 8; // Assuming 8 hour standard workday
        const overtimeHours = Math.max(0, totalHours - standardHours);
        const regularHours = totalHours - overtimeHours;

        setCalculatedHours({
            hours_worked: parseFloat(regularHours.toFixed(2)),
            overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        });
    };

    const handleInputChange = (name: string, value: string | number) => {
        setCurrentEntry((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!currentEntry.project_id || !currentEntry.date) {
            return;
        }

        try {
            const payload = {
                ...currentEntry,
                employee_id: employeeId,
                hours_worked: calculatedHours.hours_worked,
                overtime_hours: calculatedHours.overtime_hours,
            };

            const response = await axios.post('/api/timesheets', payload);

            // Add the new entry to the list
            setEntries((prev) => [response.data.data, ...prev]);

            // Reset form
            setCurrentEntry({
                project_id: null,
                date: format(new Date(), 'yyyy-MM-dd'),
                start_time: '09:00',
                end_time: '17:00',
                break_duration: 60,
                description: '',
            });

            setEntryDialogOpen(false);
        } catch (error) {
            console.error('Error creating timesheet entry:', error);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('ttl_timesheet_entries')}</CardTitle>
                        <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add Time Entry
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('ttl_add_timesheet_entry')}</DialogTitle>
                                    <DialogDescription>Record your work hours for a specific date and project.</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="project">Project</Label>
                                        <Select
                                            value={currentEntry.project_id?.toString() || ''}
                                            onValueChange={(value) => handleInputChange('project_id', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ph_select_a_project')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id.toString()}>
                                                        {project.name} ({project.location})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="date">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !selectedDate && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid w-full items-center gap-1.5">
                                            <Label htmlFor="start-time">{t('lbl_start_time')}</Label>
                                            <Input
                                                id="start-time"
                                                type="time"
                                                value={currentEntry.start_time}
                                                onChange={(e) => handleInputChange('start_time', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid w-full items-center gap-1.5">
                                            <Label htmlFor="end-time">{t('lbl_end_time')}</Label>
                                            <Input
                                                id="end-time"
                                                type="time"
                                                value={currentEntry.end_time}
                                                onChange={(e) => handleInputChange('end_time', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                                        <Input
                                            id="break-duration"
                                            type="number"
                                            min="0"
                                            max="240"
                                            value={currentEntry.break_duration}
                                            onChange={(e) => handleInputChange('break_duration', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="rounded-md bg-gray-50 p-3">
                                        <h4 className="mb-2 text-sm font-medium">{t('calculated_hours')}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">{t('regular_hours')}</p>
                                                <p className="font-medium">{calculatedHours.hours_worked}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t('overtime_hours')}</p>
                                                <p className="font-medium">{calculatedHours.overtime_hours}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder={t('ph_briefly_describe_the_work_done')}
                                            value={currentEntry.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleSubmit} disabled={formatDateMedium(!currentEntry.project_id || !currentEntry.date)}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Entry
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="start-date-filter">{t('lbl_start_date')}</Label>
                                <Input
                                    id="start-date-filter"
                                    type="date"
                                    value={filter.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="end-date-filter">{t('lbl_end_date')}</Label>
                                <Input
                                    id="end-date-filter"
                                    type="date"
                                    value={filter.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="status-filter">Status</Label>
                                <Select value={filter.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="project-filter">Project</Label>
                                <Select value={filter.project_id} onValueChange={(value) => handleFilterChange('project_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_all_projects')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('opt_all_projects')}</SelectItem>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="mr-2 h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                                    Loading timesheet entries...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : entries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center">
                                                No timesheet entries found. Add a new entry to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        entries.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{entry.project?.name || 'Unknown Project'}</div>
                                                    <div className="text-sm text-gray-500">{entry.project?.location}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Clock className="mr-1 h-4 w-4 text-gray-500" />
                                                        <span>
                                                            {entry.start_time} - {entry.end_time}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">{entry.break_duration} min break</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{entry.hours_worked} hrs</div>
                                                    {entry.overtime_hours > 0 && (
                                                        <div className="text-sm text-orange-600">+{entry.overtime_hours} OT</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusBadgeColor(entry.status)}>
                                                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={t('ttl_view_details')}
                                                        disabled={true} // Implement details dialog in future
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                            <div>Showing {entries.length} entries</div>

                            <div className="rounded-md bg-gray-50 px-3 py-1.5">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span className="font-medium">Total Regular:</span>{' '}
                                        {entries.reduce((acc, entry) => acc + entry.hours_worked, 0).toFixed(2)} hrs
                                    </div>
                                    <div>
                                        <span className="font-medium">Total Overtime:</span>{' '}
                                        {entries.reduce((acc, entry) => acc + entry.overtime_hours, 0).toFixed(2)} hrs
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimesheetEntry;
