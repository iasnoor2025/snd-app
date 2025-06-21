import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Employee } from '../../types/employee';
// Placeholder types
type TimesheetFormData = any;
type Project = any;
type EmployeeTimesheet = any;
import useLoadingState from '../../hooks/useLoadingState';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { Checkbox } from "@/Core";
import { Label } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import { DatePicker } from "@/Core";
import { Alert } from "@/Core";
import { AlertDescription } from "@/Core";
import { Loader2 } from 'lucide-react';

interface TimesheetFormProps {
  timesheet?: EmployeeTimesheet;
  date?: Date | null;
  employees: Employee[];
  onSave: () => void;
  onCancel: () => void;
}

// Define form validation schema with Zod
const formSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.date({ required_error: 'Date is required' }),
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  regular_hours: z.coerce.number()
    .min(0, 'Regular hours must be at least 0')
    .optional(),
  overtime_hours: z.coerce.number()
    .min(0, 'Overtime hours must be at least 0')
    .optional(),
  project_id: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // If clock times provided, ensure both in and out are set
  if (data.clock_in && !data.clock_out) return false;
  if (data.clock_out && !data.clock_in) return false;
  // If break times provided, ensure both start and end are set
  if (data.break_start && !data.break_end) return false;
  if (data.break_end && !data.break_start) return false;
  // If using time clock, ensure regular_hours is not also set
  if ((data.clock_in && data.clock_out) && data.regular_hours) return false;
  // If not using time clock, regular_hours must be set
  if (!data.clock_in && !data.clock_out && !data.regular_hours) return false;
  return true;
}, {
  message: 'Please provide either clock times or direct hours',
  path: ['clock_in'],
})

const TimesheetForm: React.FC<TimesheetFormProps> = ({
  timesheet,
  date,
  employees,
  onSave,
  onCancel,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [useTimeClock, setUseTimeClock] = useState(!!timesheet?.clock_in);
  const { isLoading, error, withLoading } = useLoadingState('timesheetForm');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TimesheetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: timesheet
      ? {
          employee_id: timesheet.employee_id.toString(),
          date: timesheet.date ? new Date(timesheet.date) : new Date(),
          clock_in: timesheet.clock_in || '',
          clock_out: timesheet.clock_out || '',
          break_start: timesheet.break_start || '',
          break_end: timesheet.break_end || '',
          regular_hours: timesheet.regular_hours,
          overtime_hours: timesheet.overtime_hours,
          project_id: timesheet.project_id?.toString() || '',
          location: timesheet.location || '',
          notes: timesheet.notes || '',
        }
      : {
          employee_id: '',
          date: date || new Date(),
          clock_in: '09:00',
          clock_out: '17:00',
          break_start: '12:00',
          break_end: '13:00',
          regular_hours: 8,
          overtime_hours: 0,
          project_id: '',
          location: '',
          notes: '',
        },
  })

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: TimesheetFormData) => {
    await withLoading(async () => {
      try {
        const formattedData = {
          ...data,
          date: format(data.date, 'yyyy-MM-dd'),
        };

        if (timesheet) {
          await axios.put(route('timesheets.update', timesheet.id), formattedData);
        } else {
          await axios.post(route('timesheets.store'), formattedData);
        }

        onSave();
      } catch (error) {
        console.error('Error saving timesheet:', error);
        throw error;
      }
    })
  };

  // Toggle between time clock and direct hours input
  const toggleTimeClockMode = () => {
    const { t } = useTranslation('timesheet');

    setUseTimeClock(!useTimeClock);
    if (!useTimeClock) {
      // Switching to time clock mode
      setValue('regular_hours', undefined);
      setValue('overtime_hours', 0);
    } else {
      // Switching to direct hours mode
      setValue('clock_in', '');
      setValue('clock_out', '');
      setValue('break_start', '');
      setValue('break_end', '');
      setValue('regular_hours', 8);
    }
  };

  // Calculate hours based on clock times when they change
  const clockIn = watch('clock_in');
  const clockOut = watch('clock_out');
  const breakStart = watch('break_start');
  const breakEnd = watch('break_end');

  useEffect(() => {
    if (clockIn && clockOut) {
      calculateHours();
    }
  }, [clockIn, clockOut, breakStart, breakEnd]);

  const calculateHours = () => {
    if (!clockIn || !clockOut) return;

    // Parse time strings to get hours and minutes
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    };

    const inTime = parseTime(clockIn);
    const outTime = parseTime(clockOut);

    // Calculate break duration
    let breakDuration = 0;
    if (breakStart && breakEnd) {
      const breakStartTime = parseTime(breakStart);
      const breakEndTime = parseTime(breakEnd);
      breakDuration = breakEndTime - breakStartTime;
      // If break crosses midnight, adjust
      if (breakDuration < 0) breakDuration += 24;
    }

    // Calculate total hours
    let totalHours = outTime - inTime;
    // If shift crosses midnight, adjust
    if (totalHours < 0) totalHours += 24;
    totalHours -= breakDuration;

    // Calculate regular and overtime hours
    const regularHoursLimit = 8; // Standard workday
    const regularHours = Math.min(totalHours, regularHoursLimit);
    const overtimeHours = Math.max(0, totalHours - regularHoursLimit);

    // Update form fields with calculated values
    setValue('regular_hours', Math.round(regularHours * 10) / 10); // Round to 1 decimal
    setValue('overtime_hours', Math.round(overtimeHours * 10) / 10); // Round to 1 decimal
  };

  // Minimal placeholder translation function
  const t = (s: string) => s;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee</Label>
            <Controller
              name="employee_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="employee_id" className="w-full">
                    <SelectValue placeholder={t('ph_select_employee')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employee_id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employee_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...({ value: field.value, onChange: field.onChange, disabled: isLoading } as any)}
                />
              )}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="project_id">Project (Optional)</Label>
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="project_id" className="w-full">
                    <SelectValue placeholder={t('ph_select_project')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('opt_no_project')}</SelectItem>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              {...register('location')}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="use-time-clock"
              checked={useTimeClock}
              onCheckedChange={toggleTimeClockMode}
              disabled={isLoading}
            />
            <Label htmlFor="use-time-clock" className="cursor-pointer">
              Use time clock (clock in/out)
            </Label>
          </div>

          {useTimeClock ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clock_in">{t('lbl_clock_in')}</Label>
                  <Input
                    id="clock_in"
                    type="time"
                    {...register('clock_in')}
                    className="w-full"
                    disabled={isLoading}
                  />
                  {typeof errors.clock_in?.message === 'string' ? <div style={{ color: 'red' }}>{t(errors.clock_in.message)}</div> : null}
                </div>
                <div>
                  <Label htmlFor="clock_out">{t('lbl_clock_out')}</Label>
                  <Input
                    id="clock_out"
                    type="time"
                    {...register('clock_out')}
                    className="w-full"
                    disabled={isLoading}
                  />
                  {typeof errors.clock_out?.message === 'string' ? <div style={{ color: 'red' }}>{t(errors.clock_out.message)}</div> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="break_start">{t('lbl_break_start')}</Label>
                  <Input
                    id="break_start"
                    type="time"
                    {...register('break_start')}
                    className="w-full"
                    disabled={isLoading}
                  />
                  {errors.break_start?.message ? <div style={{ color: 'red' }}>{t(String(errors.break_start.message))}</div> : null}
                </div>
                <div>
                  <Label htmlFor="break_end">{t('lbl_break_end')}</Label>
                  <Input
                    id="break_end"
                    type="time"
                    {...register('break_end')}
                    className="w-full"
                    disabled={isLoading}
                  />
                  {errors.break_end?.message ? <div style={{ color: 'red' }}>{t(String(errors.break_end.message))}</div> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label>{t('lbl_calculated_regular_hours')}</Label>
                  <p className="text-lg font-medium">
                    {watch('regular_hours') || 0}
                  </p>
                </div>
                <div>
                  <Label>{t('lbl_calculated_overtime_hours')}</Label>
                  <p className="text-lg font-medium">
                    {watch('overtime_hours') || 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regular_hours">{t('lbl_regular_hours')}</Label>
                <Input
                  id="regular_hours"
                  type="number"
                  step="0.5"
                  {...register('regular_hours')}
                  className="w-full"
                  disabled={isLoading}
                />
                {errors.regular_hours?.message ? <div style={{ color: 'red' }}>{t(String(errors.regular_hours.message))}</div> : null}
              </div>
              <div>
                <Label htmlFor="overtime_hours">{t('lbl_overtime_hours')}</Label>
                <Input
                  id="overtime_hours"
                  type="number"
                  step="0.5"
                  {...register('overtime_hours')}
                  className="w-full"
                  disabled={isLoading}
                />
                {errors.overtime_hours?.message ? <div style={{ color: 'red' }}>{t(String(errors.overtime_hours.message))}</div> : null}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Timesheet'
          )}
        </Button>
      </div>
    </form>
  );
};

export default TimesheetForm;














