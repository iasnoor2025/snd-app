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
// import { useToast } from "@/Core";  // TODO: Fix this (use sonner)
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { format } from 'date-fns';
import { toast } from "sonner";
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Timesheets', href: '/hr/timesheets' },
  { title: 'Create', href: '/hr/timesheets/create' }
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
  description: z.string().max(1000, { message: "Description must not exceed 1000 characters" }).optional(),
  tasks_completed: z.string().max(1000, { message: "Tasks completed must not exceed 1000 characters" }).optional(),
  bulk_mode: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export default function TimesheetCreate({ auth, employees = [], projects = [], rentals = [], include_rentals = false, rental_id }: Props) {
  const { t } = useTranslation('timesheet');

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
      setData('employee_id', employeeId);
    }

    // Set default hours worked and overtime
    if (!form.getValues('hours_worked')) {
      form.setValue('hours_worked', '8');
      setData('hours_worked', '8');
    }
    if (!form.getValues('overtime_hours')) {
      form.setValue('overtime_hours', '0');
      setData('overtime_hours', '0');
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
        toast.error('Please fix the validation errors');
        return;
      }

      if (isBulkMode) {
        // Bulk mode validation
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates for bulk entry');
          form.setError('start_date', { type: 'manual', message: 'Start date is required' });
          form.setError('end_date', { type: 'manual', message: 'End date is required' });
          return;
        }

        if (startDate > endDate) {
          toast.error('End date must be after start date');
          form.setError('end_date', { type: 'manual', message: 'End date must be after start date' });
          return;
        }

        // Check if employee is selected
        if (!values.employee_id) {
          toast.error('Please select an employee');
          form.setError('employee_id', { type: 'manual', message: 'Employee is required' });
          return;
        }

        // Submit bulk timesheet
        post(route('timesheets.store-bulk'), {
          onSuccess: () => {
            toast.success('Timesheets created successfully!');
            form.reset();
            router.visit(route('timesheets.index'));
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
            toast.error(message || 'Please check the form for errors');
          },
        });
      } else {
        // Single mode validation
        if (!values.employee_id) {
          toast.error('Please select an employee');
          form.setError('employee_id', { type: 'manual', message: 'Employee is required' });
          return;
        }

        if (!values.date) {
          toast.error('Please select a date');
          form.setError('date', { type: 'manual', message: 'Date is required' });
          return;
        }

        if (!values.hours_worked) {
          toast.error('Please enter hours worked');
          form.setError('hours_worked', { type: 'manual', message: 'Hours worked is required' });
          return;
        }

        // Check for duplicates first
        try {
          const isDuplicate = await checkDuplicate(values.employee_id, values.date);
          if (isDuplicate) {
            toast.error('A timesheet for this employee and date already exists');
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
            toast.success('Timesheet created successfully!');
            form.reset();
            router.visit(route('timesheets.index'));
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
            toast.error(message || 'Please check the form for errors');
          },
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while submitting the form');
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
    <AppLayout title={t('ttl_create_timesheet')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.create">
      <Head title={t('ttl_create_timesheet')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{t('ttl_create_timesheet')}</CardTitle>
              <CardDescription>
                Record your work hours and tasks for a specific day
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href={route('timesheets.index')}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {t('back_to_timesheets')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                {inertiaErrors.employee_id && (
                  <div className="text-red-500 text-sm">
                    {inertiaErrors.employee_id}
                  </div>
                )}
                {inertiaErrors.hours_worked && (
                  <div className="text-red-500 text-sm">
                    {inertiaErrors.hours_worked}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bulk_mode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              toggleBulkMode(e.target.checked);
                              field.onChange(e.target.checked);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('lbl_bulk_entry_mode')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    {isBulkMode && (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border rounded-md p-4 mb-4">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>{t('lbl_start_date')} <span className="text-red-500">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full pl-3 text-left font-normal ${form.formState.errors.start_date ? "border-red-500" : ""}`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {startDate ? format(startDate, 'PPP') : <span>Pick a start date</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={onStartDateSelect}
                                    initialFocus
                                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                              {inertiaErrors.start_date && (
                                <p className="text-sm text-red-500">{inertiaErrors.start_date}</p>
                              )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>{t('lbl_end_date')} <span className="text-red-500">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full pl-3 text-left font-normal ${form.formState.errors.end_date ? "border-red-500" : ""}`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {endDate ? format(endDate, 'PPP') : <span>Pick an end date</span>}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={onEndDateSelect}
                                    initialFocus
                                    disabled={(date) => {
                                      const today = new Date();
                                      const minDate = new Date('1900-01-01');
                                      if (date > today || date < minDate) return true;
                                      if (startDate && date < startDate) return true;
                                      return false;
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                              {inertiaErrors.end_date && (
                                <p className="text-sm text-red-500">{inertiaErrors.end_date}</p>
                              )}
                            </FormItem>
                          )}
                        />

                        <div className="md:col-span-2">
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={customOvertimePerDay}
                                onChange={(e) => setCustomOvertimePerDay(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{t('lbl_custom_overtime_per_day')}</FormLabel>
                            </div>
                          </FormItem>
                        </div>
                      </div>
                    )}
                  </div>

                  {isBulkMode && customOvertimePerDay && startDate && endDate && (
                    <div className="md:col-span-2 border rounded-md p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{t('daily_overtime_hours')}</h3>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            placeholder={t('ph_hours')}
                            className="w-24"
                            id="bulk-overtime"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const value = (document.getElementById('bulk-overtime') as HTMLInputElement)?.value || '0';
                              const newDailyOvertimeHours = { ...dailyOvertimeHours };
                              Object.keys(newDailyOvertimeHours).forEach(dateString => {
                                newDailyOvertimeHours[dateString] = value;
                              });
                              setDailyOvertimeHours(newDailyOvertimeHours);
                            }}
                          >
                            Apply to All Days
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const value = (document.getElementById('bulk-overtime') as HTMLInputElement)?.value || '0';
                            const newDailyOvertimeHours = { ...dailyOvertimeHours };
                            Object.keys(newDailyOvertimeHours).forEach(dateString => {
                              const date = new Date(dateString);
                              const day = date.getDay();
                              // If weekday (Monday-Friday)
                              if (day >= 1 && day <= 5) {
                                newDailyOvertimeHours[dateString] = value;
                              }
                            });
                            setDailyOvertimeHours(newDailyOvertimeHours);
                          }}
                        >
                          Apply to Weekdays
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const value = (document.getElementById('bulk-overtime') as HTMLInputElement)?.value || '0';
                            const newDailyOvertimeHours = { ...dailyOvertimeHours };
                            Object.keys(newDailyOvertimeHours).forEach(dateString => {
                              const date = new Date(dateString);
                              const day = date.getDay();
                              // If weekend (Saturday-Sunday)
                              if (day === 0 || day === 6) {
                                newDailyOvertimeHours[dateString] = value;
                              }
                            });
                            setDailyOvertimeHours(newDailyOvertimeHours);
                          }}
                        >
                          Apply to Weekends
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDailyOvertimeHours = { ...dailyOvertimeHours };
                            Object.keys(newDailyOvertimeHours).forEach(dateString => {
                              const date = new Date(dateString);
                              const day = date.getDay();
                              // If weekday (Monday-Friday)
                              if (day >= 1 && day <= 5) {
                                newDailyOvertimeHours[dateString] = '0';
                              }
                            });
                            setDailyOvertimeHours(newDailyOvertimeHours);
                          }}
                        >
                          Clear Weekdays
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDailyOvertimeHours = { ...dailyOvertimeHours };
                            Object.keys(newDailyOvertimeHours).forEach(dateString => {
                              const date = new Date(dateString);
                              const day = date.getDay();
                              // If weekend (Saturday-Sunday)
                              if (day === 0 || day === 6) {
                                newDailyOvertimeHours[dateString] = '0';
                              }
                            });
                            setDailyOvertimeHours(newDailyOvertimeHours);
                          }}
                        >
                          Clear Weekends
                        </Button>
                      </div>

                      <div className="overflow-auto max-h-[400px] mt-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-left">Day</th>
                              <th className="p-2 text-left">{t('lbl_overtime_hours')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(dailyOvertimeHours).sort().map(dateString => {
                              const date = new Date(dateString);
                              return (
                                <tr key={dateString} className="border-b">
                                  <td className="p-2">{format(date, 'MMM dd, yyyy')}</td>
                                  <td className="p-2">{format(date, 'EEEE')}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="24"
                                      value={dailyOvertimeHours[dateString]}
                                      onChange={(e) => handleDailyOvertimeChange(dateString, e.target.value)}
                                      className="w-24"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setData('employee_id', value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={form.formState.errors.employee_id ? "border-red-500" : undefined}>
                              <SelectValue placeholder={t('ph_select_employee')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.first_name} {employee.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {inertiaErrors.employee_id && (
                          <p className="text-sm text-red-500">{inertiaErrors.employee_id}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${form.formState.errors.date ? "border-red-500" : ""}`}
                                disabled={isBulkMode}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP') : <span>{t('project:pick_a_date')}</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={onDateSelect}
                              initialFocus
                              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                        {inertiaErrors.date && (
                          <p className="text-sm text-red-500">{inertiaErrors.date}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hours_worked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lbl_hours_worked')} <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            placeholder="8"
                            className={form.formState.errors.hours_worked ? "border-red-500" : undefined}
                            onChange={(e) => {
                              field.onChange(e);
                              setData('hours_worked', e.target.value);
                              // Clear error when value is entered
                              if (e.target.value) {
                                form.clearErrors('hours_worked');
                              }
                            }}
                            value={field.value}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                        {inertiaErrors.hours_worked && (
                          <p className="text-sm text-red-500">{inertiaErrors.hours_worked}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overtime_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lbl_overtime_hours')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setData('overtime_hours', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {inertiaErrors.overtime_hours && (
                          <p className="text-sm text-red-500">{inertiaErrors.overtime_hours}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setData('project_id', value);
                          }}
                          defaultValue={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ph_select_project')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {inertiaErrors.project_id && (
                          <p className="text-sm text-red-500">{inertiaErrors.project_id}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rental_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rental Equipment (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setData('rental_id', value);
                          }}
                          defaultValue={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ph_select_rental')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {rentals?.map((rental) => (
                              <SelectItem key={rental.id} value={rental.id.toString()}>
                                {rental.equipment.name} - {rental.rental_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {inertiaErrors.rental_id && (
                          <p className="text-sm text-red-500">{inertiaErrors.rental_id}</p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ph_brief_description_of_work_performed_max_1000_ch')}
                          className="min-h-[80px]"
                          maxLength={1000}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setData('description', e.target.value);
                          }}
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right">
                        {field.value?.length || 0}/1000
                      </div>
                      <FormMessage />
                      {inertiaErrors.description && (
                        <p className="text-sm text-red-500">{inertiaErrors.description}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tasks_completed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Completed (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ph_list_of_tasks_completed_during_this_time_max_10')}
                          className="min-h-[120px]"
                          maxLength={1000}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setData('tasks_completed', e.target.value);
                          }}
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right">
                        {field.value?.length || 0}/1000
                      </div>
                      <FormMessage />
                      {inertiaErrors.tasks_completed && (
                        <p className="text-sm text-red-500">{inertiaErrors.tasks_completed}</p>
                      )}
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={route('timesheets.index')}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={processing}>
                    <ClockIcon className="mr-2 h-4 w-4" />
                    {isBulkMode ? 'Submit Bulk Timesheets' : 'Submit Timesheet'}
                  </Button>
                </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}














