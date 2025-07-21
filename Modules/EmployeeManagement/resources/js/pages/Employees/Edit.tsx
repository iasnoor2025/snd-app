import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    getTranslation,
    Input,
    Select,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ToastService,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/Core';
import { PageProps, User } from '@/Core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import axios from 'axios';
axios.defaults.withCredentials = true;

// Placeholder components
const FileUpload = ({ field, name, onFileSelect }: { field: any; name: string; onFileSelect: (file: File) => void }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Input type="file" onChange={handleFileChange} className="max-w-xs" accept="image/*,.pdf" />
            {field.value && typeof field.value === 'string' && field.value.length > 0 && (
                <span className="text-sm text-muted-foreground">File uploaded</span>
            )}
        </div>
    );
};
const ExpiryDateInput = () => <div>ExpiryDateInput Placeholder</div>;
const SectionHeader = ({ children, title }: { children?: React.ReactNode; title?: string }) => (
    <div className="mb-4">
        {title && <h3 className="mb-2 text-lg font-medium">{title}</h3>}
        {children}
    </div>
);

// Placeholder constants for employee statuses and types
const EMPLOYEE_STATUSES = ['active', 'inactive', 'on_leave', 'exit'];
const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contractor'];

// Define form schema
const formSchema = z.object({
    file_number: z.string().optional(),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    nationality: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    designation_id: z.string().min(1, 'Designation is required'),
    department: z.string().optional(),
    join_date: z.string().optional(),
    status: z.string().optional(),
    basic_salary: z.number().min(0).optional(),
    hourly_rate: z.number().min(0).optional(),
    food_allowance: z.number().min(0).optional(),
    housing_allowance: z.number().min(0).optional(),
    transport_allowance: z.number().min(0).optional(),
    absent_deduction_rate: z.number().min(0).optional(),
    advance_payment: z.number().min(0).optional(),
    overtime_rate_multiplier: z.number().min(0).optional(),
    overtime_fixed_rate: z.number().min(0).optional(),
    contract_hours_per_day: z.number().min(0).optional(),
    contract_days_per_month: z.number().min(0).optional(),
    other_allowance: z.number().min(0).optional(),
    mobile_allowance: z.number().min(0).optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_iban: z.string().optional(),
});

interface Designation {
    id: number;
    name: string;
}

interface Props extends PageProps {
    employee: any;
    users: User[];
    designations: Designation[];
}

async function ensureSanctumCsrf() {
    await axios.get('/sanctum/csrf-cookie');
}

export default function Edit({ auth, employee, users, designations }: Props) {
    console.log('employee', employee);
    const { t } = useTranslation('employees');

    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('personal');
    const [files, setFiles] = useState<Record<string, File | null>>({
        passport: null,
        iqama: null,
        driving_license: null,
        operator_license: null,
        tuv_certification: null,
        spsp_license: null,
    });

    // Format date fields for defaultValues
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // Handles both ISO and already formatted dates
        return dateString.split('T')[0];
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            file_number: employee.file_number || '',
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            email: employee.user?.email || '',
            phone: employee.phone || '',
            date_of_birth: formatDate(employee.date_of_birth),
            nationality: employee.nationality || '',
            emergency_contact_name: employee.emergency_contact_name || '',
            emergency_contact_phone: employee.emergency_contact_phone || '',
            designation_id: employee.designation_id ? employee.designation_id.toString() : '',
            department: employee.department || '',
            join_date: formatDate(employee.join_date),
            status: employee.status || 'active',
            basic_salary: employee.basic_salary || 0,
            hourly_rate: employee.hourly_rate || 0,
            food_allowance: employee.food_allowance || 0,
            housing_allowance: employee.housing_allowance || 0,
            transport_allowance: employee.transport_allowance || 0,
            absent_deduction_rate: employee.absent_deduction_rate || 0,
            advance_payment: employee.advance_payment || 0,
            overtime_rate_multiplier: employee.overtime_rate_multiplier || 1.5,
            overtime_fixed_rate: employee.overtime_fixed_rate || 0,
            contract_hours_per_day: employee.contract_hours_per_day || 8,
            contract_days_per_month: employee.contract_days_per_month || 30,
            other_allowance: employee.other_allowance || 0,
            mobile_allowance: employee.mobile_allowance || 0,
            bank_name: employee.bank_name || '',
            bank_account_number: employee.bank_account_number || '',
            bank_iban: employee.bank_iban || '',
        },
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            await ensureSanctumCsrf();
            const response = await axios.get(`/api/v1/employees/${employee.id}/documents`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            ToastService.error('Failed to fetch documents');
        }
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        const loadingToastId = ToastService.loading('Updating employee...');

        try {
            // Format date fields to 'yyyy-MM-dd'
            const formatDate = (dateString: string) => {
                if (!dateString) return '';
                return dateString.split('T')[0];
            };
            const formattedData = {
                ...data,
                designation_id: data.designation_id ? parseInt(data.designation_id) : null,
                basic_salary: data.basic_salary || 0,
                hourly_rate: data.hourly_rate || 0,
                food_allowance: data.food_allowance || 0,
                housing_allowance: data.housing_allowance || 0,
                transport_allowance: data.transport_allowance || 0,
                absent_deduction_rate: data.absent_deduction_rate || 0,
                advance_payment: data.advance_payment || 0,
                overtime_rate_multiplier: data.overtime_rate_multiplier || 1.5,
                overtime_fixed_rate: data.overtime_fixed_rate || 0,
                contract_hours_per_day: data.contract_hours_per_day || 8,
                contract_days_per_month: data.contract_days_per_month || 30,
                other_allowance: data.other_allowance || 0,
                mobile_allowance: data.mobile_allowance || 0,
                date_of_birth: formatDate(data.date_of_birth),
                join_date: formatDate(data.join_date),
            };

            // Add all form data to the FormData object
            const formData = new FormData();
            for (const [key, value] of Object.entries(formattedData)) {
                if (value !== null && value !== undefined) {
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            }

            // Add files to FormData if they exist
            for (const [key, file] of Object.entries(files)) {
                if (file) {
                    formData.append(key, file);
                }
            }

            // Send the update request
            await router.post(route('employees.update', { employee: employee.id }), formData, {
                forceFormData: true,
                onSuccess: () => {
                    ToastService.success('Employee updated successfully');
                    router.visit(route('employees.show', { employee: employee.id }));
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);

                    // Handle validation errors
                    if (errors) {
                        Object.keys(errors).forEach((field) => {
                            ToastService.error(`Validation error: ${field}`);
                        });
                    } else {
                        ToastService.error('Failed to update employee');
                    }
                },
                onFinish: () => {
                    setIsLoading(false);
                    ToastService.dismiss(loadingToastId);
                },
            });
        } catch (error: any) {
            console.error('Error updating employee:', error);
            ToastService.error('Failed to update employee');
            setIsLoading(false);
            ToastService.dismiss(loadingToastId);
        }
    };

    const handleFileUpload = async (file: File, documentType: string) => {
        if (!file) {
            ToastService.error('No file selected');
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            ToastService.error(`Invalid file type. Allowed types: ${allowedTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}`);
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            ToastService.error('File size exceeds 10MB');
            return;
        }

        const loadingToastId = ToastService.loading(`Uploading ${documentType}...`);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_type', documentType);

            await router.post(route('employees.documents.upload', { employee: employee.id }), formData, {
                forceFormData: true,
                onSuccess: () => {
                    ToastService.dismiss(loadingToastId);
                    ToastService.documentUploaded(employee.first_name + ' ' + employee.last_name, documentType);
                    fetchDocuments();
                },
                onError: (errors) => {
                    ToastService.dismiss(loadingToastId);
                    const errorMessage = errors?.file?.[0] || errors?.message || 'Failed to upload document';
                    ToastService.documentUploadFailed(documentType, errorMessage);
                },
            });
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            ToastService.employeeProcessFailed('upload document', error.message);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: `Edit ${employee.name}`, href: window.location.pathname },
    ];

    return (
        <AppLayout
            title={`Edit Employee: ${employee.name}`}
            breadcrumbs={breadcrumbs}
            requiredPermission="employees.edit"
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/employees">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-xl font-semibold">{t('edit_employee')}</h2>
                    </div>
                    <Button type="submit" form="employee-edit-form" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            <Head title={t('edit_employee')} />

            <div className="container mx-auto py-6">
                <Form>
                    <form id="employee-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList>
                                <TabsTrigger value="personal">{t('personal_information')}</TabsTrigger>
                                <TabsTrigger value="employment">{t('employment_details')}</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="salary">Salary & Benefits</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('personal_information')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <SectionHeader title={t('ttl_basic_information')} />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="file_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Employee File #</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-10" {...field} placeholder="Enter employee file number" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="first_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_first_name')}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="First name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="last_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_last_name')}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Last name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={t('ph_email')} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Phone number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="date_of_birth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('date_of_birth')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="nationality"
                                                render={({ field }: any) => (
                                                    <FormItem>
                                                        <FormLabel>Nationality</FormLabel>
                                                        <FormControl>
                                                            <Select value={field.value || ''} onValueChange={field.onChange}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select nationality" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[
                                                                        'Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'Oman', 'Yemen', 'Egypt', 'India', 'Pakistan', 'Bangladesh', 'Philippines', 'Sri Lanka', 'Nepal', 'Sudan',
                                                                    ].map((country) => (
                                                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <SectionHeader title={t('emergency_contact')} />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="emergency_contact_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_emergency_contact_name')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Enter emergency contact name" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="emergency_contact_phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_emergency_contact_phone')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="+966 50 123 4567" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="employment">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('employment_details')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <SectionHeader title={t('ttl_job_information')} />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="designation_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Designation</FormLabel>
                                                        <FormControl>
                                                            <Select value={field.value || ''} onValueChange={field.onChange} required>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select designation" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {designations.map((designation) => (
                                                                        <SelectItem key={designation.id} value={designation.id.toString()}>
                                                                            {designation.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="department"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Department</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t('ph_enter_department')} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="join_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('join_date')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
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
                                                        <FormControl>
                                                            <Select value={field.value || ''} onValueChange={field.onChange}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {['active', 'inactive', 'on_leave', 'exit'].map((status) => (
                                                                        <SelectItem key={status} value={status}>
                                                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="documents">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Documents</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <SectionHeader title={t('ttl_required_documents')} />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="passport"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passport</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="passport"
                                                                onFileSelect={(file) => handleFileUpload(file, 'passport')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="iqama"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Iqama</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="iqama"
                                                                onFileSelect={(file) => handleFileUpload(file, 'iqama')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="driving_license"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('driving_license')}</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="driving_license"
                                                                onFileSelect={(file) => handleFileUpload(file, 'driving_license')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="operator_license"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_operator_license')}</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="operator_license"
                                                                onFileSelect={(file) => handleFileUpload(file, 'operator_license')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tuv_certification"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>TUV Certification</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="tuv_certification"
                                                                onFileSelect={(file) => handleFileUpload(file, 'tuv_certification')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="spsp_license"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>SPSP License</FormLabel>
                                                        <FormControl>
                                                            <FileUpload
                                                                field={field}
                                                                name="spsp_license"
                                                                onFileSelect={(file) => handleFileUpload(file, 'spsp_license')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <SectionHeader title={t('ttl_document_costs')} />
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="iqama_cost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_iqama_cost')}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="driving_license_cost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_driving_license_cost')}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="operator_license_cost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('lbl_operator_license_cost')}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tuv_certification_cost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>TUV Certification Cost</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="spsp_license_cost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>SPSP License Cost</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="salary">
                                <SalaryInfoTab form={form} /> 
                            </TabsContent>
                        </Tabs>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
