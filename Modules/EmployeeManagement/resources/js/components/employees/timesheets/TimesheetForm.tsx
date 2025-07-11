import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from "@/Core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

// Define the form schema with validation
const timesheetSchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  clock_in: z.string().min(1, { message: 'Clock in time is required' }),
  clock_out: z.string().min(1, { message: 'Clock out time is required' }),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

type TimesheetFormValues = z.infer<typeof timesheetSchema>

interface TimesheetFormProps {
  employeeId: number;
  timesheetId?: number;
  onSuccess?: () => void;
  defaultValues?: Partial<TimesheetFormValues>
  projects?: { id: string; name: string }[];
}

export const TimesheetForm: React.FC<TimesheetFormProps> = ({
  employeeId,
  timesheetId,
  onSuccess,
  defaultValues,
  projects = [],
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<TimesheetFormValues>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      date: defaultValues?.date || format(new Date(), 'yyyy-MM-dd'),
      clock_in: defaultValues?.clock_in || '',
      clock_out: defaultValues?.clock_out || '',
      break_start: defaultValues?.break_start || '',
      break_end: defaultValues?.break_end || '',
      project_id: defaultValues?.project_id || '',
      notes: defaultValues?.notes || '',
    },
  })

  // Load timesheet data if editing
  useEffect(() => {
    if (timesheetId) {
      setIsLoading(true);
      axios
        .get(`/employees/${employeeId}/timesheets/${timesheetId}`)
        .then((response) => {
          const { timesheet } = response.data;
          form.reset({
            date: format(new Date(timesheet.date), 'yyyy-MM-dd'),
            clock_in: timesheet.clock_in,
            clock_out: timesheet.clock_out,
            break_start: timesheet.break_start || '',
            break_end: timesheet.break_end || '',
            project_id: timesheet.project_id?.toString() || '',
            notes: timesheet.notes || '',
          })
        })
        .catch((error) => {
          console.error('Error loading timesheet:', error);
          toast({
            title: 'Error',
            description: 'Failed to load timesheet data',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsLoading(false);
        })
    }
  }, [timesheetId, employeeId]);

  // Form submission handler
  const onSubmit = async (data: TimesheetFormValues) => {
    setIsLoading(true);
    try {
      // Format the data
      const formattedData = {
        ...data,
        date: data.date,
        project_id: data.project_id ? parseInt(data.project_id) : null,
      };

      let response;
      if (timesheetId) {
        // Update existing timesheet
        response = await axios.put(
          `/employees/${employeeId}/timesheets/${timesheetId}`,
          formattedData
        );
        toast({
          title: 'Success',
          description: 'Timesheet updated successfully',
        })
      } else {
        // Create new timesheet
        response = await axios.post(
          `/api/v1/timesheets`,
          { ...formattedData, employee_id: employeeId }
        );
        toast({
          title: 'Success',
          description: 'Timesheet created successfully',
        })
        form.reset({
          date: format(new Date(), 'yyyy-MM-dd'),
          clock_in: '',
          clock_out: '',
          break_start: '',
          break_end: '',
          project_id: '',
          notes: '',
        })
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to save timesheet',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{timesheetId ? t('EmployeeManagement:employee.ttl_edit_timesheet', 'Edit Timesheet') : t('EmployeeManagement:employee.ttl_add_new_timesheet', 'Add New Timesheet')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isLoading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {projects.length > 0 && (
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                  <FormItem>
                    <FormLabel>{t('EmployeeManagement:employee.ph_select_a_project', 'Select a project')}</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        {...field}
                        disabled={isLoading}
                      >
                        <option value="">{t('EmployeeManagement:employee.ph_select_a_project', 'Select a project')}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="clock_in"
              render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                <FormItem>
                  <FormLabel>{t('EmployeeManagement:employee.lbl_clock_in_time', 'Clock In Time')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clock_out"
              render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                <FormItem>
                  <FormLabel>{t('EmployeeManagement:employee.lbl_clock_out_time', 'Clock Out Time')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="break_start"
              render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                <FormItem>
                  <FormLabel>{t('EmployeeManagement:employee.lbl_break_start', 'Break Start (Optional)')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="break_end"
              render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
                <FormItem>
                  <FormLabel>{t('EmployeeManagement:employee.lbl_break_end', 'Break End (Optional)')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }: { field: ControllerRenderProps<TimesheetFormValues, any> }) => (
              <FormItem>
                <FormLabel>{t('EmployeeManagement:employee.lbl_notes', 'Notes (Optional)')}</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} disabled={isLoading} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoading}>
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : timesheetId ? 'Update Timesheet' : 'Add Timesheet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

















