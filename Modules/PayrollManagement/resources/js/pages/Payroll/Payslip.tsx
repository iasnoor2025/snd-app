import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Separator,
} from '@/Core';
import { BreadcrumbItem, PageProps } from '@/Core/types';
import { Head } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Building, Calendar, Clock, DollarSign, Download, MapPin, Printer, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PayrollItem {
    id: number;
    type: string;
    description: string;
    amount: number;
    is_taxable: boolean;
    tax_rate: number;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id?: string;
    designation?: string;
    department?: {
        name: string;
    };
    basic_salary?: number;
    food_allowance?: number;
    housing_allowance?: number;
    transport_allowance?: number;
}

interface Payroll {
    id: number;
    month: number;
    year: number;
    base_salary: number;
    overtime_amount: number;
    bonus_amount: number;
    deduction_amount: number;
    advance_deduction: number;
    final_amount: number;
    total_worked_hours: number;
    overtime_hours: number;
    status: string;
    notes?: string;
    currency: string;
    items: PayrollItem[];
    created_at: string;
}

interface AttendanceData {
    [key: number]: {
        date: string;
        day_of_week: number;
        day_name: string;
        regular_hours: number;
        overtime_hours: number;
        status: string;
        total_hours: number;
    };
}

interface Props extends PageProps {
    payroll: Payroll;
    employee: Employee;
    attendanceData?: AttendanceData;
}

// Currency formatter function
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Add print styles
const printStyles = `
  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: white !important;
    }

    .sidebar-wrapper,
    .app-sidebar,
    .sidebar,
    [class*='sidebar'] {
      display: none !important;
    }

    .print\\:hidden {
      display: none !important;
    }

    .print\\:p-0 {
      padding: 0 !important;
    }

    .print\\:shadow-none {
      box-shadow: none !important;
    }

    .print\\:break-before-page {
      break-before: page;
    }

    .bg-blue-50, .bg-green-50, .bg-gray-100, .bg-red-50 {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .card-container {
      border: none !important;
      box-shadow: none !important;
    }

    .header-container {
      border-bottom: 2px solid #4472C4 !important;
      background-color: #f9f9f9 !important;
    }

    .company-name {
      color: #4472C4 !important;
    }

    .company-subtitle {
      color: #4472C4 !important;
    }

    .pay-slip-title {
      color: #4472C4 !important;
      background-color: rgba(68, 114, 196, 0.1) !important;
    }

    .table-header {
      background-color: #2F5496 !important;
      color: white !important;
    }

    .basic-salary {
      background-color: #92D050 !important;
    }

    .blue-bg {
      background-color: #B4C6E7 !important;
    }

    .green-bg {
      background-color: #C6E0B4 !important;
    }

    .attendance-table {
      border-collapse: collapse !important;
      width: 100% !important;
      font-size: 10px !important;
    }

    .attendance-table th,
    .attendance-table td {
      border: 1px solid #000 !important;
      padding: 2px 4px !important;
      text-align: center !important;
    }

    .attendance-table .bg-green-100 {
      background-color: #d1fae5 !important;
    }

    .attendance-table .bg-blue-100 {
      background-color: #dbeafe !important;
    }

    .attendance-table .bg-red-100 {
      background-color: #fee2e2 !important;
    }

    .attendance-legend {
      margin-top: 10px !important;
      font-size: 10px !important;
    }
  }
`;

export default function Payslip({ auth, payroll, employee, attendanceData }: Props) {
    const { t } = useTranslation('PayrollManagement');
    const payslipRef = useRef<HTMLDivElement>(null);

    // Debug: Log the attendance data
    console.log('Attendance data received:', attendanceData);
    if (attendanceData) {
        console.log('Day 1 data:', attendanceData[1]);
        console.log('Day 4 data:', attendanceData[4]);
        console.log('Day 5 data:', attendanceData[5]);
    }





    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: 'Payroll', href: '/hr/payroll' },
        { title: 'Payslip', href: '#' },
    ];

    const [isLoading, setIsLoading] = useState(false);

    // Inject print styles
    useEffect(() => {
        // Create style element
        const style = document.createElement('style');
        style.innerHTML = printStyles;
        style.id = 'pay-slip-print-styles';

        // Append to head
        document.head.appendChild(style);

        // Cleanup on unmount
        return () => {
            const styleElement = document.getElementById('pay-slip-print-styles');
            if (styleElement) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    // Check if we have all the required data
    if (!payroll || !employee) {
        return (
            <AppLayout title="Payroll Payslip" breadcrumbs={breadcrumbs} requiredPermission="payroll.view">
                <Head title="Payroll Payslip" />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Error Loading Payslip</CardTitle>
                            <CardDescription>There was an error loading the payslip data. Please try again.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" asChild>
                                <a href="/hr/payroll">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Payroll
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // Validate data types to prevent rendering errors
    const safeEmployee = {
        first_name: String(employee.first_name || ''),
        last_name: String(employee.last_name || ''),
        employee_id: employee.employee_id ? String(employee.employee_id) : String(employee.id || ''),
        designation: employee.designation ? String(employee.designation) : 'N/A',
        department: employee.department ? String(employee.department) : 'N/A'
    };

    const safePayroll = {
        id: Number(payroll.id) || 0,
        month: Number(payroll.month) || 0,
        year: Number(payroll.year) || 0,
        base_salary: Number(payroll.base_salary) || 0,
        overtime_amount: Number(payroll.overtime_amount) || 0,
        bonus_amount: Number(payroll.bonus_amount) || 0,
        deduction_amount: Number(payroll.deduction_amount) || 0,
        advance_deduction: Number(payroll.advance_deduction) || 0,
        final_amount: Number(payroll.final_amount) || 0,
        total_worked_hours: Number(payroll.total_worked_hours) || 0,
        overtime_hours: Number(payroll.overtime_hours) || 0,
        status: String(payroll.status || ''),
        notes: payroll.notes ? String(payroll.notes) : '',
        currency: String(payroll.currency || 'SAR'),
        items: Array.isArray(payroll.items) ? payroll.items : [],
        created_at: String(payroll.created_at || '')
    };

    // Calculate totals
    const grossPay = safePayroll.base_salary + safePayroll.overtime_amount + safePayroll.bonus_amount;
    const totalDeductions = safePayroll.advance_deduction;
    const netPay = grossPay - totalDeductions;

    // Format dates
    const periodDate = new Date(safePayroll.year, safePayroll.month - 1, 1);
    const formattedPeriod = format(periodDate, 'MMMM yyyy');
    const formattedCreatedAt = format(parseISO(safePayroll.created_at), 'MM/dd/yyyy');

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle download as PDF
    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/hr/payroll/${safePayroll.id}/payslip`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Accept: 'application/pdf',
                },
            });
            if (!response.ok) {
                const text = await response.text();
                toast.error('Failed to download PDF', { description: text });
                throw new Error('Failed to download PDF');
            }
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/pdf')) {
                const text = await response.text();
                toast.warning('PDF downloaded, but response was not a PDF.', { description: text });
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${safeEmployee.employee_id}_${safePayroll.month}_${safePayroll.year}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            toast.error('Failed to download PDF');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const input = payslipRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4',
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        pdf.save('Payslip-' + (new Date()).toISOString().slice(0, 10) + '.pdf');
    };

    return (
        <AppLayout title="Payroll Payslip" breadcrumbs={breadcrumbs} requiredPermission="payroll.view">
            <Head title="Payroll Payslip" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between print:hidden">
                    <h1 className="text-2xl font-bold tracking-tight">Payroll Payslip</h1>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <a href="/hr/payroll">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </a>
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="default" onClick={handleDownload} disabled={isLoading}>
                            <Download className="mr-2 h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Download PDF (Backend)'}
                        </Button>
                        <Button variant="default" onClick={handleDownloadPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF (UI)
                        </Button>
                    </div>
                </div>
                <div ref={payslipRef}>
                    <Card className="card-container print:shadow-none">
                        <CardHeader className="header-container border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                                        <img src="/snd%20logo.png" alt="SND Logo" className="h-14 w-14 object-contain bg-white border border-gray-200 rounded" />
                                    </div>
                                    <div>
                                        <CardTitle className="company-name text-xl">Samhan Naser Al-Dosri Est.</CardTitle>
                                        <CardDescription className="company-subtitle">For Gen. Contracting & Rent. Equipments</CardDescription>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="pay-slip-title text-lg font-semibold">Payroll Payslip</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {formattedPeriod}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3 p-4">
                            {/* Employee & Pay Summary Section - 4 Columns */}
                            <Card className="mb-2 border-none bg-white/90 shadow-none">
                                <CardContent className="p-3">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        {/* Employee Details */}
                                        <div className="flex flex-col gap-1 border-r border-gray-200 pr-0 md:pr-3">
                                            <div className="mb-1 flex items-center gap-1">
                                                <User className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800">Employee Details</span>
                                            </div>
                                            <div className="space-y-0.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">File #:</span>
                                                    <span className="font-semibold text-gray-800">{safeEmployee.employee_id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Name:</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {safeEmployee.first_name} {safeEmployee.last_name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Designation:</span>
                                                    <span className="font-semibold text-gray-800">{safeEmployee.designation}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Department:</span>
                                                    <span className="font-semibold text-gray-800">{safeEmployee.department}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pay Period Details */}
                                        <div className="flex flex-col gap-1 border-r border-gray-200 pr-0 md:pr-3">
                                            <div className="mb-1 flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-semibold text-gray-800">Pay Period</span>
                                            </div>
                                            <div className="space-y-0.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Period:</span>
                                                    <span className="font-semibold text-gray-800">{formattedPeriod}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Generated:</span>
                                                    <span className="font-semibold text-gray-800">{formattedCreatedAt}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Status:</span>
                                                    <span className="font-semibold text-gray-800">{safePayroll.status}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Payroll ID:</span>
                                                    <span className="font-semibold text-gray-800">{safePayroll.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Salary Details */}
                                        <div className="flex flex-col gap-1 border-r border-gray-200 pr-0 md:pr-3">
                                            <div className="mb-1 flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-semibold text-gray-700">Salary Details</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Basic:</span>
                                                <span className="font-bold text-green-700">{formatCurrency(safePayroll.base_salary)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Overtime:</span>
                                                <span className="font-bold text-green-700">{formatCurrency(safePayroll.overtime_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Bonus:</span>
                                                <span className="font-bold text-green-700">{formatCurrency(safePayroll.bonus_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Gross:</span>
                                                <span className="font-bold text-green-700">{formatCurrency(grossPay)}</span>
                                            </div>
                                        </div>

                                        {/* Working Hours */}
                                        <div className="flex flex-col gap-1">
                                            <div className="mb-1 flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-700">Working Hours</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Total:</span>
                                                <span>{safePayroll.total_worked_hours}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Regular:</span>
                                                <span>{safePayroll.total_worked_hours - safePayroll.overtime_hours}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Overtime:</span>
                                                <span className="text-blue-600">{safePayroll.overtime_hours}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Rate:</span>
                                                <span>{formatCurrency(safePayroll.base_salary / (safePayroll.total_worked_hours || 1))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>



                            {/* Payroll Summary */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold">Payroll Summary</h3>
                                </div>

                                                                <div className="rounded-md border bg-white shadow-sm">
                                    {/* Earnings & Deductions Section */}
                                    <div className="border-b border-gray-200 p-3">
                                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Earnings & Deductions</h4>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <div className="font-medium text-gray-600">Basic Salary:</div>
                                            <div className="text-right font-medium">{formatCurrency(safePayroll.base_salary)}</div>

                                            <div className="font-medium text-gray-600">Overtime Pay:</div>
                                            <div className="text-right text-green-600">{formatCurrency(safePayroll.overtime_amount)}</div>

                                            <div className="font-medium text-gray-600">Bonus:</div>
                                            <div className="text-right text-green-600">{formatCurrency(safePayroll.bonus_amount)}</div>

                                            <div className="font-medium text-gray-600">Advance Deductions:</div>
                                            <div className="text-right text-red-600">{formatCurrency(safePayroll.advance_deduction)}</div>
                                        </div>
                                    </div>

                                    {/* Net Pay Section */}
                                    <div className="p-3 bg-gray-50">
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <div className="font-bold text-gray-800">Net Pay:</div>
                                            <div className="text-right font-bold text-lg text-green-600">{formatCurrency(netPay)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Record */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold">Attendance Record</h3>
                                </div>

                                <div className="overflow-x-auto rounded-md border">
                                    <div className="bg-white p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-gray-700">attendance_record</span>
                                        </div>

                                        {/* Attendance Table */}
                                        <div className="overflow-x-auto">
                                            {!attendanceData && (
                                                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                                    <p className="text-sm text-yellow-800">
                                                        ⚠️ No attendance data received from backend. Showing sample data.
                                                    </p>
                                                </div>
                                            )}

                                            <table className="min-w-full border-collapse border border-gray-300 attendance-table">
                                                <thead>
                                                    <tr className="bg-black text-white">
                                                        {Array.from({ length: new Date(safePayroll.year, safePayroll.month, 0).getDate() }, (_, i) => (
                                                            <th key={i + 1} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium">
                                                                {String(i + 1).padStart(2, '0')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                    <tr className="bg-gray-100">
                                                        {Array.from({ length: new Date(safePayroll.year, safePayroll.month, 0).getDate() }, (_, i) => {
                                                            const day = i + 1;
                                                            const dayData = attendanceData?.[day];
                                                            const dayName = dayData?.day_name || ['M', 'T', 'W', 'T', 'F', 'S', 'S'][(day - 1) % 7];
                                                            return (
                                                                <th key={day} className="border border-gray-300 px-1 py-1 text-center text-xs font-medium text-gray-600">
                                                                    {dayName}
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Attendance Status Row */}
                                                    <tr>
                                                        {Array.from({ length: new Date(safePayroll.year, safePayroll.month, 0).getDate() }, (_, i) => {
                                                            const day = i + 1;
                                                            const dayData = attendanceData?.[day];

                                                            // Always use real data if available
                                                            const status = dayData?.status || 'A';
                                                            const totalHours = dayData?.total_hours || 0;

                                                            let bgColor = 'bg-green-100';
                                                            let textColor = 'text-green-700';

                                                            // Set colors based on status
                                                            switch (status) {
                                                                case 'F':
                                                                    bgColor = 'bg-blue-100';
                                                                    textColor = 'text-blue-700';
                                                                    break;
                                                                case 'A':
                                                                    bgColor = 'bg-red-100';
                                                                    textColor = 'text-red-700';
                                                                    break;
                                                                case 'O':
                                                                    bgColor = 'bg-blue-100';
                                                                    textColor = 'text-blue-700';
                                                                    break;
                                                                case '8':
                                                                default:
                                                                    bgColor = 'bg-green-100';
                                                                    textColor = 'text-green-700';
                                                                    break;
                                                            }

                                                            return (
                                                                <td key={day} className={`border border-gray-300 px-1 py-1 text-center text-xs font-medium ${bgColor} ${textColor}`}>
                                                                    {status}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                    {/* Hours Row */}
                                                    <tr>
                                                        {Array.from({ length: new Date(safePayroll.year, safePayroll.month, 0).getDate() }, (_, i) => {
                                                            const day = i + 1;
                                                            const dayData = attendanceData?.[day];

                                                            // Always use real data if available
                                                            const totalHours = dayData?.total_hours || 0;

                                                            return (
                                                                <td key={day} className="border border-gray-300 px-1 py-1 text-center text-xs text-gray-600">
                                                                    {totalHours}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>



                                        {/* Legend */}
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs attendance-legend">
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-3 w-3 rounded bg-green-500"></span>
                                                <span className="text-green-700">8 = regular hours</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-3 w-3 rounded bg-blue-500"></span>
                                                <span className="text-blue-700">O = overtime hours</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-3 w-3 rounded bg-red-500"></span>
                                                <span className="text-red-700">A = absent</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="inline-block h-3 w-3 rounded bg-blue-300"></span>
                                                <span className="text-blue-700">F = Friday (weekend)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {safePayroll.notes && (
                                <div className="space-y-1">
                                    <h3 className="font-semibold">Notes</h3>
                                    <div className="rounded-md border bg-gray-50 p-2 text-sm">
                                        <p className="text-gray-700">{safePayroll.notes}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-end border-t pt-4">
                            <div className="grid grid-cols-3 gap-x-12 text-sm">
                                <div className="text-center">
                                    <p className="mb-1 font-semibold">Chief-Accountant</p>
                                    <p className="text-muted-foreground italic">Samir Taima</p>
                                    <div className="mt-4 border-t border-gray-300 pt-1">Signature</div>
                                </div>
                                <div className="text-center">
                                    <p className="mb-1 font-semibold">Verified By</p>
                                    <p className="text-muted-foreground italic">Salem Samhan Al-Dosri</p>
                                    <div className="mt-4 border-t border-gray-300 pt-1">Signature</div>
                                </div>
                                <div className="text-center">
                                    <p className="mb-1 font-semibold">Approved By</p>
                                    <p className="text-muted-foreground italic">Nasser Samhan Al-Dosri</p>
                                    <div className="mt-4 border-t border-gray-300 pt-1">Signature</div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
