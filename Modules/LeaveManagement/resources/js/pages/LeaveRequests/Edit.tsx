import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Core";
import { Input } from "@/Core";
import { Textarea } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { CalendarDays, ArrowLeft } from 'lucide-react';
const ToastService = { success: (msg: string) => alert(msg), error: (msg: string) => alert(msg) };
import { AppLayout } from '@/Core';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/Core";
import { formatDate } from "@/Core";
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageProps } from '@/Modules/LeaveManagement/resources/js/types';
import FileUpload from '@/Core/components/ui/FileUpload';

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

// Define interfaces
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  employee?: Employee;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes?: string;
  status: string;
}

interface Props {
  leaveRequest: LeaveRequest;
  employees: Employee[];
}

// Define form validation schema
const formSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  leave_type: z.string().min(1, { message: "Leave type is required" }),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().min(1, { message: "End date is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export default function LeaveRequestEdit({ leaveRequest, employees = [] }: Props) {
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const leaveTypes = [
    { id: 'annual', name: 'Annual Leave' },
    { id: 'sick', name: 'Sick Leave' },
    { id: 'personal', name: 'Personal Leave' },
    { id: 'unpaid', name: 'Unpaid Leave' },
    { id: 'maternity', name: 'Maternity Leave' },
    { id: 'paternity', name: 'Paternity Leave' },
    { id: 'bereavement', name: 'Bereavement Leave' },
    { id: 'other', name: 'Other' },
  ];

  // React Hook Form with Zod validation
  const form = useReactHookForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: leaveRequest.employee_id.toString(),
      leave_type: leaveRequest.leave_type || '',
      start_date: leaveRequest.start_date || '',
      end_date: leaveRequest.end_date || '',
      reason: leaveRequest.reason || '',
      notes: leaveRequest.notes || '',
      status: leaveRequest.status || 'pending',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setProcessing(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    if (uploadedFile) {
      formData.append('document', uploadedFile);
    }
    router.put(route('leaves.requests.update', leaveRequest.id), formData, {
      forceFormData: true,
      onSuccess: () => {
        ToastService.success('Leave request updated successfully');
        router.visit(route('leaves.requests.index'));
      },
      onError: (errors: { error?: string; errors?: Record<string, string[]> }) => {
        ToastService.error(errors.error || 'Failed to update leave request');
        // Map errors to form
        if (errors.errors) {
          Object.keys(errors.errors).forEach(key => {
            form.setError(key as any, {
              type: 'manual',
              message: errors.errors![key][0]
            });
          });
        }
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  return (
    <AppLayout>
      <Head title={t('edit_leave_request')} />
      <div className="container mx-auto py-6">
        <Breadcrumb
          segments={[
            { title: "Dashboard", href: route('dashboard') },
            { title: "Leave Requests", href: route('leaves.requests.index') },
            { title: "Edit", href: route('leaves.requests.edit', leaveRequest.id) }
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
            <BreadcrumbLink href={route('leaves.requests.edit', leaveRequest.id)}>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CalendarDays className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold">{t('edit_leave_request')}</h1>
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
            <CardTitle>{t('edit_leave_request')}</CardTitle>
            <CardDescription>
              Update the leave request details
            </CardDescription>
          </CardHeader>
          <Form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                              {leaveTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
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

                {leaveRequest.status !== 'pending' && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger id="status">
                              <SelectValue placeholder={t('ph_select_status')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div>
                  <label className="block font-medium mb-1">Upload Leave Request Document</label>
                  <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Link href={route('leaves.requests.index')}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                  Update Leave Request
                </Button>
              </CardFooter>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}















