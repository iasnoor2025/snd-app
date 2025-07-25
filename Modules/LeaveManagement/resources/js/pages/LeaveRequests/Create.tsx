import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/Core';
import { FileUpload } from '@/Core/Components/ui';
import { PageProps } from '@/Core/types/index.d';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { toast } from 'sonner';

// Define a simple usePermission hook for this component
function usePermission() {
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
    employee_id: z.string().min(1, { message: 'Employee is required' }),
    leave_type: z.string().min(1, { message: 'Leave type is required' }),
    start_date: z.string().min(1, { message: 'Start date is required' }),
    end_date: z.string().min(1, { message: 'End date is required' }),
    reason: z.string().min(1, { message: 'Reason is required' }),
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

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Requests', href: '/leaves' },
    { title: 'Create', href: '#' },
];

export default function LeaveRequestCreate({ employees = [], currentUserOnly = false }: Props) {
    const { t } = useTranslation(['leave', 'common']);
    const { hasPermission } = usePermission();
    const [submitting, setSubmitting] = useState(false);
    const [isFormReady, setIsFormReady] = useState(false);
    const [safeEmployees, setSafeEmployees] = useState<Employee[]>([]);
    const [daysBetween, setDaysBetween] = useState<number | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value as any);
        });
        if (uploadedFile) {
            formData.append('document', uploadedFile);
        }
        router.post(route('leaves.requests.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Leave request created successfully');
                form.reset();
                router.visit('/leaves');
            },
            onError: (errors) => {
                toast.error('Failed to create leave request');
                if (errors && typeof errors === 'object') {
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key],
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
            <AppLayout>
                <Head title={t('ttl_loading')} />
                <div className="container mx-auto py-6">
                    <div className="flex h-64 items-center justify-center">
                        <p>Loading form...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={t('create_leave_request')} breadcrumbs={breadcrumbs} requiredPermission="leave-requests.create">
            <Head title={t('create_leave_request')} />
            <div className="container mx-auto py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <ClipboardList className="mr-2 h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">{t('create_leave_request')}</h1>
                    </div>
                    <Link href="/leaves">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Leave Requests
                        </Button>
                    </Link>
                </div>

                <Card className="shadow-md">
                    <CardHeader className="bg-muted/50">
                        <CardTitle>{t('ttl_new_leave_request')}</CardTitle>
                        <CardDescription>Create a new leave request for an employee</CardDescription>
                    </CardHeader>
                    <Form onSubmit={form.handleSubmit(handleSubmit)}>
                        <CardContent className="space-y-6 pt-6">
                            {/* Employee and Leave Type Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    <h3 className="text-sm font-medium">{t('request_details')}</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="employee_id"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Employee</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>{t('lbl_leave_type')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    <h3 className="text-sm font-medium">{t('leave_duration')}</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>{t('lbl_start_date')}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" id="start_date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="end_date"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>{t('end_date')}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" id="end_date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {daysBetween !== null && (
                                    <div className="flex items-center rounded-lg border bg-muted/5 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm font-semibold">Total Duration:</span>
                                            <span className="text-sm">
                                                {daysBetween} day{daysBetween !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    <h3 className="text-sm font-medium">{t('additional_information')}</h3>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Reason</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder={t('ph_reason_for_leave_request')} rows={3} id="reason" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }: { field: any }) => (
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

                            <div>
                                <label className="mb-1 block font-medium">Upload Leave Request Document</label>
                                <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t px-6 py-4">
                            <Link href={route('leaves.requests.index')}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                                <Save className="mr-2 h-4 w-4" />
                                {submitting ? 'Saving...' : 'Save Leave Request'}
                            </Button>
                        </CardFooter>
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}
