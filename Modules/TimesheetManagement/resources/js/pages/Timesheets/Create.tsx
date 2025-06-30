import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, useForm as useInertiaForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Core";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Controller } from 'react-hook-form';

const breadcrumbs: BreadcrumbItem[] = [
  { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
  { title: 'Timesheets', href: '/hr/timesheets' },
  { title: t('create', 'Create'), href: '/hr/timesheets/create' }
];

// Define interfaces
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface Project {
  id: number;
  name: string;
}

interface Rental {
  id: number;
  equipment: {
    name: string;
  };
  rental_number: string;
}

interface Props extends PageProps {
  employees: Employee[];
  projects: Project[];
  rentals?: Rental[];
  include_rentals?: boolean;
  rental_id?: string;
}

// Define form validation schema
const formSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  hours_worked: z.string().min(1, { message: "Hours worked is required" }).refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.5 && num <= 24;
    },
    { message: "Hours worked must be between 0.5 and 24" }
  ),
  overtime_hours: z.string().optional().refine(
    (val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 24;
    },
    { message: "Overtime hours must be between 0 and 24" }
  ),
  project_id: z.string().optional(),
  rental_id: z.string().optional(),
  description: z.string().max(1000, { message: t('description_max', 'Description must not exceed 1000 characters') }).optional(),
  tasks_completed: z.string().max(1000, { message: "Tasks completed must not exceed 1000 characters" }).optional(),
  bulk_mode: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export default function TimesheetCreate({ auth, employees = [], projects = [], rentals = [], include_rentals = false, rental_id }: Props) {
  const { t } = useTranslation('TimesheetManagement');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [customOvertimePerDay, setCustomOvertimePerDay] = useState(false);
  const [dailyOvertimeHours, setDailyOvertimeHours] = useState<Record<string, string>>({});

  // React Hook Form with Zod validation
  const form = useReactHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: employees.length > 0 ? employees[0].id.toString() : '',
      date: new Date().toISOString().split('T')[0],
      hours_worked: '8',
      overtime_hours: '0',
      project_id: '',
      rental_id: rental_id || '',
      description: '',
      tasks_completed: '',
      bulk_mode: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    },
  });

  // Set default values when component mounts
  useEffect(() => {
    // Set default employee if available
    if (employees.length > 0) {
      const employeeId = employees[0].id.toString();
      form.setValue('employee_id', employeeId);
      form.setValue('employee_id', employeeId);
    }

    // Set default hours worked and overtime
    if (!form.getValues('hours_worked')) {
      form.setValue('hours_worked', '8');
      form.setValue('hours_worked', '8');
    }
    if (!form.getValues('overtime_hours')) {
      form.setValue('overtime_hours', '0');
      form.setValue('overtime_hours', '0');
    }
  }, []);

  // Check URL parameters for bulk mode and month
  useEffect(() => {
    const url = new URL(window.location.href);
    const bulkParam = url.searchParams.get('bulk');
    const monthParam = url.searchParams.get('month');

    if (bulkParam === 'true') {
      setIsBulkMode(true);
      form.setValue('bulk_mode', true);

      if (monthParam) {
        // Parse the month parameter (format: yyyy-MM)
        const [year, month] = monthParam.split('-').map(Number);

        // Set start date to first day of month
        const firstDay = new Date(year, month - 1, 1);
        setStartDate(firstDay);
        form.setValue('start_date', firstDay.toISOString().split('T')[0]);

        // Set end date to last day of month
        const lastDay = new Date(year, month, 0);
        setEndDate(lastDay);
        form.setValue('end_date', lastDay.toISOString().split('T')[0]);
      }
    }
  }, []);

  const { data, setData, post, processing, errors: inertiaErrors } = useInertiaForm({
    employee_id: employees.length > 0 ? employees[0].id.toString() : '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '8',
    overtime_hours: '0',
    project_id: '',
    rental_id: rental_id || '',
    description: '',
    tasks_completed: '',
    bulk_mode: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    daily_overtime_hours: {},
  });

  // Update Inertia form data when React Hook Form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setData({
        ...data,
        employee_id: value.employee_id || '',
        date: value.date || '',
        hours_worked: value.hours_worked || '8',
        overtime_hours: value.overtime_hours || '0',
        project_id: value.project_id === 'none' ? '' : (value.project_id || ''),
        rental_id: value.rental_id === 'none' ? '' : (value.rental_id || ''),
        description: value.description || '',
        tasks_completed: value.tasks_completed || '',
        bulk_mode: value.bulk_mode || false,
        start_date: value.start_date || '',
        end_date: value.end_date || ''
      });
    });

    return () => subscription.unsubscribe();
  }, [form.watch, data]);

  // Update daily_overtime_hours in Inertia form data
  useEffect(() => {
    if (customOvertimePerDay) {
      setData({
        ...data,
        daily_overtime_hours: dailyOvertimeHours
      });
    }
  }, [dailyOvertimeHours, customOvertimePerDay, data]);

  const checkDuplicate = async (employeeId: string, date: string) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch(route('timesheets.check-duplicate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          date: date,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      // Return false to allow submission if check fails
      return false;
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Validate form
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error(t('submit_error', 'An error occurred while submitting the form'));
        return;
      }

      if (isBulkMode) {
        // Bulk mode validation
        if (!startDate || !endDate) {
          toast.error(t('bulk_error', 'Please select both start and end dates for bulk entry'));
          form.setError('start_date', { type: 'manual', message: 'Start date is required' });
          form.setError('end_date', { type: 'manual', message: 'End date is required' });
          return;
        }

        if (startDate > endDate) {
          toast.error(t('end_date_error', 'End date must be after start date'));
          form.setError('end_date', { type: 'manual', message: 'End date must be after start date' });
          return;
        }

        // Check if employee is selected
        if (!values.employee_id) {
          toast.error(t('employee_error', 'Please select an employee'));
          form.setError('employee_id', { type: 'manual', message: 'Employee is required' });
          return;
        }

        // Submit bulk timesheet
        post(route('timesheets.store-bulk'), {
          onSuccess: () => {
            toast.success(t('bulk_success', 'Timesheets created successfully!'));
            form.reset();
            router.visit(route('hr.api.timesheets.index'));
          },
          onError: (errors) => {
            console.error('Bulk submission errors:', errors);
            // Handle validation errors
            Object.keys(errors).forEach((key) => {
              const errorMessage = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
              form.setError(key as any, {
                type: 'manual',
                message: errorMessage,
              });
            });

            // Show first error message
            const firstError = Object.values(errors)[0];
            const message = Array.isArray(firstError) ? firstError[0] : firstError;
            toast.error(message || t('check_form', 'Please check the form for errors'));
          },
        });
      } else {
        // Single mode validation
        if (!values.employee_id) {
          toast.error(t('employee_error', 'Please select an employee'));
          form.setError('employee_id', { type: 'manual', message: 'Employee is required' });
          return;
        }

        if (!values.date) {
          toast.error(t('date_error', 'Please select a date'));
          form.setError('date', { type: 'manual', message: 'Date is required' });
          return;
        }

        if (!values.hours_worked) {
          toast.error(t('hours_worked_error', 'Please enter hours worked'));
          form.setError('hours_worked', { type: 'manual', message: 'Hours worked is required' });
          return;
        }

        // Check for duplicates first
        try {
          const isDuplicate = await checkDuplicate(values.employee_id, values.date);
          if (isDuplicate) {
            toast.error(t('duplicate_error', 'A timesheet for this employee and date already exists'));
            form.setError('date', { type: 'manual', message: 'Timesheet already exists for this date' });
            return;
          }
        } catch (error) {
          console.warn('Duplicate check failed:', error);
          // Continue with submission if duplicate check fails
        }

        // Submit single timesheet
        post(route('timesheets.store'), {
          onSuccess: () => {
            toast.success(t('single_success', 'Timesheet created successfully!'));
            form.reset();
            router.visit(route('hr.api.timesheets.index'));
          },
          onError: (errors) => {
            console.error('Single submission errors:', errors);
            // Handle validation errors
            Object.keys(errors).forEach((key) => {
              const errorMessage = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
              form.setError(key as any, {
                type: 'manual',
                message: errorMessage,
              });
            });

            // Show first error message
            const firstError = Object.values(errors)[0];
            const message = Array.isArray(firstError) ? firstError[0] : firstError;
            toast.error(message || t('check_form', 'Please check the form for errors'));
          },
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t('submit_error', 'An error occurred while submitting the form'));
    }
  };

  const onDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      form.setValue('date', formattedDate);
      setData({
        ...data,
        date: formattedDate
      });
    }
  };

  const onStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      form.setValue('start_date', formattedDate);
      setData({
        ...data,
        start_date: formattedDate
      });

      // If bulk mode is enabled and we have a start date and end date, generate daily overtime hours
      if (isBulkMode && endDate) {
        generateDailyOvertimeHours(date, endDate);
      }
    }
  };

  const onEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      form.setValue('end_date', formattedDate);
      setData({
        ...data,
        end_date: formattedDate
      });

      // If bulk mode is enabled and we have a start date and end date, generate daily overtime hours
      if (isBulkMode && startDate) {
        generateDailyOvertimeHours(startDate, date);
      }
    }
  };

  // Generate daily overtime hours for the date range
  const generateDailyOvertimeHours = (start: Date, end: Date) => {
    const newDailyOvertimeHours: Record<string, string> = {};
    const currentDate = new Date(start);
    const endDateValue = new Date(end);

    // Add one day to include the end date
    endDateValue.setDate(endDateValue.getDate() + 1);

    while (currentDate < endDateValue) {
      const dateString = currentDate.toISOString().split('T')[0];
      newDailyOvertimeHours[dateString] = '0';
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDailyOvertimeHours(newDailyOvertimeHours);

    // Also update the Inertia form data
    // @ts-ignore - Ignoring type errors for setData
    setData('daily_overtime_hours', newDailyOvertimeHours);
  };

  const toggleBulkMode = (enabled: boolean) => {
    setIsBulkMode(enabled);

    // Update the form value
    form.setValue('bulk_mode', enabled);

    // Also update the Inertia form data
    // @ts-ignore - Ignoring type errors for setData
    setData('bulk_mode', enabled);

    if (enabled) {
      // Clear single date when switching to bulk mode
      setSelectedDate(undefined);
      form.setValue('date', '');
      setData('date', '');
      form.clearErrors('date');

      if (startDate && endDate) {
        generateDailyOvertimeHours(startDate, endDate);
      }
    } else {
      // Clear bulk dates when switching to single mode
      setStartDate(undefined);
      setEndDate(undefined);
      form.setValue('start_date', '');
      form.setValue('end_date', '');
      setData('start_date', '');
      setData('end_date', '');
      setDailyOvertimeHours({});
      form.clearErrors(['start_date', 'end_date']);
    }
  };

  const updateDailyOvertimeHours = (start: Date, end: Date) => {
    const newDailyOvertimeHours: Record<string, string> = {};
    const currentDate = new Date(start);

    // Loop through each day in the range
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      // Initialize with default overtime value
      newDailyOvertimeHours[dateString] = dailyOvertimeHours[dateString] || '0';
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDailyOvertimeHours(newDailyOvertimeHours);
  };

  // Update daily overtime hours when date range changes
  useEffect(() => {
    if (isBulkMode && startDate && endDate) {
      updateDailyOvertimeHours(startDate, endDate);
    }
  }, [startDate, endDate, isBulkMode]);

  const handleDailyOvertimeChange = (date: string, value: string) => {
    setDailyOvertimeHours(prev => ({
      ...prev,
      [date]: value
    }));
  };

  return (
    <AppLayout
      title={t('TimesheetManagement:actions.create_timesheet')}
      breadcrumbs={[
        { title: t('TimesheetManagement:pages.timesheets'), href: route('timesheets.index') },
        { title: t('TimesheetManagement:actions.create_timesheet'), href: route('timesheets.create') }
      ]}
      requiredPermission="timesheets.create"
    >
      <Head title={t('TimesheetManagement:actions.create_timesheet')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                  {t('TimesheetManagement:fields.employee')}
                </label>
                <Controller
                  name="employee_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('TimesheetManagement:placeholders.select_employee')} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {inertiaErrors.employee_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {inertiaErrors.employee_id}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                  {t('TimesheetManagement:fields.project')}
                </label>
                <Controller
                  name="project_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('TimesheetManagement:placeholders.select_project')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {inertiaErrors.project_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {inertiaErrors.project_id}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                  {t('TimesheetManagement:fields.hours')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  {...form.register('hours_worked')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={t('TimesheetManagement:placeholders.enter_hours')}
                />
                {inertiaErrors.hours_worked && (
                  <p className="mt-1 text-sm text-red-600">
                    {inertiaErrors.hours_worked}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  {t('TimesheetManagement:fields.description')}
                </label>
                <textarea
                  {...form.register('description')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={t('TimesheetManagement:placeholders.brief_description')}
                />
                {inertiaErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {inertiaErrors.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href={route('timesheets.index')}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  {t('ui.buttons.cancel')}
                </Link>
                <Button type="submit" disabled={processing}>
                  {t('ui.buttons.create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}














