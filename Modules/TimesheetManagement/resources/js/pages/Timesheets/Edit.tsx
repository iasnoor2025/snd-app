import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/Core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Core";
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Save as SaveIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from "@/Core";
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { Calendar } from "@/Core";
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

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

interface Timesheet {
  id: number;
  employee_id: number;
  employee?: Employee;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  project_id?: number;
  project?: Project;
  description?: string;
  tasks_completed?: string;
  status: string;
}

interface Props {
  timesheet: any;
  employee?: any;
  project?: any;
  rental?: any;
  user?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  employees?: any[];
  projects?: any[];
}

// Define form validation schema
const formSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  hours_worked: z.string().min(1, { message: "Hours worked is required" }),
  overtime_hours: z.string().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
  tasks_completed: z.string().optional(),
  status: z.string().optional(),
});

export default function TimesheetEdit({ timesheet, employee = {}, project = {}, rental = {}, user = {}, created_at, updated_at, deleted_at, employees = [], projects = [] }: Props) {
  const { t } = useTranslation('TimesheetManagement');

  const [processing, setProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    timesheet.date ? new Date(timesheet.date) : new Date()
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
    { title: 'Timesheets', href: '/timesheets' },
    { title: t('edit', 'Edit'), href: '#' }
  ];

  // React Hook Form with Zod validation
  const form = useReactHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: timesheet.employee_id.toString(),
      date: timesheet.date || new Date().toISOString().split('T')[0],
      hours_worked: timesheet.hours_worked?.toString() || '',
      overtime_hours: timesheet.overtime_hours?.toString() || '0',
      project_id: timesheet.project_id?.toString() || '',
      description: timesheet.description || '',
      tasks_completed: timesheet.tasks_completed || '',
      status: timesheet.status || 'submitted',
    },
  });

  const onDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue('date', date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert "none" value back to empty string for project_id
    const formData = {
      ...values,
      project_id: values.project_id === 'none' ? '' : values.project_id
    };

    setProcessing(true);

    router.put(route('timesheets.update', timesheet.id), formData, {
      onSuccess: () => {
        toast.success(t('success', 'Success'));
        setProcessing(false);
      },
      onError: (errors) => {
        toast.error(errors.error || t('update_failed', 'Failed to update timesheet'));
        setProcessing(false);

        // Map errors to form
        Object.keys(errors).forEach(key => {
          form.setError(key as any, {
            type: 'manual',
            message: errors[key]
          });
        });
      }
    });
  };

  return (
    <AppLayout
      title={t('edit_timesheet')}
      breadcrumbs={breadcrumbs}
    >
      <Head title={t('edit_timesheet')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{t('edit_timesheet')}</CardTitle>
              <CardDescription>
                Update your work hours and tasks for {timesheet.date && format(new Date(timesheet.date), 'PPP')}
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
            <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }: any) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
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
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hours_worked"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>{t('lbl_hours_worked')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" min="0" max="24" placeholder="8" {...field} />
                        </FormControl>
                        <CardDescription>
                          Regular hours worked (excluding overtime)
                        </CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overtime_hours"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>{t('lbl_overtime_hours')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" min="0" max="24" placeholder="0" {...field} />
                        </FormControl>
                        <CardDescription>
                          Additional hours beyond regular schedule
                        </CardDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ph_select_status')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="foreman_approved">Foreman Approved</SelectItem>
                            <SelectItem value="incharge_approved">Incharge Approved</SelectItem>
                            <SelectItem value="checking_approved">Checking Approved</SelectItem>
                            <SelectItem value="manager_approved">Manager Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ph_brief_description_of_work_performed')}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tasks_completed"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Tasks Completed (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ph_list_of_tasks_completed_during_this_time')}
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={route('timesheets.index')}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={processing}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {t('update', 'Update')}
                  </Button>
                </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}















