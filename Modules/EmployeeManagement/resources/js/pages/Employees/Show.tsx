import type { BreadcrumbItem } from '@/Core';
import {
    Alert,
    AlertDescription,
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    getTranslation,
    Input,
    Label,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ToastService,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    usePermission,
} from '@/Core';
import type { PageProps } from '@inertiajs/core';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format, subMonths } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Calendar,
    Check,
    Clock,
    CreditCard,
    Download,
    Edit,
    FileBox,
    FileText,
    History,
    Printer,
    Receipt,
    RefreshCw,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Employee as BaseEmployee } from '../../types/models/index';
axios.defaults.withCredentials = true;
// Replace static imports with React.lazy for large components
const DocumentManager = React.lazy(() => import('../../components/employees/EmployeeDocumentManager'));
const FinalSettlementTab = React.lazy(() => import('../../components/employees/FinalSettlementTab'));
// Commented out lazy imports for missing modules
// const TimesheetSummary = React.lazy(() => import('../../components/employees/timesheets/TimesheetSummary.lazy'));
// const TimesheetList = React.lazy(() => import('../../components/employees/timesheets/TimesheetList.lazy'));
// const TimesheetForm = React.lazy(() => import('../../components/employees/timesheets/TimesheetForm.lazy'));
// const AssignmentHistory = React.lazy(() => import('../../components/assignments/AssignmentHistory.lazy'));
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Textarea } from '@/Core';
import { useQueryClient } from '@tanstack/react-query';
import { route } from 'ziggy-js';
import { TimesheetForm } from '../../components/employees/timesheets/TimesheetForm';
import { TimesheetList } from '../../components/employees/timesheets/TimesheetList';
import { TimesheetSummary } from '../../components/employees/timesheets/TimesheetSummary';

// MediaLibrary and DailyTimesheetRecords components - implement as needed
const MediaLibrary = ({ employeeId }: { employeeId: number }) => (
    <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Media Library</h3>
        <p className="text-sm text-muted-foreground">Media library functionality coming soon...</p>
    </div>
);

const DailyTimesheetRecords = ({ employeeId }: { employeeId: number }) => (
    <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Daily Timesheet Records</h3>
        <p className="text-sm text-muted-foreground">Timesheet records will be displayed here...</p>
    </div>
);

// PaymentHistory component placeholder
const PaymentHistory = ({ employeeId }: { employeeId: number }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetch(`/employees/${employeeId}/advances/history/api`)
            .then((res) => res.json())
            .then((data) => {
                // Try to support both {data: []} and {payments: []} API responses
                setPayments(data?.data || data?.payments || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [employeeId]);
    if (loading) return <div className="p-4 text-center text-muted-foreground">Loading payment history...</div>;
    if (!payments.length) return <div className="p-4 text-center text-muted-foreground">No repayments found.</div>;
    return (
        <Card className="mt-6 shadow-sm border border-gray-200 bg-white rounded-lg">
            <CardHeader className="bg-muted/50 rounded-t-lg p-4 flex flex-row items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Repayment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">
                                        No repayments found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p, i) => (
                                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">SAR {Number(p.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{p.payment_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{p.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const getBreadcrumbs = (t: any): BreadcrumbItem[] => [
    {
        title: t('dashboard'),
        href: '/dashboard',
    },
    {
        title: t('employees'),
        href: '/employees',
    },
    {
        title: t('employee_details'),
        href: '/employees/show',
    },
];

// Extend the Employee interface with additional properties needed in this component
type Designation = { name: string } | string;
interface Employee extends Omit<BaseEmployee, 'file_number'> {
    designation?: any;
    emergency_contact_name: any;
    emergency_contact_phone: any;
    file_number?: string;
    department?: string;
    supervisor?: string;
    erp_employee_id?: string;
    nationality: string;
    iqama_number?: string;
    iqama_expiry?: string;
    iqama_cost?: number;
    iqama_file?: string;
    passport_number?: string;
    passport_expiry?: string;
    passport_file?: string;
    date_of_birth?: string;
    driving_license_number?: string;
    driving_license_expiry?: string;
    driving_license_cost?: number;
    driving_license_file?: string;
    operator_license_number?: string;
    operator_license_expiry?: string;
    operator_license_cost?: number;
    operator_license_file?: string;
    tuv_certification_number?: string;
    tuv_certification_expiry?: string;
    tuv_certification_cost?: number;
    tuv_certification_file?: string;
    spsp_license_number?: string;
    spsp_license_expiry?: string;
    spsp_license_cost?: number;
    spsp_license_file?: string;
    hourly_rate?: number;
    monthly_deduction?: number;
    current_location?: string;
    payrolls?: {
        id: number;
        salary_month: string;
        paid_date: string | null;
        paid_amount: number;
        is_paid: boolean;
    }[];
    resignations?: {
        id: number;
        last_working_day: string;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
        created_at: string;
    }[];
    custom_certifications?: any[];
}

// Extend the Timesheet interface with additional properties
interface Timesheet {
    clock_in?: string;
    clock_out?: string;
    regular_hours?: number;
    status?: string;
    [key: string]: any;
}

// Extend the LeaveRequest interface with additional properties
interface LeaveRequest {
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    return_date?: string;
    returner?: {
        id: number;
        name: string;
    };
    [key: string]: any;
}

interface Advance {
    id: number;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partially_repaid';
    created_at: string;
    rejection_reason?: string;
    repayment_date?: string;
    type: 'advance' | 'advance_payment';
    monthly_deduction?: number;
    repaid_amount?: number;
    remaining_balance?: number;
}

// Add Payment type for MonthlyHistoryItem
interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    notes?: string;
    recorded_by?: string;
    advance_payment_id?: number;
}

interface MonthlyHistoryItem {
    month: string;
    total_amount: number;
    payments: Payment[];
}

interface Props extends PageProps {
    employee: Employee;
    timesheets: {
        data: any[];
    };
    leaveRequests: {
        data: LeaveRequest[];
    };
    advances: {
        data: Advance[];
    };
    assignments: any;
    finalSettlements: any;
    monthlyHistory: any;
    totalRepaid: number;
    pagination: any;
    current_balance: number;
}

// This component will be used within the Tabs to load documents with error handling
const DocumentTab = ({ employeeId }: { employeeId: number }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [retryCount, setRetryCount] = useState(0);
    const { t } = useTranslation(['EmployeeManagement', 'common']);

    // Direct API fetch without DocumentManager
    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            setHasError(false);
            setErrorMessage(null);

            try {
                console.log(`Fetching documents for employee ${employeeId}`);
                const response = await axios.get(`/api/employee/${employeeId}/documents?t=${new Date().getTime()}`);

                // If successful, use the documents from the response
                console.log('Document response:', response.data);
                setDocuments(Array.isArray(response.data) ? response.data : []);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                setHasError(true);
                setErrorMessage('Failed to load documents. Please try again.');
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [employeeId, retryCount]);

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading documents...</span>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <div className="text-center">
                    <div className="font-medium text-red-600">{t('document_service_error')}</div>
                    <div className="mt-1 text-sm text-red-600">{errorMessage || 'Failed to load documents. Please try again.'}</div>
                    <div className="mt-4 flex justify-center">
                        <Button variant="outline" onClick={handleRetry} className="bg-white">
                            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If we have no documents, show empty state
    if (documents.length === 0) {
        return (
            <div className="rounded-lg bg-muted/30 p-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">{t('no_documents')}</h3>
                <p className="mb-6 text-sm text-muted-foreground">This employee doesn't have any documents uploaded yet.</p>
            </div>
        );
    }

    // Render documents list
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="truncate text-base" title={doc.name}>
                            {doc.name || 'Unnamed Document'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {doc.file_type ? doc.file_type.toUpperCase() : 'Unknown'} • {formatFileSize(doc.size || 0)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/api/employee/${employeeId}/documents/${doc.id}/download`} download>
                                    <Download className="mr-1 h-3.5 w-3.5" />
                                    Download
                                </a>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this document?')) {
                                        axios
                                            .delete(`/api/v1/employees/${employeeId}/documents/${doc.id}`)
                                            .then(() => {
                                                ToastService.success(`${doc.file_type || 'Document'} deleted successfully`);
                                            })
                                            .catch((error) => {
                                                ToastService.error(`Failed to delete ${doc.file_type || 'Document'}`);
                                            });
                                    }
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

async function ensureSanctumCsrf() {
    await axios.get('/sanctum/csrf-cookie');
}

export default function Show({
    employee,
    timesheets = { data: [] },
    leaveRequests = { data: [] },
    advances = { data: [] },
    assignments = { data: [] },
    finalSettlements = { data: [] },
    monthlyHistory: initialMonthlyHistory = { data: [] },
    totalRepaid: initialTotalRepaid = 0,
    pagination: initialPagination = {},
    current_balance = 0,
}: Props) {
    const { t } = useTranslation(['EmployeeManagement', 'common', 'employees']);
    const breadcrumbs = getBreadcrumbs(t);

    // Add console log for debugging
    console.log('Employee data:', employee);
    console.log('Advances data:', advances);
    console.log('Assignments data:', assignments);
    console.log('Timesheets data:', timesheets);
    console.log('Leave requests data:', leaveRequests);

    // Debug log for assignments
    console.log('Assignments prop:', assignments);

    const [isDeleting, setIsDeleting] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [monthlyDeduction, setMonthlyDeduction] = useState(advances?.data?.[0]?.monthly_deduction?.toString() || '');
    const [advanceReason, setAdvanceReason] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [isAdvanceRequestDialogOpen, setIsAdvanceRequestDialogOpen] = useState(false);
    const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAdvance, setSelectedAdvance] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [activeTab, setActiveTab] = useState('personal-info');
    const [documentUploadKey, setDocumentUploadKey] = useState(0);
    const { hasPermission } = usePermission();
    const queryClient = useQueryClient();
    const [selectedPayslipDate, setSelectedPayslipDate] = useState(new Date());
    const [isAddTimesheetDialogOpen, setIsAddTimesheetDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isManualAssignmentDialogOpen, setIsManualAssignmentDialogOpen] = useState(false);
    const [manualAssignment, setManualAssignment] = useState({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        notes: '',
    });
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    // Add state for editing assignment
    const [isEditAssignmentDialogOpen, setIsEditAssignmentDialogOpen] = useState(false);
    const [editAssignment, setEditAssignment] = useState<any>(null);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    // Add state for deleting assignment
    const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
    const [deleteAssignmentId, setDeleteAssignmentId] = useState<number | null>(null);

    // On mount, check for ?tab=advances and set advances tab active
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'advances') {
                setActiveTab('advances');
            }
        }
    }, []);

    // Early return if no valid employee data
    if (!employee || !employee.id) {
        return (
            <AppLayout title={t('employee_not_found')} breadcrumbs={getBreadcrumbs(t)}>
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="outline" asChild>
                            <a href={route('employees.index')} className="flex items-center">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('btn_back_to_employees')}
                            </a>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Use the getBreadcrumbs function instead of redefining breadcrumbs
    const currentBreadcrumbs = getBreadcrumbs(t);

    const handleDocumentDelete = async (documentId: number, documentType: string) => {
        try {
            await ensureSanctumCsrf();
            await axios.delete(`/api/v1/employees/${employee.id}/documents/${documentId}`);
            ToastService.success(`${documentType} deleted successfully`);
            // fetchDocuments(); // Commented out as fetchDocuments is not defined
        } catch (error) {
            console.error('Error deleting document:', error);
            ToastService.error(`Failed to delete ${documentType}`);
        }
    };

    const handleFileUpload = async (file: File, documentType: string) => {
        if (!file) {
            ToastService.error('No file selected');
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            ToastService.error(`Invalid file type. Allowed types: ${allowedTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}`);
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            ToastService.error('File size exceeds 10MB');
            return;
        }

        const loadingToastId = ToastService.loading(`Uploading ${documentType.replace('_', ' ')}...`);

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', documentType);

            await axios.post(`/api/v1/employees/${employee.id}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            ToastService.dismiss(loadingToastId);
            ToastService.success(`${documentType.replace('_', ' ')} uploaded successfully`);
            // fetchDocuments(); // Commented out as fetchDocuments is not defined
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to upload ${documentType.replace('_', ' ')}: ${errorMessage}`);
        }
    };

    const handleAdvanceRequest = async (data: any) => {
        const { amount, monthly_deduction, reason } = data;

        if (!amount || amount <= 0) {
            ToastService.error('Invalid advance amount');
            return false;
        }

        if (!monthly_deduction || monthly_deduction <= 0) {
            ToastService.error('Invalid monthly deduction amount');
            return false;
        }

        if (!reason) {
            ToastService.error('Advance reason is required');
            return false;
        }

        const loadingToastId = ToastService.loading('Processing advance request...');

        try {
            await axios.post(`/employees/${employee.id}/advances`, {
                amount,
                monthly_deduction,
                reason,
                payment_date: new Date().toISOString().slice(0, 10),
                estimated_months: 1, // Default to 1 month
            });

            ToastService.dismiss(loadingToastId);
            ToastService.success(`Advance request of SAR ${amount} created successfully`);
            router.visit(`/employees/${employee.id}`);
            return true;
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            // Show backend error message and raw error for debugging
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to create advance request: ${errorMessage}`);
            if (error.response?.data) {
                ToastService.error(`Debug: ${JSON.stringify(error.response.data)}`);
            }
            return false;
        }
    };

    const handleDelete = async () => {
        if (!hasPermission('employees.delete')) {
            ToastService.error('You do not have permission to delete employees');
            return;
        }

        const loadingToastId = ToastService.loading('Deleting employee...');

        try {
            await axios.delete(`/api/employees/${employee.id}`);
            ToastService.dismiss(loadingToastId);
            ToastService.success(`${employee.first_name} ${employee.last_name} deleted successfully`);
            router.visit('/employees');
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to delete employee: ${errorMessage}`);
        }
    };

    const getStatusBadge = (status: string) => {
        if (!status) return null;

        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        Active
                    </Badge>
                );
            case 'inactive':
                return <Badge variant="destructive">Inactive</Badge>;
            case 'on_leave':
                return (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                        {t('on_leave')}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleRepayment = async (data: any) => {
        const { amount } = data;

        if (!amount || amount <= 0) {
            ToastService.error('Invalid repayment amount');
            return;
        }

        const loadingToastId = ToastService.loading('Recording repayment...');

        try {
            await ensureSanctumCsrf();
            await axios.post(`/employees/${employee.id}/advances/${data.advance_id}/repayment`, {
                amount,
                payment_date: new Date().toISOString().slice(0, 10),
                notes: 'Manual repayment',
            }, { withCredentials: true });
            ToastService.dismiss(loadingToastId);
            ToastService.success(`Repayment of SAR ${amount} recorded successfully`);
            router.visit(`/employees/${employee.id}?tab=advances`);
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to record repayment: ${errorMessage}`);
        }
    };

    const handleAdvanceApproval = async (advanceId?: number) => {
        const idToApprove = advanceId || (advances?.data?.[0]?.id ?? null);
        if (!idToApprove) {
            ToastService.error('No advances available to approve.');
            return;
        }
        const loadingToastId = ToastService.loading('Approving advance...');
        try {
            await ensureSanctumCsrf();
            await axios.post(`/employees/${employee.id}/advances/${idToApprove}/approve`, {}, { withCredentials: true });
            ToastService.dismiss(loadingToastId);
            ToastService.success('Advance approved successfully');
            router.visit(`/employees/${employee.id}?tab=advances`);
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            ToastService.error('Failed to approve advance: ' + (error?.response?.data?.message || error.message));
        }
    };

    const handleAdvanceRejection = async (advanceId: number, reason: string) => {
        const loadingToastId = ToastService.loading('Rejecting advance...');
        try {
            await ensureSanctumCsrf();
            await axios.post(`/employees/${employee.id}/advances/${advanceId}/reject`, { reason }, { withCredentials: true });
            ToastService.dismiss(loadingToastId);
            router.visit(window.location.pathname);
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            ToastService.error('Failed to reject advance: ' + (error?.response?.data?.message || error.message));
        }
    };

    const handleAdvanceDelete = async (advanceId?: number) => {
        if (!advanceId) {
            ToastService.error('No valid advance selected for deletion.');
            return;
        }
        const loadingToastId = ToastService.loading('Deleting advance...');
        try {
            const url = `/employees/${employee.id}/advances/${advanceId}`;
            console.log('Deleting advance with URL:', url);
            await ensureSanctumCsrf();
            const response = await axios.delete(url, {
                headers: { 'Accept': 'application/json' },
            });
            ToastService.dismiss(loadingToastId);
            if (response.data?.success) {
                ToastService.success(response.data.message || 'Advance deleted successfully');
                router.visit(window.location.pathname);
            } else {
                ToastService.error(response.data?.message || 'Failed to delete advance');
            }
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const msg = error?.response?.data?.message || error.message;
            ToastService.error('Failed to delete advance: ' + msg);
        }
    };

    // Function to handle tab changes with document loading control
    const handleTabChange = (value: string) => {
        if (value === 'advances' && !hasPermission('advances.view')) {
            ToastService.error('You do not have permission to view advances');
            return;
        }
        setActiveTab(value);
    };

    // Function to handle document upload dialog
    const handleDocumentUploadSuccess = () => {
        setDocumentUploadKey((prev) => prev + 1);
    };

    const getLeaveTypeName = (type: string) => {
        const leaveTypes = {
            annual: 'Annual Leave',
            sick: 'Sick Leave',
            personal: 'Personal Leave',
            unpaid: 'Unpaid Leave',
            maternity: 'Maternity Leave',
            paternity: 'Paternity Leave',
            bereavement: 'Bereavement Leave',
            other: 'Other',
        };
        return leaveTypes[type as keyof typeof leaveTypes] || type;
    };

    // Add these functions to handle view all navigation
    const handleViewAllTimesheets = () => {
        router.get(route('hr.api.timesheets.index'), {
            employee_id: employee.id,
        });
    };

    const handleViewAllLeaveRecords = () => {
        router.get(route('leave-requests.index'), {
            employee_id: employee.id,
        });
    };

    // Add this function to handle month change
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMonth(e.target.value);
        router.get(
            route('employees.show', { employee: employee.id }),
            {
                month: e.target.value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Add this function to calculate monthly summary with null checks
    const calculateMonthlySummary = (timesheetData: any[] = []) => {
        if (!timesheetData) {
            timesheetData = [];
        }

        const summary = {
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalDays: 0,
            daysWorked: 0,
            daysAbsent: 0,
            daysOnLeave: 0,
            status: {
                approved: 0,
                pending: 0,
                rejected: 0,
            } as Record<string, number>,
        };

        timesheetData.forEach((timesheet) => {
            if (!timesheet) return;

            summary.totalRegularHours += Number(timesheet?.regular_hours || timesheet?.hours_worked || 0);
            summary.totalOvertimeHours += Number(timesheet?.overtime_hours || 0);
            summary.daysWorked++;
            if (timesheet?.status) {
                summary.status[timesheet.status] = (summary.status[timesheet.status] || 0) + 1;
            }
        });

        // Calculate total days in month
        const [year, month] = selectedMonth.split('-');
        if (year && month) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);
            summary.totalDays = endDate.getDate();
        } else {
            summary.totalDays = 30; // Default fallback
        }

        // Calculate absent days
        summary.daysAbsent = summary.totalDays - summary.daysWorked;

        return summary;
    };

    // Add this function to format daily records
    const formatDailyRecords = (timesheets: any[]) => {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        const daysInMonth = endDate.getDate();

        // Create an array for all days in the month
        const dailyRecords = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(Number(year), Number(month) - 1, i + 1);
            return {
                date: format(date, 'yyyy-MM-dd'),
                day: format(date, 'd'),
                dayName: format(date, 'EEE'),
                regularHours: 0,
                overtimeHours: 0,
                status: 'absent',
                isWeekend: date.getDay() === 0 || date.getDay() === 6, // 0 is Sunday, 6 is Saturday
            };
        });

        // Fill in the timesheet data
        timesheets.forEach((timesheet) => {
            const date = format(new Date(timesheet.date), 'yyyy-MM-dd');
            const record = dailyRecords.find((r) => r.date === date);
            if (record) {
                record.regularHours = Number(timesheet?.regular_hours || timesheet?.hours_worked || 0);
                record.overtimeHours = Number(timesheet?.overtime_hours || 0);
                record.status = timesheet?.status || 'present';
            }
        });

        return dailyRecords;
    };

    // Add this function to calculate days between dates
    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1; // Include both start and end dates
    };

    // Add this function to get repayment status display
    const getRepaymentStatus = (advance: Advance) => {
        if (advance.status === 'paid') {
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                    {t('fully_repaid')}
                </Badge>
            );
        }

        if (advance.status === 'partially_repaid' || (advance.status === 'approved' && advance.repaid_amount && Number(advance.repaid_amount) > 0)) {
            const repaidPercent = Math.round((Number(advance.repaid_amount) / Number(advance.amount)) * 100);
            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Partially Repaid ({repaidPercent}%)
                    </Badge>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                        <div className="h-1.5 rounded-full bg-yellow-500" style={{ width: `${repaidPercent}%` }}></div>
                    </div>
                </div>
            );
        }

        return <Badge variant={getBadgeVariant(advance.status)}>{advance.status}</Badge>;
    };

    // Helper to get badge variant based on status
    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'paid':
                return 'default';
            case 'partially_repaid':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const handleSettlementApproval = async () => {
        const loadingToastId = ToastService.loading('Approving settlement...');

        try {
            await axios.post(`/api/employees/${employee.id}/settlement/approve`);
            ToastService.dismiss(loadingToastId);
            ToastService.success('Settlement approved successfully');
            router.visit(`/employees/${employee.id}/settlement`);
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to approve settlement: ${errorMessage}`);
        }
    };

    const handleSettlementRejection = async () => {
        const loadingToastId = ToastService.loading('Rejecting settlement...');

        try {
            await axios.post(`/api/employees/${employee.id}/settlement/reject`);
            ToastService.dismiss(loadingToastId);
            ToastService.success('Settlement rejected successfully');
            router.visit(`/employees/${employee.id}/settlement`);
        } catch (error: any) {
            ToastService.dismiss(loadingToastId);
            const errorMessage = error.response?.data?.message || error.message;
            ToastService.error(`Failed to reject settlement: ${errorMessage}`);
        }
    };

    const handleManualAssignmentSubmit = async () => {
        setIsSubmittingManual(true);
        try {
            await ensureSanctumCsrf();
            await axios.post(`/api/v1/employees/${employee.id}/assignments`, {
                ...manualAssignment,
                type: 'manual',
            });
            setIsManualAssignmentDialogOpen(false);
            setManualAssignment({ name: '', location: '', start_date: '', end_date: '', notes: '' });
            ToastService.success('Manual assignment created successfully.');
            router.reload();
        } catch (e) {
            ToastService.error('Failed to add manual assignment');
        } finally {
            setIsSubmittingManual(false);
        }
    };

    // Compute current assignment and history from assignments.data
    const sortedAssignments = Array.isArray(assignments?.data)
        ? [...assignments.data].sort((a, b) => {
              const aDate = a.start_date ? new Date(a.start_date) : a.created_at ? new Date(a.created_at) : new Date(0);
              const bDate = b.start_date ? new Date(b.start_date) : b.created_at ? new Date(b.created_at) : new Date(0);
              return bDate.getTime() - aDate.getTime();
          })
        : [];
    // Show the assignment with the latest start_date as current
    const currentAssignment =
        sortedAssignments.length > 0
            ? sortedAssignments.reduce((latest, curr) => {
                  if (!latest) return curr;
                  const latestDate = latest.start_date ? new Date(latest.start_date) : new Date(0);
                  const currDate = curr.start_date ? new Date(curr.start_date) : new Date(0);
                  return currDate > latestDate ? curr : latest;
              }, null)
            : null;
    // All others go to history (exclude current assignment)
    const strictAssignmentHistory = sortedAssignments.filter((a) => !currentAssignment || a.id !== currentAssignment.id);

    return (
        <AppLayout
            title={employee ? `${employee.first_name || ''} ${employee.last_name || ''}` : 'Employee Details'}
            breadcrumbs={currentBreadcrumbs}
            requiredPermission="employees.view"
        >
            <Head title={t('ttl_employee_details')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {employee?.first_name?.[0] || ''}
                                {employee?.last_name?.[0] || ''}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {employee?.first_name || ''} {employee?.middle_name ? `${employee.middle_name} ` : ''}
                                {employee?.last_name || ''}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{getTranslation(employee.designation?.name ?? employee.designation)}</span>
                                <span className="text-xs">•</span>
                                <span>ID: {employee?.employee_id || 'N/A'}</span>
                                {employee?.status && getStatusBadge(employee.status)}
                                <span className="text-xs">•</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        !employee?.current_location
                                            ? 'border-gray-200 bg-gray-50 text-gray-500'
                                            : employee.current_location === 'Available'
                                              ? 'border-green-200 bg-green-50 text-green-700'
                                              : employee.current_location === 'Inactive'
                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                : employee.current_location.startsWith('On Leave')
                                                  ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                  : 'border-blue-200 bg-blue-50 text-blue-700'
                                    }
                                >
                                    {employee?.current_location || 'Not Assigned'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route('employees.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </a>
                        </Button>
                        {hasPermission('employees.edit') && (
                            <Button size="sm" asChild>
                                <a href={route('employees.edit', { employee: employee.id })}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </a>
                            </Button>
                        )}
                        {hasPermission('employees.delete') && (
                            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                        <Button size="sm" asChild>
                            <a href={`/employees/${employee.id}/advances`}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                View Advances
                            </a>
                        </Button>
                        {hasPermission('resignations.create') && (
                            <Button size="sm" asChild>
                                <a href={route('resignations.create', { employee: employee.id })}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Submit Resignation
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <Separator />

                <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="personal-info" className="w-full">
                    <TabsList className="flex w-full justify-between rounded-lg border bg-muted/30 p-1 shadow-sm">
                        <TabsTrigger
                            value="personal-info"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">{t('personal_info')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="employment"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <Briefcase className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Employment</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <FileBox className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="assignments"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Assignments</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="timesheets"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <Clock className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Timesheets</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="leaves"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Leaves</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="advances"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Advances</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="resignations"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">Resignations</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="final-settlements"
                            className="flex items-center gap-2 px-3 py-2 whitespace-nowrap transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <Receipt className="h-4 w-4" />
                            <span className="hidden font-medium sm:inline">{t('final_settlement')}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal-info" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('personal_information')}</CardTitle>
                                <CardDescription>{t('personal_and_identification_details')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('contact_information')}</h3>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('full_name')}</dt>
                                                    <dd className="text-sm">
                                                        {employee.first_name} {employee.middle_name ? `${employee.middle_name} ` : ''}
                                                        {employee.last_name}
                                                    </dd>
                                                </div>
                                                {/* <div className="flex justify-between border-b pb-2">
                          <dt className="text-sm font-medium">Email</dt>
                          <dd className="text-sm">{employee.user?.email || 'Not set'}</dd>
                        </div> */}
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('employees:fields.phone')}</dt>
                                                    <dd className="text-sm">{employee.phone || 'Not set'}</dd>
                                                </div>
                                                {employee.nationality && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('employees:fields.nationality')}</dt>
                                                        <dd className="text-sm">{employee.nationality}</dd>
                                                    </div>
                                                )}
                                                {employee.date_of_birth && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('date_of_birth')}</dt>
                                                        <dd className="text-sm">{format(new Date(employee.date_of_birth), 'PPP')}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>

                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('emergency_contact')}</h3>
                                            {employee.emergency_contact_name || employee.emergency_contact_phone ? (
                                                <dl className="space-y-2">
                                                    {employee.emergency_contact_name && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">Name</dt>
                                                            <dd className="text-sm">{employee.emergency_contact_name}</dd>
                                                        </div>
                                                    )}
                                                    {employee.emergency_contact_phone && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">Phone</dt>
                                                            <dd className="text-sm">{employee.emergency_contact_phone}</dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">{t('no_emergency_contact_information')}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('identification')}</h3>
                                            <dl className="space-y-2">
                                                {employee.iqama_number && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('iqama_number')}</dt>
                                                        <dd className="text-sm">{employee.iqama_number}</dd>
                                                    </div>
                                                )}
                                                {employee.iqama_expiry && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('iqama_expiry')}</dt>
                                                        <dd className="text-sm">{format(new Date(employee.iqama_expiry), 'PPP')}</dd>
                                                    </div>
                                                )}
                                                {employee.passport_number && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('lbl_passport_number')}</dt>
                                                        <dd className="text-sm">{employee.passport_number}</dd>
                                                    </div>
                                                )}
                                                {employee.passport_expiry && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('lbl_passport_expiry')}</dt>
                                                        <dd className="text-sm">{format(new Date(employee.passport_expiry), 'PPP')}</dd>
                                                    </div>
                                                )}
                                                {!employee.iqama_number && !employee.passport_number && !employee.date_of_birth && (
                                                    <p className="text-sm text-muted-foreground italic">
                                                        {t('no_identification_information_available')}
                                                    </p>
                                                )}
                                            </dl>
                                        </div>

                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('licenses_and_certifications')}</h3>
                                            {employee.driving_license_number ||
                                            employee.operator_license_number ||
                                            employee.tuv_certification_number ||
                                            employee.spsp_license_number ? (
                                                <dl className="space-y-2">
                                                    {employee.driving_license_number && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('driving_license')}</dt>
                                                            <dd className="text-sm">{employee.driving_license_number}</dd>
                                                        </div>
                                                    )}
                                                    {employee.driving_license_expiry && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('license_expiry')}</dt>
                                                            <dd className="text-sm">{format(new Date(employee.driving_license_expiry), 'PPP')}</dd>
                                                        </div>
                                                    )}
                                                    {employee.operator_license_number && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('lbl_operator_license')}</dt>
                                                            <dd className="text-sm">{employee.operator_license_number}</dd>
                                                        </div>
                                                    )}
                                                    {employee.operator_license_expiry && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('lbl_operator_license_expiry')}</dt>
                                                            <dd className="text-sm">{format(new Date(employee.operator_license_expiry), 'PPP')}</dd>
                                                        </div>
                                                    )}
                                                    {employee.tuv_certification_number && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('tuv_certification')}</dt>
                                                            <dd className="text-sm">{employee.tuv_certification_number}</dd>
                                                        </div>
                                                    )}
                                                    {employee.tuv_certification_expiry && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('tuv_certification_expiry')}</dt>
                                                            <dd className="text-sm">{format(new Date(employee.tuv_certification_expiry), 'PPP')}</dd>
                                                        </div>
                                                    )}
                                                    {employee.spsp_license_number && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('spsp_license')}</dt>
                                                            <dd className="text-sm">{employee.spsp_license_number}</dd>
                                                        </div>
                                                    )}
                                                    {employee.spsp_license_expiry && (
                                                        <div className="flex justify-between border-b pb-2">
                                                            <dt className="text-sm font-medium">{t('spsp_license_expiry')}</dt>
                                                            <dd className="text-sm">{format(new Date(employee.spsp_license_expiry), 'PPP')}</dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">{t('no_licenses_or_certifications_available')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="employment" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('employment_details')}</CardTitle>
                                <CardDescription>{t('work_and_position_details')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('position_information')}</h3>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('employee_id')}</dt>
                                                    <dd className="text-sm">{employee.employee_id}</dd>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('file_number')}</dt>
                                                    <dd className="text-sm">{employee.file_number || 'Not assigned'}</dd>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('employees:fields.designation')}</dt>
                                                    <dd className="text-sm">
                                                        {typeof employee.designation === 'object' &&
                                                        employee.designation !== null &&
                                                        'name' in employee.designation
                                                            ? getTranslation((employee.designation as { name: string }).name)
                                                            : typeof employee.designation === 'string'
                                                              ? getTranslation(employee.designation)
                                                              : ''}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('employees:fields.department')}</dt>
                                                    <dd className="text-sm">
                                                        {typeof employee.department === 'object' &&
                                                        employee.department !== null &&
                                                        'name' in employee.department
                                                            ? getTranslation((employee.department as { name: string }).name)
                                                            : typeof employee.department === 'string'
                                                              ? getTranslation(employee.department)
                                                              : ''}
                                                    </dd>
                                                </div>
                                                {employee.supervisor && (
                                                    <div className="flex justify-between border-b pb-2">
                                                        <dt className="text-sm font-medium">{t('employees:fields.supervisor')}</dt>
                                                        <dd className="text-sm">{employee.supervisor}</dd>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('employees:fields.status')}</dt>
                                                    <dd className="text-sm">{getStatusBadge(employee.status)}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div>
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('employment_timeline')}</h3>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('hire_date')}</dt>
                                                    <dd className="text-sm">
                                                        {employee.hire_date ? format(new Date(employee.hire_date), 'PPP') : 'Not set'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('service_period')}</dt>
                                                    <dd className="text-sm">
                                                        {(() => {
                                                            const hireDate = employee.hire_date ? new Date(employee.hire_date) : new Date();
                                                            const today = new Date();

                                                            let years = today.getFullYear() - hireDate.getFullYear();
                                                            let months = today.getMonth() - hireDate.getMonth();
                                                            let days = today.getDate() - hireDate.getDate();

                                                            // Adjust for negative months or days
                                                            if (days < 0) {
                                                                months--;
                                                                const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                                                                days += lastMonth.getDate();
                                                            }
                                                            if (months < 0) {
                                                                years--;
                                                                months += 12;
                                                            }

                                                            const parts = [];
                                                            if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
                                                            if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
                                                            if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

                                                            return parts.join(', ') || 'Less than a day';
                                                        })()}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Salary & Benefits</h3>
                                        <div className="mb-4 rounded-lg bg-muted/30 p-5">
                                            <div className="mb-2 flex justify-between">
                                                <span className="text-sm font-medium">{t('basic_salary')}</span>
                                                <span className="text-base font-semibold">SAR {Number(employee.basic_salary).toFixed(2)}</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted">
                                                <div className="h-1.5 rounded-full bg-primary" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>

                                        <dl className="space-y-2">
                                            <div className="flex justify-between border-b pb-2">
                                                <dt className="text-sm font-medium">{t('hourly_rate')}</dt>
                                                <dd className="text-sm">SAR {Number(employee.hourly_rate).toFixed(2)}</dd>
                                            </div>
                                            {Number(employee.food_allowance) > 0 && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('food_allowance')}</dt>
                                                    <dd className="text-sm">SAR {Number(employee.food_allowance).toFixed(2)}</dd>
                                                </div>
                                            )}
                                            {Number(employee.housing_allowance) > 0 && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('housing_allowance')}</dt>
                                                    <dd className="text-sm">SAR {Number(employee.housing_allowance).toFixed(2)}</dd>
                                                </div>
                                            )}
                                            {Number(employee.transport_allowance) > 0 && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('lbl_transport_allowance')}</dt>
                                                    <dd className="text-sm">SAR {Number(employee.transport_allowance).toFixed(2)}</dd>
                                                </div>
                                            )}
                                            {Number(employee.absent_deduction_rate) > 0 && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('absent_deduction_rate')}</dt>
                                                    <dd className="text-sm">{Number(employee.absent_deduction_rate).toFixed(2)}%</dd>
                                                </div>
                                            )}
                                            {(employee.overtime_rate_multiplier || employee.overtime_fixed_rate) && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <dt className="text-sm font-medium">{t('overtime_rate')}</dt>
                                                    <dd className="text-sm">
                                                        {employee.overtime_rate_multiplier
                                                            ? `${Number(employee.overtime_rate_multiplier).toFixed(2)}x regular rate`
                                                            : employee.overtime_fixed_rate
                                                              ? `SAR ${Number(employee.overtime_fixed_rate).toFixed(2)}/hour`
                                                              : 'Not set'}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>

                                        <div className="mt-6">
                                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('payroll_history')}</h3>
                                            <div className="space-y-4">
                                                {employee.payrolls && employee.payrolls.length > 0 ? (
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th className="px-4 py-2 text-left">Month</th>
                                                                <th className="px-4 py-2 text-left">Amount</th>
                                                                <th className="px-4 py-2 text-left">{t('th_paid_date')}</th>
                                                                <th className="px-4 py-2 text-left">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {employee.payrolls.map((payroll) => (
                                                                <tr key={payroll.id}>
                                                                    <td className="px-4 py-2">{format(new Date(payroll.salary_month), 'MMMM yyyy')}</td>
                                                                    <td className="px-4 py-2">SAR {Number(payroll.paid_amount).toFixed(2)}</td>
                                                                    <td className="px-4 py-2">
                                                                        {payroll.paid_date ? format(new Date(payroll.paid_date), 'PPP') : 'Pending'}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        <Badge
                                                                            variant={payroll.is_paid ? 'default' : 'secondary'}
                                                                            className={
                                                                                payroll.is_paid
                                                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                                                    : 'border-gray-200 bg-gray-50 text-gray-500'
                                                                            }
                                                                        >
                                                                            {payroll.is_paid ? 'Paid' : 'Pending'}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">{t('no_payroll_records_found')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {Number(current_balance) >= 0 && (
                                            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-destructive">{t('advance_payment_balance')}</p>
                                                    <p className="text-base font-semibold text-destructive">
                                                        SAR {Number(current_balance).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-end">
                                                    <span className="rounded bg-muted-foreground/10 px-2 py-1 text-xs text-muted-foreground">
                                                        {Number(current_balance) > 0 ? t('active') : t('no_balance')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6 space-y-6">
                        {/* Document Overview Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('ttl_document_overview')}</CardTitle>
                                        <CardDescription>{t('document_status_and_expiry_tracking')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                            {employee.status === 'active' ? 'Active Employee' : 'Inactive Employee'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {/* Document Status Summary */}
                                    <div className="rounded-lg bg-muted/30 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="text-sm font-medium">{t('document_status')}</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {(() => {
                                                // Calculate document statistics
                                                const documents = [
                                                    { name: 'Iqama', expiry: employee.iqama_expiry, number: employee.iqama_number },
                                                    { name: 'Passport', expiry: employee.passport_expiry, number: employee.passport_number },
                                                    {
                                                        name: 'Driving License',
                                                        expiry: employee.driving_license_expiry,
                                                        number: employee.driving_license_number,
                                                    },
                                                    {
                                                        name: 'Operator License',
                                                        expiry: employee.operator_license_expiry,
                                                        number: employee.operator_license_number,
                                                    },
                                                    {
                                                        name: 'TÜV Certification',
                                                        expiry: employee.tuv_certification_expiry,
                                                        number: employee.tuv_certification_number,
                                                    },
                                                    {
                                                        name: 'SPSP License',
                                                        expiry: employee.spsp_license_expiry,
                                                        number: employee.spsp_license_number,
                                                    },
                                                ].filter((doc) => doc.number); // Only count documents that have a number

                                                const now = new Date();
                                                const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

                                                const validDocuments = documents.filter((doc) => {
                                                    if (!doc.expiry) return false;
                                                    const expiryDate = new Date(doc.expiry);
                                                    return expiryDate > now;
                                                });

                                                const expiringSoon = documents.filter((doc) => {
                                                    if (!doc.expiry) return false;
                                                    const expiryDate = new Date(doc.expiry);
                                                    return expiryDate > now && expiryDate <= thirtyDaysFromNow;
                                                });

                                                const expiredDocuments = documents.filter((doc) => {
                                                    if (!doc.expiry) return false;
                                                    const expiryDate = new Date(doc.expiry);
                                                    return expiryDate <= now;
                                                });

                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('total_documents')}</span>
                                                            <span className="text-sm font-medium">{documents.length}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('valid_documents')}</span>
                                                            <span className="text-sm font-medium text-green-600">{validDocuments.length}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('expiring_soon')}</span>
                                                            <span className="text-sm font-medium text-amber-600">{expiringSoon.length}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('expired')}</span>
                                                            <span className="text-sm font-medium text-destructive">{expiredDocuments.length}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Next Expiry */}
                                    <div className="rounded-lg bg-muted/30 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="text-sm font-medium">{t('next_expiry')}</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {(() => {
                                                const documents = [
                                                    { name: 'Iqama', expiry: employee.iqama_expiry, number: employee.iqama_number },
                                                    { name: 'Passport', expiry: employee.passport_expiry, number: employee.passport_number },
                                                    {
                                                        name: 'Driving License',
                                                        expiry: employee.driving_license_expiry,
                                                        number: employee.driving_license_number,
                                                    },
                                                    {
                                                        name: 'Operator License',
                                                        expiry: employee.operator_license_expiry,
                                                        number: employee.operator_license_number,
                                                    },
                                                    {
                                                        name: 'TÜV Certification',
                                                        expiry: employee.tuv_certification_expiry,
                                                        number: employee.tuv_certification_number,
                                                    },
                                                    {
                                                        name: 'SPSP License',
                                                        expiry: employee.spsp_license_expiry,
                                                        number: employee.spsp_license_number,
                                                    },
                                                ].filter((doc) => doc.number && doc.expiry); // Only consider documents with both number and expiry

                                                if (documents.length === 0) {
                                                    return (
                                                        <div className="py-2 text-center">
                                                            <p className="text-sm text-muted-foreground">{t('no_documents_with_expiry_dates')}</p>
                                                        </div>
                                                    );
                                                }

                                                // Find the next expiring document
                                                const now = new Date();
                                                const nextExpiring = documents.filter((doc) => new Date(doc.expiry!) > now);
                                                nextExpiring.sort((a, b) => new Date(a.expiry!).getTime() - new Date(b.expiry!).getTime());
                                                const nextExpiringDoc = nextExpiring[0];

                                                if (!nextExpiringDoc) {
                                                    return (
                                                        <div className="py-2 text-center">
                                                            <p className="text-sm text-muted-foreground">{t('all_documents_expired')}</p>
                                                        </div>
                                                    );
                                                }

                                                const expiryDate = new Date(nextExpiringDoc.expiry!);
                                                const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('document')}</span>
                                                            <span className="text-sm font-medium">{nextExpiringDoc.name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{t('expiry_date')}</span>
                                                            <span
                                                                className={`text-sm font-medium ${daysRemaining <= 30 ? 'text-amber-600' : 'text-green-600'}`}
                                                            >
                                                                {daysRemaining} days remaining
                                                            </span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Document Actions */}
                                    <div className="rounded-lg bg-muted/30 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="text-sm font-medium">{t('quick_actions')}</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    window.location.href = `/api/employee/${employee.id}/documents/download-all`;
                                                }}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download All Documents
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={async () => {
                                                    try {
                                                        const response = await axios.get(`/api/employee/${employee.id}/documents/print-summary`, {
                                                            responseType: 'blob',
                                                            headers: {
                                                                Accept: 'application/pdf',
                                                            },
                                                        });

                                                        // Create a blob from the response data
                                                        const blob = new Blob([response.data], { type: 'application/pdf' });

                                                        // Create a URL for the blob
                                                        const url = window.URL.createObjectURL(blob);

                                                        // Open the PDF in a new tab
                                                        window.open(url, '_blank');

                                                        // Clean up the URL after a delay
                                                        setTimeout(() => {
                                                            window.URL.revokeObjectURL(url);
                                                        }, 1000);
                                                    } catch (error) {
                                                        console.error('Error generating document summary:', error);
                                                        ToastService.error('Failed to generate document summary. Please try again.');
                                                    }
                                                }}
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                Print Document Summary
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Legal Documents Section */}
                        {/* <DocumentSection
              title={t('ttl_legal_documents')}
              description="Official identification and legal documents"
              badgeText="Required Documents"
              badgeClassName="bg-blue-50 text-blue-700 border-blue-200"
            >
              <DocumentCard
                title={t('ttl_iqama')}
                documentNumber={employee.iqama_number}
                documentType="iqama"
                employeeId={employee.id}
                icon={<IdCard className="h-4 w-4 text-muted-foreground" />}
                previewSize="id_card"
                documentName="IQAMA"
              />
              <DocumentCard
                title={t('ttl_passport')}
                documentNumber={employee.passport_number}
                documentType="passport"
                employeeId={employee.id}
                icon={<IdCard className="h-4 w-4 text-muted-foreground" />}
                previewSize="id_card"
                documentName="Passport"
              />
            </DocumentSection> */}

                        {/* Licenses Section */}
                        {/* <DocumentSection
              title={t('ttl_licenses_certifications')}
              description="Professional licenses and certifications"
              badgeText="Professional Documents"
              badgeClassName="bg-purple-50 text-purple-700 border-purple-200"
            >
              <DocumentCard
                title={t('driving_license')}
                documentNumber={employee.driving_license_number}
                documentType="driving_license"
                employeeId={employee.id}
                icon={<Car className="h-4 w-4" />}
                previewSize="id_card"
                documentName="Driving License"
              />
              <DocumentCard
                title={t('lbl_operator_license')}
                documentNumber={employee.operator_license_number}
                documentType="operator_license"
                employeeId={employee.id}
                icon={<Truck className="h-4 w-4" />}
                previewSize="id_card"
                documentName="Operator License"
              />
              <DocumentCard
                title={t('ttl_tuv_certification')}
                documentNumber={employee.tuv_certification_number}
                documentType="tuv_certification"
                employeeId={employee.id}
                icon={<Award className="h-4 w-4" />}
                previewSize="id_card"
                documentName="TUV Certification"
              />
              <DocumentCard
                title={t('ttl_spsp_license')}
                documentNumber={employee.spsp_license_number}
                documentType="spsp_license"
                employeeId={employee.id}
                icon={<Award className="h-4 w-4" />}
                previewSize="id_card"
                documentName="SPSP License"
              />
            </DocumentSection> */}

                        {/* Additional Documents Section */}
                        {/* <Card>
              <CardHeader>
                <CardTitle>{t('ttl_additional_documents')}</CardTitle>
                <CardDescription>
                  Upload and manage additional documents for this employee.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdditionalDocumentsList
                  employeeId={employee.id}
                  onUploadSuccess={() => {
                    // Refresh the page data if needed
                    Link.reload();
                  }}
                  onDeleteSuccess={() => {
                    // Refresh the page data if needed
                    Link.reload();
                  }}
                />
              </CardContent>
            </Card> */}

                        {/* Document Expiry Tracker */}
                        {/* <DocumentExpiryTracker
              documents={[
                { name: 'Iqama', expiry: employee.iqama_expiry, number: employee.iqama_number },
                { name: 'Passport', expiry: employee.passport_expiry, number: employee.passport_number },
                { name: 'Driving License', expiry: employee.driving_license_expiry, number: employee.driving_license_number },
                { name: 'Operator License', expiry: employee.operator_license_expiry, number: employee.operator_license_number },
                { name: 'TÜV Certification', expiry: employee.tuv_certification_expiry, number: employee.tuv_certification_number },
                { name: 'SPSP License', expiry: employee.spsp_license_expiry, number: employee.spsp_license_number },
              ]}
            /> */}

                        {/* Enhanced Document Details Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('legal_identification_documents')}</CardTitle>
                                <CardDescription>{t('view_and_manage_key_employee_documents')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {/* Iqama */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('iqama')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.iqama_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.iqama_expiry ? format(new Date(employee.iqama_expiry), 'PPP') : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('cost')}</span>
                                            <span className="text-sm">
                                                {employee.iqama_cost ? `SAR ${Number(employee.iqama_cost).toFixed(2)}` : t('not_set')}
                                            </span>
                                        </div>
                                        {/* File upload/download */}
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.iqama_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.iqama_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="iqama-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'iqama');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('iqama-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Passport */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('passport')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.passport_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.passport_expiry ? format(new Date(employee.passport_expiry), 'PPP') : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.passport_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.passport_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="passport-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'passport');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('passport-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Driving License */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('driving_license')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.driving_license_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.driving_license_expiry
                                                    ? format(new Date(employee.driving_license_expiry), 'PPP')
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('cost')}</span>
                                            <span className="text-sm">
                                                {employee.driving_license_cost
                                                    ? `SAR ${Number(employee.driving_license_cost).toFixed(2)}`
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.driving_license_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.driving_license_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="driving-license-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'driving_license');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('driving-license-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Operator License */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('lbl_operator_license')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.operator_license_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.operator_license_expiry
                                                    ? format(new Date(employee.operator_license_expiry), 'PPP')
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('cost')}</span>
                                            <span className="text-sm">
                                                {employee.operator_license_cost
                                                    ? `SAR ${Number(employee.operator_license_cost).toFixed(2)}`
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.operator_license_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.operator_license_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="operator-license-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'operator_license');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('operator-license-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* TUV Certification */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('tuv_certification')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.tuv_certification_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.tuv_certification_expiry
                                                    ? format(new Date(employee.tuv_certification_expiry), 'PPP')
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('cost')}</span>
                                            <span className="text-sm">
                                                {employee.tuv_certification_cost
                                                    ? `SAR ${Number(employee.tuv_certification_cost).toFixed(2)}`
                                                    : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.tuv_certification_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.tuv_certification_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="tuv-certification-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'tuv_certification');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('tuv-certification-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* SPSP License */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">{t('spsp_license')}</h3>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('number')}</span>
                                            <span className="text-sm">{employee.spsp_license_number || t('not_set')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('expiry')}</span>
                                            <span className="text-sm">
                                                {employee.spsp_license_expiry ? format(new Date(employee.spsp_license_expiry), 'PPP') : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium">{t('cost')}</span>
                                            <span className="text-sm">
                                                {employee.spsp_license_cost ? `SAR ${Number(employee.spsp_license_cost).toFixed(2)}` : t('not_set')}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {employee.spsp_license_file && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={employee.spsp_license_file} target="_blank" rel="noopener noreferrer">
                                                        {t('download')}
                                                    </a>
                                                </Button>
                                            )}
                                            {hasPermission('employees.edit') && (
                                                <>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        id="spsp-license-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'spsp_license');
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('spsp-license-upload')?.click()}
                                                    >
                                                        {t('upload')}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assignments" className="mt-6 space-y-6">
                        {/* Add Manual Assignment Button: only if no current assignment */}
                        {hasPermission('employees.edit') && !currentAssignment && (
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => setIsManualAssignmentDialogOpen(true)} variant="outline">
                                    Add Manual Assignment
                                </Button>
                            </div>
                        )}
                        <Dialog open={isManualAssignmentDialogOpen} onOpenChange={setIsManualAssignmentDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Manual Assignment</DialogTitle>
                                </DialogHeader>
                                <form
                                    method="POST"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setIsSubmittingManual(true);
                                        try {
                                            await router.post(
                                                route('employees.assignManualAssignment', { employee: employee.id }),
                                                {
                                                    name: manualAssignment.name,
                                                    type: 'manual',
                                                    status: 'active',
                                                    start_date: manualAssignment.start_date,
                                                    end_date: manualAssignment.end_date,
                                                    location: manualAssignment.location,
                                                    notes: manualAssignment.notes,
                                                },
                                                {
                                                    onSuccess: () => {
                                                        setIsManualAssignmentDialogOpen(false);
                                                        setManualAssignment({ name: '', location: '', start_date: '', end_date: '', notes: '' });
                                                        ToastService.success('Manual assignment created successfully.');
                                                        router.reload();
                                                    },
                                                    onError: (errors) => {
                                                        ToastService.error('Failed to create manual assignment.');
                                                    },
                                                    preserveScroll: true,
                                                },
                                            );
                                        } finally {
                                            setIsSubmittingManual(false);
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <Input
                                        placeholder="Assignment Name"
                                        value={manualAssignment.name}
                                        onChange={(e) => setManualAssignment({ ...manualAssignment, name: e.target.value })}
                                        name="name"
                                        required
                                    />
                                    <Input
                                        placeholder="Location"
                                        value={manualAssignment.location}
                                        onChange={(e) => setManualAssignment({ ...manualAssignment, location: e.target.value })}
                                        name="location"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            placeholder="Start Date"
                                            value={manualAssignment.start_date}
                                            onChange={(e) => setManualAssignment({ ...manualAssignment, start_date: e.target.value })}
                                            name="start_date"
                                            required
                                        />
                                        <Input
                                            type="date"
                                            placeholder="End Date"
                                            value={manualAssignment.end_date}
                                            onChange={(e) => setManualAssignment({ ...manualAssignment, end_date: e.target.value })}
                                            name="end_date"
                                        />
                                    </div>
                                    <Textarea
                                        placeholder="Notes (optional)"
                                        value={manualAssignment.notes}
                                        onChange={(e) => setManualAssignment({ ...manualAssignment, notes: e.target.value })}
                                        name="notes"
                                    />
                                </form>
                            </DialogContent>
                        </Dialog>
                        {/* Show only the current assignment as a card */}
                        {currentAssignment && (
                            <div className="relative">
                                <Card className="mb-6 border border-gray-200 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl font-semibold">
                                            {currentAssignment.name || currentAssignment.title || '-'}
                                            {hasPermission('employees.edit') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="ml-2"
                                                    onClick={() => {
                                                        setEditAssignment(currentAssignment);
                                                        setIsEditAssignmentDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="mr-1 inline h-4 w-4" /> Edit
                                                </Button>
                                            )}
                                            {hasPermission('admin') && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="ml-2"
                                                    onClick={() => {
                                                        setDeleteAssignmentId(currentAssignment.id);
                                                        setIsDeletingAssignment(true);
                                                    }}
                                                >
                                                    <Trash2 className="mr-1 inline h-4 w-4" /> Delete
                                                </Button>
                                            )}
                                        </CardTitle>
                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            {/* Type badge */}
                                            <Badge className="bg-blue-500 text-white capitalize">{currentAssignment.type || 'assignment'}</Badge>
                                            {/* Project or Rental # */}
                                            <span className="text-xs text-muted-foreground">
                                                {currentAssignment.type === 'project' && currentAssignment.project?.name
                                                    ? `Project: ${currentAssignment.project.name}`
                                                    : (currentAssignment.type === 'rental' || currentAssignment.type === 'rental_item') &&
                                                        (currentAssignment.rental?.rental_number || currentAssignment.rental_number)
                                                      ? `Rental #: ${currentAssignment.rental?.rental_number || currentAssignment.rental_number}`
                                                      : '-'}
                                            </span>
                                            {/* Status badge */}
                                            <Badge
                                                className={
                                                    currentAssignment.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                                                }
                                            >
                                                {currentAssignment.status || 'active'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="mt-2 flex flex-col gap-1">
                                            {/* Location */}
                                            <span className="text-sm text-muted-foreground">
                                                <strong>Location:</strong> {currentAssignment.location || '-'}
                                            </span>
                                            {/* Date range */}
                                            <span className="text-sm text-muted-foreground">
                                                <strong>From:</strong>{' '}
                                                {currentAssignment.start_date ? format(new Date(currentAssignment.start_date), 'MMM d, yyyy') : '-'}
                                                {currentAssignment.end_date
                                                    ? ` - ${format(new Date(currentAssignment.end_date), 'MMM d, yyyy')}`
                                                    : ''}
                                            </span>
                                            {/* Today's date */}
                                            <span className="text-sm text-muted-foreground">
                                                <strong>To:</strong> {format(new Date(), 'MMM d, yyyy')}
                                            </span>
                                            {/* Equipment (if available) */}
                                            {currentAssignment.equipment && (
                                                <span className="text-sm text-muted-foreground">
                                                    <strong>Equipment:</strong> {currentAssignment.equipment}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                    {/* Admin Manage Assignment Button */}
                                    {hasPermission('admin') &&
                                        (() => {
                                            let url = '';
                                            if (currentAssignment.type === 'project' && currentAssignment.project_id) {
                                                url = `/projects/${currentAssignment.project_id}/resources`;
                                            } else if (
                                                (currentAssignment.type === 'rental' || currentAssignment.type === 'rental_item') &&
                                                currentAssignment.rental_id
                                            ) {
                                                url = `https://snd-app.test/rentals/${currentAssignment.rental_id}`;
                                            }
                                            return url ? (
                                                <div className="absolute top-2 right-2">
                                                    <Button asChild size="sm" variant="outline">
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            Manage Assignment
                                                        </a>
                                                    </Button>
                                                </div>
                                            ) : null;
                                        })()}
                                </Card>
                            </div>
                        )}
                        {/* Assignment History Section */}
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">Assignment History</h3>
                            {strictAssignmentHistory.length === 0 ? (
                                <div className="text-muted-foreground">No previous assignments found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full rounded-lg border border-gray-200 bg-white">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left">Assignment Name</th>
                                                <th className="px-4 py-2 text-left">Type</th>
                                                <th className="px-4 py-2 text-left">Location</th>
                                                <th className="px-4 py-2 text-left">Start Date</th>
                                                <th className="px-4 py-2 text-left">End Date</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {strictAssignmentHistory.map((a) => (
                                                <tr key={a.id} className="border-t">
                                                    <td className="px-4 py-2 font-medium">{a.name || a.title || '-'}</td>
                                                    <td className="px-4 py-2 capitalize">{a.type || '-'}</td>
                                                    <td className="px-4 py-2">{a.location || '-'}</td>
                                                    <td className="px-4 py-2">
                                                        {a.start_date ? format(new Date(a.start_date), 'MMM d, yyyy') : '-'}
                                                    </td>
                                                    <td className="px-4 py-2">{a.end_date ? format(new Date(a.end_date), 'MMM d, yyyy') : '-'}</td>
                                                    <td className="px-4 py-2">
                                                        <span
                                                            className={
                                                                a.status === 'active'
                                                                    ? 'rounded bg-green-100 px-2 py-1 text-xs text-green-800'
                                                                    : 'rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'
                                                            }
                                                        >
                                                            {a.status || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {hasPermission('employees.edit') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="mr-2"
                                                                onClick={() => {
                                                                    setEditAssignment(a);
                                                                    setIsEditAssignmentDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="mr-1 inline h-4 w-4" /> Edit
                                                            </Button>
                                                        )}
                                                        {hasPermission('admin') && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    setDeleteAssignmentId(a.id);
                                                                    setIsDeletingAssignment(true);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-1 inline h-4 w-4" /> Delete
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="timesheets" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_timesheet_records')}</CardTitle>
                                <CardDescription>{t('view_and_manage_employee_timesheet_records')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Payslip Button with Month Selector */}
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <Select
                                        value={format(selectedPayslipDate, 'yyyy-MM')}
                                        onValueChange={(value) => {
                                            const [year, month] = value.split('-').map(Number);
                                            setSelectedPayslipDate(new Date(year, month - 1, 1));
                                        }}
                                    >
                                        <SelectTrigger className="w-full min-w-[140px] sm:w-auto">
                                            <SelectValue placeholder={format(selectedPayslipDate, 'MMMM yyyy')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const date = subMonths(new Date(), i);
                                                return (
                                                    <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                                                        {format(date, 'MMMM yyyy')}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                                        <a
                                            href={route('timesheets.pay-slip', {
                                                employee: employee.id,
                                                month: format(selectedPayslipDate, 'yyyy-MM'),
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t('btn_view_payslip', 'View Payslip')}
                                        </a>
                                    </Button>
                                </div>
                                {/* Timesheet Summary */}
                                <TimesheetSummary employeeId={employee.id} />
                                {/* Add Timesheet Button and Dialog */}
                                {hasPermission('timesheets.create') && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="mt-4 mb-4">{t('btn_add_timesheet')}</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('ttl_add_new_timesheet')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('desc_add_new_timesheet') ||
                                                        'Fill in the details to add a new timesheet record for this employee.'}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <TimesheetForm employeeId={employee.id} onSuccess={() => window.location.reload()} />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {/* Timesheet List */}
                                <TimesheetList employeeId={employee.id} onAddNew={() => setIsAddTimesheetDialogOpen(true)} />
                                <Dialog open={isAddTimesheetDialogOpen} onOpenChange={setIsAddTimesheetDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('ttl_add_new_timesheet')}</DialogTitle>
                                        </DialogHeader>
                                        <TimesheetForm employeeId={employee.id} onSuccess={() => window.location.reload()} />
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leaves" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('ttl_leave_history')}</CardTitle>
                                        <CardDescription>{t('view_and_manage_employee_leave_records')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={handleViewAllLeaveRecords}>
                                            <History className="mr-2 h-4 w-4" />
                                            View All
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Leave Summary */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <Card>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-sm font-medium">{t('ttl_total_leaves')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">{leaveRequests.data.length}</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-sm font-medium">{t('ttl_approved_leaves')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">
                                                    {leaveRequests.data.filter((req) => req.status === 'approved').length}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-sm font-medium">{t('ttl_pending_leaves')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">
                                                    {leaveRequests.data.filter((req) => req.status === 'pending').length}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-sm font-medium">{t('ttl_rejected_leaves')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">
                                                    {leaveRequests.data.filter((req) => req.status === 'rejected').length}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Leave Records */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{t('ttl_recent_leave_requests')}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Type</th>
                                                        <th className="px-4 py-2 text-left">{t('lbl_start_date')}</th>
                                                        <th className="px-4 py-2 text-left">{t('lbl_end_date')}</th>
                                                        <th className="px-4 py-2 text-left">Duration</th>
                                                        <th className="px-4 py-2 text-left">{t('status')}</th>
                                                        <th className="px-4 py-2 text-left">{t('actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leaveRequests.data.map((request) => (
                                                        <tr key={request.id}>
                                                            <td className="px-4 py-2 capitalize">{getLeaveTypeName(request.leave_type)}</td>
                                                            <td className="px-4 py-2">{format(new Date(request.start_date), 'PP')}</td>
                                                            <td className="px-4 py-2">{format(new Date(request.end_date), 'PP')}</td>
                                                            <td className="px-4 py-2">{calculateDays(request.start_date, request.end_date)} days</td>
                                                            <td className="px-4 py-2">
                                                                <Badge
                                                                    variant={
                                                                        request.status === 'approved'
                                                                            ? 'default'
                                                                            : request.status === 'rejected'
                                                                              ? 'destructive'
                                                                              : 'secondary'
                                                                    }
                                                                >
                                                                    {request.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <a href={route('leave-requests.show', { leaveRequest: request.id })}>
                                                                        {t('ttl_view_details')}
                                                                    </a>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {leaveRequests.data.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="text-center text-muted-foreground">
                                                                No leave requests found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="advances" className="mt-6 space-y-6">
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="mr-2 h-5 w-5" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('ttl_advance_payment_management')}</CardTitle>
                                        <CardDescription>{t('track_and_manage_employee_advance_payments_and_ded')}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsAdvanceRequestDialogOpen(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            New Advance
                                        </Button>
                                        <Dialog open={isRepaymentDialogOpen} onOpenChange={setIsRepaymentDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="flex items-center gap-2"
                                                    onClick={() => {
                                                        // Get all active advances with valid numeric IDs
                                                        const activeAdvances = advances?.data?.filter(
                                                            (advance) =>
                                                                (advance.status === 'approved' || advance.status === 'partially_repaid') &&
                                                                typeof advance.id === 'number' &&
                                                                !isNaN(advance.id),
                                                        );
                                                        // Debug log
                                                        console.log('DEBUG: advances.data', advances?.data);
                                                        if (activeAdvances && activeAdvances.length > 0) {
                                                            // Calculate total remaining balance and monthly deduction
                                                            const totalRemainingBalance = activeAdvances.reduce((total: number, advance: Advance) => {
                                                                const remainingBalance =
                                                                    advance.remaining_balance !== undefined
                                                                        ? Number(advance.remaining_balance)
                                                                        : Number(advance.amount) - Number(advance.repaid_amount || 0);
                                                                return total + remainingBalance;
                                                            }, 0);

                                                            const totalMonthlyDeduction = activeAdvances.reduce((total: number, advance: Advance) => {
                                                                return total + Number(advance.monthly_deduction || 0);
                                                            }, 0);

                                                            // Set the initial repayment amount to total monthly deduction
                                                            setRepaymentAmount(totalMonthlyDeduction.toString());

                                                            // Store the first valid advance for repayment
                                                            setSelectedAdvance(activeAdvances[0].id);
                                                            // Debug log
                                                            console.log('DEBUG: selectedAdvance', activeAdvances[0].id);
                                                        } else {
                                                            ToastService.error('No valid advances available for repayment');
                                                            return;
                                                        }
                                                    }}
                                                    disabled={
                                                        !advances?.data?.some(
                                                            (advance) =>
                                                                (advance.status === 'approved' || advance.status === 'partially_repaid') &&
                                                                typeof advance.id === 'number' &&
                                                                !isNaN(advance.id),
                                                        )
                                                    }
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    Make Repayment
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{t('ttl_record_repayment')}</DialogTitle>
                                                    <DialogDescription>
                                                        Enter the repayment amount. For partial repayments, the amount must be at least the total
                                                        monthly deduction.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                {selectedAdvance && (
                                                    <div className="space-y-4">
                                                        {(() => {
                                                            // Get all active advances
                                                            const activeAdvances = advances?.data?.filter(
                                                                (advance) => advance.status === 'approved' || advance.status === 'partially_repaid',
                                                            );

                                                            if (!activeAdvances || activeAdvances.length === 0) {
                                                                return (
                                                                    <div className="p-6 text-center">
                                                                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
                                                                        <h3 className="mb-2 text-lg font-medium">{t('no_active_advances')}</h3>
                                                                        <p className="mb-4 text-sm text-muted-foreground">
                                                                            There are no active advances available for repayment.
                                                                        </p>
                                                                        <Button variant="outline" onClick={() => setIsRepaymentDialogOpen(false)}>
                                                                            Close
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            }

                                                            // Calculate total remaining balance and monthly deduction
                                                            const totalRemainingBalance = activeAdvances.reduce((total: number, advance: Advance) => {
                                                                const remainingBalance =
                                                                    advance.remaining_balance !== undefined
                                                                        ? Number(advance.remaining_balance)
                                                                        : Number(advance.amount) - Number(advance.repaid_amount || 0);
                                                                return total + remainingBalance;
                                                            }, 0);

                                                            const totalMonthlyDeduction = activeAdvances.reduce((total: number, advance: Advance) => {
                                                                return total + Number(advance.monthly_deduction || 0);
                                                            }, 0);

                                                            return (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <span className="font-medium">Total Remaining Balance:</span>
                                                                            <p>SAR {totalRemainingBalance.toFixed(2)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Total Monthly Deduction:</span>
                                                                            <p>SAR {totalMonthlyDeduction.toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="repayment-amount">{t('lbl_repayment_amount')}</Label>
                                                                        <Input
                                                                            id="repayment-amount"
                                                                            type="number"
                                                                            value={repaymentAmount}
                                                                            onChange={(e) => setRepaymentAmount(e.target.value)}
                                                                            min={totalMonthlyDeduction}
                                                                            max={totalRemainingBalance}
                                                                        />
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Minimum: SAR {totalMonthlyDeduction.toFixed(2)}
                                                                            <br />
                                                                            Maximum: SAR {totalRemainingBalance.toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex justify-end space-x-2">
                                                                        <Button variant="outline" onClick={() => setIsRepaymentDialogOpen(false)}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => {
                                                                                if (!repaymentAmount || Number(repaymentAmount) <= 0) {
                                                                                    ToastService.error('Please enter a valid repayment amount');
                                                                                    return;
                                                                                }
                                                                                if (
                                                                                    !selectedAdvance ||
                                                                                    isNaN(Number(selectedAdvance)) ||
                                                                                    !advances.data.find((a) => a.id === selectedAdvance)
                                                                                ) {
                                                                                    ToastService.error(
                                                                                        'Invalid or legacy advance selected for repayment. Please select a valid advance.',
                                                                                    );
                                                                                    return;
                                                                                }
                                                                                const amount = Number(repaymentAmount);
                                                                                if (totalMonthlyDeduction > 0 && amount < totalMonthlyDeduction) {
                                                                                    ToastService.error(
                                                                                        `Minimum repayment amount is SAR ${totalMonthlyDeduction.toFixed(2)}`,
                                                                                    );
                                                                                    return;
                                                                                }
                                                                                if (amount > totalRemainingBalance) {
                                                                                    ToastService.error(
                                                                                        `Repayment amount cannot exceed remaining balance of SAR ${totalRemainingBalance.toFixed(2)}`,
                                                                                    );
                                                                                    return;
                                                                                }
                                                                                handleRepayment({
                                                                                    amount: Number(repaymentAmount),
                                                                                    advance_id: selectedAdvance,
                                                                                });
                                                                            }}
                                                                        >
                                                                            {t('ttl_record_repayment')}
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {/* Current Balance Card */}
                                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-muted-foreground">{t('current_balance')}</h3>
                                            <Badge variant="outline" className="bg-muted/50">
                                                {Number(current_balance) > 0 ? 'Active' : 'No Balance'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-3xl font-bold text-destructive">SAR {Number(current_balance).toFixed(2)}</p>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full bg-destructive transition-all duration-500"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Deduction Card */}
                                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-muted-foreground">{t('monthly_deduction')}</h3>
                                            <Badge variant="outline" className="bg-muted/50">
                                                Configurable
                                            </Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    step="1.00"
                                                    min="0"
                                                    value={monthlyDeduction}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setMonthlyDeduction(value);

                                                        // Only send request if value is valid
                                                        if (value && !isNaN(Number(value)) && Number(value) >= 0) {
                                                            // Calculate estimated repayment months
                                                            const amount = Number(advanceAmount) || 0;
                                                            const deduction = Number(value);
                                                            const estimatedMonths = deduction > 0 ? Math.ceil(amount / deduction) : 0;

                                                            router.patch(
                                                                route('advances.monthly-deduction', { employee: employee.id }),
                                                                {
                                                                    monthly_deduction: Number(value),
                                                                    estimated_months: estimatedMonths,
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                    preserveState: true,
                                                                    onSuccess: () => {
                                                                        // Update the advances data to reflect the new monthly deduction
                                                                        const updatedAdvances = {
                                                                            ...advances,
                                                                            data: advances.data.map((advance, index) => {
                                                                                if (index === 0) {
                                                                                    return {
                                                                                        ...advance,
                                                                                        monthly_deduction: Number(value),
                                                                                    };
                                                                                }
                                                                                return advance;
                                                                            }),
                                                                        };
                                                                        // Force reload to ensure all data is updated
                                                                        router.reload();
                                                                    },
                                                                    onError: (errors) => {
                                                                        // Revert the value if there's an error
                                                                        setMonthlyDeduction(advances?.data?.[0]?.monthly_deduction?.toString() || '');
                                                                        ToastService.error('Failed to update monthly deduction. Please try again.');
                                                                    },
                                                                    onCancel: () => {
                                                                        // Revert the value if request is cancelled
                                                                        setMonthlyDeduction(advances?.data?.[0]?.monthly_deduction?.toString() || '');
                                                                    },
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        // Validate on blur
                                                        const value = e.target.value;
                                                        if (!value || isNaN(Number(value)) || Number(value) < 0) {
                                                            setMonthlyDeduction(advances?.data?.[0]?.monthly_deduction?.toString() || '');
                                                            ToastService.error('Please enter a valid monthly deduction amount');
                                                        }
                                                    }}
                                                    className="w-32 text-2xl font-bold text-primary"
                                                    placeholder="0.00"
                                                />
                                                <span className="text-2xl font-bold text-primary">SAR</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>{t('current_monthly_deduction')}</span>
                                                <span className="font-medium">
                                                    SAR {Number(advances?.data?.[0]?.monthly_deduction || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t('company_will_decide_monthly_deduction')}</p>
                                        </div>
                                    </div>

                                    {/* Estimated Repayment Card */}
                                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-muted-foreground">{t('estimated_repayment')}</h3>
                                            <Badge variant="outline" className="bg-muted/50">
                                                Projected
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <p className="text-2xl font-bold text-primary">
                                                    {monthlyDeduction ? Math.ceil(Number(current_balance) / Number(monthlyDeduction)) : 0}
                                                    <span className="ml-1 text-sm font-normal text-muted-foreground">months</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t('based_on_current_balance_and_monthly_deduction')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Advance History Card */}
                                <Card className="mt-6 shadow-sm border border-gray-200 bg-white rounded-lg">
                                    <CardHeader className="bg-muted/50 rounded-t-lg p-4 flex flex-row items-center gap-2">
                                        <History className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg font-semibold">Advance History</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Deduction</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {advances?.data && advances.data.length > 0 ? (
                                                        advances.data
                                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                            .map((advance: Advance) => (
                                                                <tr key={`${advance.type}-${advance.id}`} className="hover:bg-muted/20 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">SAR {Number(advance.amount).toFixed(2)}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">SAR {Number(advance.monthly_deduction || 0).toFixed(2)}</td>
                                                                    <td className="px-6 py-4 max-w-[200px] truncate">{advance.reason}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(advance.created_at), 'PP')}</td>
                                                                    <td className="px-6 py-4">{getRepaymentStatus(advance)}</td>
                                                                    <td className="px-6 py-4 capitalize">{advance.type === 'advance' ? t('request') : Number(advance.amount) < 0 ? t('repayment') : t('payment')}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            {advance.status === 'pending' && (
                                                                                <>
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    size="icon"
                                                                                                    className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                                                    onClick={() => handleAdvanceApproval(advance.id)}
                                                                                                >
                                                                                                    <Check className="h-4 w-4" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>{t('approve')}</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    size="icon"
                                                                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                                                    onClick={() =>
                                                                                                        handleAdvanceRejection(advance.id, advance.reason)
                                                                                                    }
                                                                                                >
                                                                                                    <X className="h-4 w-4" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>{t('reject')}</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
                                                                                </>
                                                                            )}
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="icon"
                                                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                                            onClick={() => {
                                                                                                setSelectedAdvance(advance.id);
                                                                                                setIsDeleteDialogOpen(true);
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>{t('delete')}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground italic">
                                                                No advance records found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                                <PaymentHistory employeeId={Number(employee.id) || 0} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="final-settlements" className="mt-6 space-y-6">
                        <FinalSettlementTab
                            employee={{
                                id: Number(employee.id) || 0,
                                employee_id: String(employee.employee_id ?? ''),
                                first_name: String(employee.first_name ?? ''),
                                last_name: String(employee.last_name ?? ''),
                                status: String(employee.status ?? ''),
                            }}
                            settlements={finalSettlements.data || []}
                        />
                    </TabsContent>

                    <TabsContent value="resignations" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_resignation_history')}</CardTitle>
                                <CardDescription>{t('view_and_manage_resignation_requests')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">{t('last_working_day')}</th>
                                            <th className="px-4 py-2 text-left">{t('reason')}</th>
                                            <th className="px-4 py-2 text-left">{t('status')}</th>
                                            <th className="px-4 py-2 text-left">{t('th_submitted_on')}</th>
                                            <th className="px-4 py-2 text-left">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.resignations?.map((resignation) => (
                                            <tr key={resignation.id}>
                                                <td className="px-4 py-2">{format(new Date(resignation.last_working_day), 'MMM dd, yyyy')}</td>
                                                <td className="px-4 py-2 max-w-md truncate">{resignation.reason}</td>
                                                <td className="px-4 py-2">{getStatusBadge(resignation.status)}</td>
                                                <td className="px-4 py-2">{format(new Date(resignation.created_at), 'MMM dd, yyyy')}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={route('resignations.show', { resignation: resignation.id })}>
                                                                {t('ttl_view_details')}
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!employee.resignations || employee.resignations.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted-foreground">
                                                    No resignation requests found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Advance Request Dialog */}
                <Dialog open={isAdvanceRequestDialogOpen} onOpenChange={setIsAdvanceRequestDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_request_advance')}</DialogTitle>
                            <DialogDescription>{t('enter_advance_payment_details')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">{t('amount_sar')}</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    placeholder={t('ph_enter_amount')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="monthlyDeduction">{t('monthly_deduction_sar')}</Label>
                                <Input
                                    id="monthlyDeduction"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={monthlyDeduction}
                                    onChange={(e) => setMonthlyDeduction(e.target.value)}
                                    placeholder={t('ph_enter_monthly_deduction_amount')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reason">{t('reason')}</Label>
                                <Textarea
                                    id="reason"
                                    value={advanceReason}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdvanceReason(e.target.value)}
                                    placeholder={t('ph_enter_reason_for_advance')}
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            className="w-full mt-2"
                            onClick={async () => {
                                const success = await handleAdvanceRequest({
                                    amount: advanceAmount,
                                    monthly_deduction: monthlyDeduction,
                                    reason: advanceReason,
                                });
                                if (success) setIsAdvanceRequestDialogOpen(false);
                            }}
                        >
                            {t('btn_submit', 'Submit')}
                        </Button>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_reject_advance_request')}</DialogTitle>
                            <DialogDescription>Please provide a reason for rejecting this advance request.</DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (selectedAdvance) {
                                    handleAdvanceRejection(selectedAdvance, rejectionReason);
                                } else {
                                    ToastService.error('No advance selected for rejection');
                                }
                            }}
                        >
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="rejectionReason">{t('lbl_rejection_reason')}</Label>
                                    <Input
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder={t('ph_enter_reason_for_rejection')}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('ttl_delete_advance_record')}</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this advance record? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="mb-4">Are you sure you want to delete this advance record? This action cannot be undone.</div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!selectedAdvance}
                                onClick={() => {
                                    if (selectedAdvance) {
                                        handleAdvanceDelete(selectedAdvance);
                                    } else {
                                        ToastService.error('No advance selected for deletion');
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Assignment Dialog */}
                <Dialog
                    open={isEditAssignmentDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditAssignmentDialogOpen(open);
                        if (!open) setEditAssignment(null);
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Assignment</DialogTitle>
                        </DialogHeader>
                        {editAssignment && (
                            <form
                                method="POST"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setIsSubmittingEdit(true);
                                    router.post(
                                        route('employees.assignments.update', { employee: employee.id, assignment: editAssignment.id }),
                                        editAssignment,
                                        {
                                            onSuccess: () => {
                                                setIsEditAssignmentDialogOpen(false);
                                                setEditAssignment(null);
                                                ToastService.success('Assignment updated successfully.');
                                                router.reload();
                                            },
                                            onError: () => setIsSubmittingEdit(false),
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                                className="space-y-4"
                            >
                                <Input
                                    placeholder="Assignment Name"
                                    value={editAssignment.name}
                                    onChange={(e) => setEditAssignment({ ...editAssignment, name: e.target.value })}
                                    name="name"
                                    required
                                />
                                <Input
                                    placeholder="Location"
                                    value={editAssignment.location}
                                    onChange={(e) => setEditAssignment({ ...editAssignment, location: e.target.value })}
                                    name="location"
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        placeholder="Start Date"
                                        value={editAssignment.start_date}
                                        onChange={(e) => setEditAssignment({ ...editAssignment, start_date: e.target.value })}
                                        name="start_date"
                                        required
                                    />
                                    <Input
                                        type="date"
                                        placeholder="End Date"
                                        value={editAssignment.end_date}
                                        onChange={(e) => setEditAssignment({ ...editAssignment, end_date: e.target.value })}
                                        name="end_date"
                                    />
                                </div>
                                <Textarea
                                    placeholder="Notes (optional)"
                                    value={editAssignment.notes}
                                    onChange={(e) => setEditAssignment({ ...editAssignment, notes: e.target.value })}
                                    name="notes"
                                />
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Assignment Dialog */}
                <Dialog
                    open={isDeletingAssignment}
                    onOpenChange={(open) => {
                        setIsDeletingAssignment(open);
                        if (!open) setDeleteAssignmentId(null);
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="mb-4">Are you sure you want to delete this assignment?</div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsDeletingAssignment(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (!deleteAssignmentId) return;
                                    try {
                                        await router.delete(
                                            route('employees.assignments.destroy', { employee: employee.id, assignment: deleteAssignmentId }),
                                            {
                                                onSuccess: () => {
                                                    setIsDeletingAssignment(false);
                                                    setDeleteAssignmentId(null);
                                                    ToastService.success('Assignment deleted successfully.');
                                                    router.reload();
                                                },
                                                onError: () => {
                                                    ToastService.error('Failed to delete assignment.');
                                                },
                                                preserveScroll: true,
                                            },
                                        );
                                    } catch {
                                        ToastService.error('Failed to delete assignment.');
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
