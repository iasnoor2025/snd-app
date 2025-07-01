import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import { Textarea } from "@/Core";
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from "@/Core";
import { cn } from "@/Core";
import { SubmitHandler } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import PersonalInfoTab from '../../components/employees/create/tabs/PersonalInfoTab';
import EmploymentDetailsTab from '../../components/employees/create/tabs/EmploymentDetailsTab';
import SalaryInfoTab from '../../components/employees/create/tabs/SalaryInfoTab';
import DocumentsTab from '../../components/employees/create/tabs/DocumentsTab';
import CertificationsTab from '../../components/employees/create/tabs/CertificationsTab';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
  users: any[];
  positions: any[];
  employee?: any;
  isEditing?: boolean;
}

// List of countries for nationality dropdown
const countries = [
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Yemen', label: 'Yemen' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'India', label: 'India' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Sudan', label: 'Sudan' },
];

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  file_number: z.string().min(1, "File number is required")
    .regex(/^EMP-\d{4}$/, "File number must be in format EMP-XXXX"),
  position_id: z.coerce.number().min(1, "Position is required"),
  hourly_rate: z.coerce.number().min(0, "Hourly rate must be non-negative").optional().default(0),
  basic_salary: z.coerce.number().min(0, "Basic salary must be non-negative").optional().default(0),
  overtime_rate_multiplier: z.coerce.number().min(0, "Overtime rate multiplier must be non-negative").optional().default(0),
  overtime_fixed_rate: z.coerce.number().min(0, "Overtime fixed rate must be non-negative").optional().default(0),
  contract_hours_per_day: z.coerce.number().min(1, "Contract hours per day must be at least 1").max(24, "Contract hours cannot exceed 24").optional().default(8),
  contract_days_per_month: z.coerce.number().min(1, "Contract days per month must be at least 1").max(31, "Contract days cannot exceed 31").optional().default(30),
  iqama_number: z.string().optional().default(""),
  iqama_expiry: z.string().optional().default(""),
  iqama_cost: z.coerce.number().min(0, "Iqama cost must be non-negative").optional().default(0),
  passport_number: z.string().optional().default(""),
  passport_expiry: z.string().optional().default(""),
  driving_license: z.object({
    number: z.string().optional().default(""),
    expiry_date: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be a positive number").optional().default(0),
  }).optional().default({}),
  operator_license: z.object({
    number: z.string().optional().default(""),
    expiry_date: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be a positive number").optional().default(0),
  }).optional().default({}),
  tuv_certification: z.object({
    number: z.string().optional().default(""),
    expiry_date: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be a positive number").optional().default(0),
  }).optional().default({}),
  spsp_license: z.object({
    number: z.string().optional().default(""),
    expiry_date: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be a positive number").optional().default(0),
  }).optional().default({}),
  custom_certifications: z.array(z.object({
    name: z.string().optional().default(""),
    issuing_organization: z.string().optional().default(""),
    issue_date: z.string().optional().default(""),
    expiry_date: z.string().optional().default(""),
    credential_id: z.string().optional().default(""),
    credential_url: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be a positive number").optional().default(0),
  })).default([]),
  notes: z.string().optional().default(""),
  hire_date: z.string().min(1, "Hire date is required"),
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
  food_allowance: z.coerce.number().min(0, "Food allowance must be non-negative").optional().default(0),
  housing_allowance: z.coerce.number().min(0, "Housing allowance must be non-negative").optional().default(0),
  transport_allowance: z.coerce.number().min(0, "Transport allowance must be non-negative").optional().default(0),
  advance_payment: z.coerce.number().min(0, "Advance payment must be non-negative").optional().default(0),
  absent_deduction_rate: z.coerce.number().min(0, "Absent deduction rate must be non-negative").max(100, "Absent deduction rate cannot exceed 100%").optional().default(0),
  role: z.enum(['admin', 'manager', 'foreman', 'workshop', 'employee']).default('employee'),
  supervisor: z.string().optional().default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  emergency_contact_name: z.string().optional().default(""),
  emergency_contact_phone: z.string().optional().default(""),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  department_id: z.coerce.number().min(1, 'Department is required'),
});

type FormValues = z.infer<typeof formSchema>;

type FileRecord = Record<string, File | null>;

export default function Create({ users, positions, employee, isEditing = false }: Props) {
  const { t } = useTranslation('employee');

  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCertificationCost, setTotalCertificationCost] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [files, setFiles] = useState<FileRecord>({
    driving_license: null,
    operator_license: null,
    tuv_certification: null,
    spsp_license: null,
    passport: null,
    iqama: null,
  });

  // Initialize existing files from employee data if editing
  useEffect(() => {
    if (isEditing && employee) {
      // Set existing file info in the form but don't modify the files state
      // This is just to show the user that files exist
      console.log('Initializing existing file data for editing');
    }
  }, [isEditing, employee]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      nationality: employee?.nationality || '',
      file_number: employee?.file_number || '',
      position_id: employee?.position_id ? Number(employee.position_id) : 1,
      hourly_rate: employee?.hourly_rate || 0,
      basic_salary: employee?.basic_salary || 0,
      overtime_rate_multiplier: employee?.overtime_rate_multiplier || 1.5,
      overtime_fixed_rate: employee?.overtime_fixed_rate || 0,
      contract_hours_per_day: employee?.contract_hours_per_day || 8,
      contract_days_per_month: employee?.contract_days_per_month || 22,
      iqama_number: employee?.iqama_number || '',
      iqama_expiry: employee?.iqama_expiry || '',
      iqama_cost: employee?.iqama_cost || 0,
      passport_number: employee?.passport_number || '',
      passport_expiry: employee?.passport_expiry || '',
      driving_license: {
        number: employee?.driving_license?.number || '',
        expiry_date: employee?.driving_license?.expiry_date || '',
        cost: employee?.driving_license?.cost || 0,
      },
      operator_license: {
        number: employee?.operator_license?.number || '',
        expiry_date: employee?.operator_license?.expiry_date || '',
        cost: employee?.operator_license?.cost || 0,
      },
      tuv_certification: {
        number: employee?.tuv_certification?.number || '',
        expiry_date: employee?.tuv_certification?.expiry_date || '',
        cost: employee?.tuv_certification?.cost || 0,
      },
      spsp_license: {
        number: employee?.spsp_license?.number || '',
        expiry_date: employee?.spsp_license?.expiry_date || '',
        cost: employee?.spsp_license?.cost || 0,
      },
      custom_certifications: employee?.custom_certifications || [],
      notes: employee?.notes || '',
      hire_date: employee?.hire_date || '',
      status: employee?.status || 'active',
      food_allowance: employee?.food_allowance || 0,
      housing_allowance: employee?.housing_allowance || 0,
      transport_allowance: employee?.transport_allowance || 0,
      advance_payment: employee?.advance_payment || 0,
      absent_deduction_rate: employee?.absent_deduction_rate || 0,
      role: employee?.role || 'employee',
      supervisor: employee?.supervisor || '',
      address: employee?.address || '',
      city: employee?.city || '',
      emergency_contact_name: employee?.emergency_contact_name || '',
      emergency_contact_phone: employee?.emergency_contact_phone || '',
      date_of_birth: employee?.date_of_birth || '',
      department_id: employee?.department_id ? Number(employee.department_id) : 1,
    },
  });

  // Watch for form changes to update costs
  useEffect(() => {
    let isUpdatingHourlyRate = false;

    const calculateTotalCost = () => {
      const values = form.getValues();

      // Get all certification costs
      const drivingLicenseCost = Number(values.driving_license?.cost) || 0;
      const operatorLicenseCost = Number(values.operator_license?.cost) || 0;
      const tuvCertificationCost = Number(values.tuv_certification?.cost) || 0;
      const spspLicenseCost = Number(values.spsp_license?.cost) || 0;
      const iqamaCost = Number(values.iqama_cost) || 0;

      // Calculate custom certifications cost
      const customCertificationsCost = (values.custom_certifications || []).reduce((sum, cert) => {
        return sum + (Number(cert?.cost) || 0);
      }, 0);

      // Sum all costs
      const totalCost = [
        drivingLicenseCost,
        operatorLicenseCost,
        tuvCertificationCost,
        spspLicenseCost,
        iqamaCost,
        customCertificationsCost
      ].reduce((sum, cost) => sum + cost, 0);

      setTotalCertificationCost(totalCost);

      // Calculate hourly rate including total certification cost
      const basicSalary = Number(values.basic_salary) || 0;
      const contractHoursPerDay = Number(values.contract_hours_per_day) || 8;
      const contractDaysPerMonth = Number(values.contract_days_per_month) || 30;
      const monthlyHours = contractHoursPerDay * contractDaysPerMonth;

      // Only update hourly rate if we're not manually setting it
      // Check if hourly_rate has been manually modified
      const manuallySetHourlyRate = form.getFieldState('hourly_rate').isDirty;

      if (!manuallySetHourlyRate) {
        // Add total certification cost to basic salary for hourly rate calculation
        const totalMonthlyCost = basicSalary;
        const calculatedHourlyRate = monthlyHours > 0 ? Number((totalMonthlyCost / monthlyHours).toFixed(2)) : 0;
        setHourlyRate(calculatedHourlyRate);

        // Update the hourly_rate field with the calculated value
        // But prevent the watch callback from triggering again
        isUpdatingHourlyRate = true;
        form.setValue('hourly_rate', calculatedHourlyRate, { shouldValidate: false });
        setTimeout(() => {
          isUpdatingHourlyRate = false;
        }, 0);
      } else {
        // Just update the display value but don't modify the form
        const totalMonthlyCost = basicSalary;
        const calculatedHourlyRate = monthlyHours > 0 ? Number((totalMonthlyCost / monthlyHours).toFixed(2)) : 0;
        setHourlyRate(calculatedHourlyRate);
      }
    };

    // Subscribe to form changes
    const subscription = form.watch((value, { name }) => {
      // Don't recalculate if we're in the process of updating hourly_rate
      // or if the change was to hourly_rate itself
      if (isUpdatingHourlyRate || name === 'hourly_rate') {
        return;
      }

      // Handle overtime rate multiplier logic
      if (name === 'overtime_fixed_rate') {
        const fixedRate = value.overtime_fixed_rate || 0;
        form.setValue('overtime_rate_multiplier', fixedRate > 0 ? 0 : 1.5, { shouldValidate: false });
      }

      calculateTotalCost();
    });

    // Initial calculation
    calculateTotalCost();

    return () => subscription.unsubscribe();
  }, [form]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const data = form.getValues();

      // Debug log the form data
      console.log('Form data before processing:', data);

      // Ensure position_id is a number
      if (data.position_id !== undefined) {
        const position = positions.find(p => p.id === Number(data.position_id));
        if (!position) {
          toast.error('Selected position not found. Please try again.');
          return;
        }
        data.position_id = Number(data.position_id);
      }

      // Ensure required fields are set
      const requiredFields = {
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        nationality: 'Nationality',
        file_number: 'File Number',
        position_id: 'Position',
        hire_date: 'Hire Date',
        date_of_birth: 'Date of Birth',
        basic_salary: 'Basic Salary',
        hourly_rate: 'Hourly Rate'
      } as const;

      // Debug log each required field
      Object.entries(requiredFields).forEach(([key, label]) => {
        console.log(`${key} (${label}): ${data[key as keyof typeof data]}`);
      });

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !data[key as keyof typeof data])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Format date fields to 'yyyy-MM-dd'
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
      };
      data.date_of_birth = formatDate(data.date_of_birth);
      data.hire_date = formatDate(data.hire_date);
      // Add more date fields here if needed

      // Add all form data to the FormData object
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            // Handle arrays properly for Laravel
            if (value.length === 0) {
              formData.append(`${key}[]`, '');
            } else {
              value.forEach((item, index) => {
                if (typeof item === 'object') {
                  Object.entries(item).forEach(([subKey, subValue]) => {
                    formData.append(`${key}[${index}][${subKey}]`, subValue as string);
                  });
                } else {
                  formData.append(`${key}[]`, item);
                }
              });
            }
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      }

      // Add all files to the FormData object
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          formData.append(`files[${key}]`, file);
        }
      }

      // Debug log the form data
      console.log('FormData prepared, submitting...');

      // Determine if we're creating a new employee or updating an existing one
      if (isEditing && employee?.id) {
        // Update the employee
        const response = await axios.post(`/employees/${employee.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PUT', // Laravel recognizes this as a PUT request
          },
        });

        toast.success('Employee updated successfully');
        router.visit('/employees');
      } else {
        // Create a new employee
        const response = await axios.post('/employees', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Check for redirect URL in response
        if (response.data && response.data.redirect) {
          // Show success toast
          toast.success('Employee created successfully');

          // Use complete URL for redirection including protocol and host
          const url = new URL(response.data.redirect, window.location.origin);
          window.location.href = url.toString();
        } else {
          // Fallback to hardcoded URL if no redirect in response
          toast.success('Employee created successfully');
          window.location.href = `${window.location.origin}/employees`;
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'errors' in error.response.data &&
        error.response.data.errors &&
        typeof error.response.data.errors === 'object'
      ) {
        // Display the first validation error
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while saving the employee.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Employees', href: '/employees' },
    { title: 'Create Employee', href: window.location.pathname },
  ];

  return (
    <AppLayout
      title={isEditing ? "Edit Employee" : "Create Employee"}
      breadcrumbs={breadcrumbs}
      requiredPermission="employees.create"
    >
      <Head title={isEditing ? "Edit Employee" : "Create Employee"} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{isEditing ? "Edit Employee" : "Create Employee"}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/employees">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('btn_back_to_employees')}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit} className="space-y-8">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">{t('personal_info')}</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="salary">Salary</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                </TabsList>

                {/* Cost Summary */}
                <div className="p-4 border rounded-lg bg-muted">
                  <h3 className="text-lg font-medium mb-4">{t('cost_summary')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('total_certification_costs')}</p>
                      <p className="text-2xl font-bold">SAR {totalCertificationCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('calculated_hourly_rate')}</p>
                      <p className="text-2xl font-bold">SAR {hourlyRate.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <TabsContent value="personal">
                  <PersonalInfoTab form={form} />
                </TabsContent>

                <TabsContent value="employment">
                  <EmploymentDetailsTab form={form} positions={positions} users={users} />
                </TabsContent>

                <TabsContent value="salary">
                  <SalaryInfoTab form={form} />
                </TabsContent>

                <TabsContent value="documents">
                  <DocumentsTab form={form} files={files} setFiles={setFiles} />
                </TabsContent>

                <TabsContent value="certifications">
                  <CertificationsTab
                    form={form}
                    files={files}
                    setFiles={setFiles}
                    onTotalCostChange={setTotalCertificationCost}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Employee' : 'Create Employee'
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}



















