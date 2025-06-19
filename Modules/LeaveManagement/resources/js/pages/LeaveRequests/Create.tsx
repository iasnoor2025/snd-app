import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Modules/Core/resources/js/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/Modules/Core/resources/js/components/ui/form';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import { ClipboardList, ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '@/Modules/Core/resources/js';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/Modules/Core/resources/js/components/ui/breadcrumb';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const ToastService = { success: (msg: string) => alert(msg), error: (msg: string) => alert(msg) };
import { PageProps } from '@/Modules/LeaveManagement/Resources/js/types';

// Temporary inline implementation of usePermission hook
function usePermission() {
  const { t } = useTranslation('leave');

  const { props } = usePage<PageProps>();
  const auth = props?.auth || { user: null, permissions: [], hasPermission: [], hasRole: [] };

  const isAdmin = Array.isArray(auth?.hasRole) ? auth.hasRole.includes('admin') : false;

  const hasPermission = (permission: string): boolean => {
    if (!permission) return false;
    if (isAdmin) return true;
    return Array.isArray(auth?.hasPermission) ? auth.hasPermission.includes(permission) : false;
  };

  return { hasPermission, isAdmin };
}

// Define the Employee interface
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface Props {
  employees?: Employee[];
  currentUserOnly?: boolean;
}

// Define form validation schema
const formSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  leave_type: z.string().min(1, { message: "Leave type is required" }),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().min(1, { message: "End date is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  notes: z.string().optional(),
});

// Define leave types constant array to ensure it's always available
const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'vacation', label: 'Vacation Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'hajj', label: 'Hajj Leave' },
  { value: 'umrah', label: 'Umrah Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other' },
];

export default function LeaveRequestCreate({ employees = [], currentUserOnly = false }: Props) {
  const { hasPermission } = usePermission();
  const [submitting, setSubmitting] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  const [safeEmployees, setSafeEmployees] = useState<Employee[]>([]);
  const [daysBetween, setDaysBetween] = useState<number | null>(null);

  // Initialize safe employees
  useEffect(() => {
    if (Array.isArray(employees)) {
      setSafeEmployees(employees);
    } else {
      setSafeEmployees([]);
    }
    setIsFormReady(true);
  }, [employees]);

  // React Hook Form with Zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: '',
      notes: '',
    },
  });

  // Calculate days between start and end date
  useEffect(() => {
    const startDate = form.watch('start_date');
    const endDate = form.watch('end_date');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if dates are valid before calculating
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Add 1 to include both start and end days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDaysBetween(diffDays);
      } else {
        setDaysBetween(null);
      }
    } else {
      setDaysBetween(null);
    }
  }, [form.watch('start_date'), form.watch('end_date')]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    // Use the correct field name as expected by the updated controller
    const formData = {
      ...values,
      // leave_type is already the correct field name
    };

    router.post(route('leaves.requests.store'), formData, {
      onSuccess: () => {
        ToastService.success("Leave request created successfully");
        form.reset();
        router.visit(route('leaves.requests.index'));
      },
      onError: (errors) => {
        ToastService.error("Failed to create leave request");
        if (errors && typeof errors === 'object') {
          Object.keys(errors).forEach(key => {
            form.setError(key as any, {
              type: 'manual',
              message: errors[key]
            });
          });
        }
        setSubmitting(false);
      },
      onFinish: () => {
        setSubmitting(false);
      },
    });
  };

  // If form is not ready yet, show a simple loading placeholder
  if (!isFormReady) {
    return (
      <AdminLayout>
        <Head title={t('ttl_loading')} />
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading form...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head title={t('create_leave_request')} />
      <div className="container mx-auto py-6">
        <Breadcrumb
          segments={[
            { title: "Dashboard", href: route('dashboard') },
            { title: "Leave Requests", href: route('leaves.requests.index') },
            { title: "Create", href: route('leaves.requests.create') }
          ]}
          className="mb-6"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={route('leaves.requests.index')}>{t('ttl_leave_requests')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={route('leaves.requests.create')}>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold">{t('create_leave_request')}</h1>
          </div>
          <Link href={route('leaves.requests.index')}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leave Requests
            </Button>
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader className="bg-muted/50">
            <CardTitle>{t('ttl_new_leave_request')}</CardTitle>
            <CardDescription>
              Create a new leave request for an employee
            </CardDescription>
          </CardHeader>
          <Form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-6 pt-6">
                {/* Employee and Leave Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                    <h3 className="text-sm font-medium">{t('request_details')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger id="employee_id">
                                <SelectValue placeholder={t('ph_select_employee_1')} />
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
                      name="leave_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('lbl_leave_type')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger id="leave_type">
                                <SelectValue placeholder={t('ph_select_leave_type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LEAVE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Date Range Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                    <h3 className="text-sm font-medium">{t('leave_duration')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('lbl_start_date')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              id="start_date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('end_date')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              id="end_date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {daysBetween !== null && (
                    <div className="bg-muted/5 p-4 rounded-lg border flex items-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-sm font-semibold">Total Duration:</span>
                        <span className="text-sm">{daysBetween} day{daysBetween !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                    <h3 className="text-sm font-medium">{t('additional_information')}</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('ph_reason_for_leave_request')}
                            rows={3}
                            id="reason"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('additional_notes')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('ph_any_additional_information_or_comments')}
                            rows={3}
                            id="notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Link href={route('leaves.requests.index')}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? 'Saving...' : 'Save Leave Request'}
                </Button>
              </CardFooter>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}















