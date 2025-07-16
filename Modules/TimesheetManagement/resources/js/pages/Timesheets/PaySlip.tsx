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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Core/components/ui/table';

interface DayData {
    date: string;
    day_of_week: string;
    day_name: string;
    regular_hours: number;
    overtime_hours: number;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id?: string;
    designation?: string;
    hourly_rate?: number;
    basic_salary?: number;
    food_allowance?: number;
    housing_allowance?: number;
    transport_allowance?: number;
    advance_payment?: number;
}

interface SalaryDetails {
    basic_salary: number;
    total_allowances: number;
    absent_deduction: number;
    overtime_pay: number;
    advance_payment: number;
    net_salary: number;
}

interface Props extends PageProps {
    employee: Employee;
    month: string;
    year: string;
    start_date: string;
    end_date: string;
    total_regular_hours: number;
    total_overtime_hours: number;
    total_hours: number;
    days_worked: number;
    calendar: Record<string, DayData>;
    salary_details?: SalaryDetails;
    absent_days: number;
    location?: string;
    month_name?: string;
}

// Add print styles
const printStyles = `;
  @media print {
    @page {
      size: A4;
      margin: 10mm;
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

    .absent-cell {
      background-color: #FF0000 !important;
      color: white !important;
    }

    .friday-cell {
      background-color: #92D050 !important;
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
  }
`;

export default function PaySlip({
    auth,
    employee,
    month,
    year,
    start_date,
    end_date,
    total_regular_hours,
    total_overtime_hours,
    total_hours,
    days_worked,
    calendar,
    salary_details,
    absent_days,
    location,
    month_name,
}: Props) {
    const { t } = useTranslation('TimesheetManagement');

    // Breadcrumbs must be defined after t is available
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: 'Pay Slip', href: '#' },
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

    // Calculate pay details if not provided
    const basicSalary = Number(employee.basic_salary) || 0;
    const foodAllowance = Number(employee.food_allowance) || 0;
    const housingAllowance = Number(employee.housing_allowance) || 0;
    const transportAllowance = Number(employee.transport_allowance) || 0;
    const totalAllowances = Number(salary_details?.total_allowances) || 0;
    const advancePayment = Number(employee.advance_payment) || 0;
    const absentDeduction = Number(salary_details?.absent_deduction) || 0;
    const overtimePay = Number(salary_details?.overtime_pay) || 0;
    const netSalary = Number(salary_details?.net_salary) || 0;

    // Set default contract days if not available
    const contractDaysPerMonth = 22;

    // Calculate overtime details
    const hourlyRate = employee.hourly_rate ?? basicSalary / (8 * contractDaysPerMonth);
    const overtimeRate = hourlyRate * 1.5;

    // Calculate deductions
    const absentDays = Math.max(0, contractDaysPerMonth - days_worked);
    const absentHours = absentDays * 8;

    // Format dates
    const formattedStartDate = start_date ? format(parseISO(start_date), 'MM/dd/yyyy') : '';
    const formattedEndDate = end_date ? format(parseISO(end_date), 'MM/dd/yyyy') : '';

    // Calculate number of days in the month
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle download as PDF
    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                employee_id: employee.id.toString(),
                month: month.toString(),
                year: year.toString(),
            });
            const response = await fetch(`/timesheets/payslip/pdf?${params.toString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Accept: 'application/pdf',
                },
            });
            if (!response.ok) throw new Error('Failed to download PDF');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${employee.id}_${month}_${year}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to download PDF');
        } finally {
            setIsLoading(false);
        }
    };

    // Create calendar data for the month
    const calendarDays = calendar ? Object.values(calendar).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

    // Check if we have all the required data
    if (!employee || !month || !year || !start_date || !end_date) {
        return (
            <AppLayout title={t('ttl_employee_pay_slip')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
                <Head title={t('ttl_employee_pay_slip')} />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_error_loading_pay_slip')}</CardTitle>
                            <CardDescription>There was an error loading the pay slip data. Please try again.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" asChild>
                                <a href={(route as any)('employees.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('employee:btn_back_to_employees')}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={t('ttl_employee_pay_slip')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
            <Head title={t('ttl_employee_pay_slip')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between print:hidden">
                    <h1 className="text-2xl font-bold tracking-tight">{t('pay_slip')}</h1>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <a href={(route as any)('employees.show', { employee: employee.id })}>
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
                            {isLoading ? t('generating', 'Generating...') : t('download_pdf', 'Download PDF')}
                        </Button>
                    </div>
                </div>

                <Card className="card-container print:shadow-none">
                    <CardHeader className="header-container border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                                    <img src="/logo.png" alt={t('company_logo')} className="h-14 w-14 object-contain" />
                                </div>
                                <div>
                                    <CardTitle className="company-name text-xl">Samhan Naser Al-Dosri Est.</CardTitle>
                                    <CardDescription className="company-subtitle">For Gen. Contracting & Rent. Equipments</CardDescription>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="pay-slip-title text-lg font-semibold">{t('ttl_employee_pay_slip')}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {month} {year}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                        {/* Employee & Pay Summary Section - 5 Equal Columns */}
                        <Card className="mb-6 border-none bg-white/90 shadow-none">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                                    {/* Employee Details */}
                                    <div className="flex flex-col gap-2 border-r border-gray-200 pr-0 md:pr-4">
                                        <div className="mb-1 flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            <span className="text-base font-semibold text-gray-800">{t('employee_details')}</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">File #:</span>
                                                <span className="font-semibold text-gray-800">{employee.employee_id || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Name:</span>
                                                <span className="font-semibold text-gray-800">
                                                    {employee.first_name} {employee.last_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Designation:</span>
                                                <span className="font-semibold text-gray-800">{employee.designation || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">ID:</span>
                                                <span className="font-semibold text-gray-800">{employee.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Work Details */}
                                    <div className="flex flex-col gap-2 border-r border-gray-200 pr-0 md:pr-4">
                                        <div className="mb-1 flex items-center gap-2">
                                            <Building className="h-5 w-5 text-primary" />
                                            <span className="text-base font-semibold text-gray-800">{t('work_details')}</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Location:</span>
                                                <span className="font-semibold text-gray-800">{location || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Project:</span>
                                                <span className="font-semibold text-gray-800">-</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Date Range:</span>
                                                <span className="font-semibold text-gray-800">
                                                    {formattedStartDate} to {formattedEndDate}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-500">Month:</span>
                                                <span className="font-semibold text-gray-800">{month_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Salary Details */}
                                    <div className="flex flex-col gap-2 border-r border-gray-200 pr-0 md:pr-4">
                                        <div className="mb-1 flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-base font-semibold text-gray-700">{t('salary_details')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Basic:</span>
                                            <span className="font-bold text-green-700">SAR {basicSalary.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Food:</span>
                                            <span>{foodAllowance > 0 ? `SAR ${foodAllowance.toFixed(2)}` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Housing:</span>
                                            <span>{housingAllowance > 0 ? `SAR ${housingAllowance.toFixed(2)}` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Transport:</span>
                                            <span>{transportAllowance > 0 ? `SAR ${transportAllowance.toFixed(2)}` : '-'}</span>
                                        </div>
                                    </div>
                                    {/* Working Hours */}
                                    <div className="flex flex-col gap-2 border-r border-gray-200 pr-0 md:pr-4">
                                        <div className="mb-1 flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-base font-semibold text-gray-700">{t('working_hours')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Contract:</span>
                                            <span>{contractDaysPerMonth * 8}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Total:</span>
                                            <span>{total_hours}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Regular:</span>
                                            <span>{total_regular_hours}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">OT:</span>
                                            <span>{total_overtime_hours}</span>
                                        </div>
                                    </div>
                                    {/* Other Details */}
                                    <div className="flex flex-col gap-2">
                                        <div className="mb-1 flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-purple-600" />
                                            <span className="text-base font-semibold text-gray-700">{t('other_details')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Advance:</span>
                                            <span className="text-right font-semibold text-orange-600">
                                                {advancePayment > 0 ? `SAR ${advancePayment.toFixed(2)}` : '0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Days Worked:</span>
                                            <span className="text-right font-semibold text-gray-800">{days_worked}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Absent Days:</span>
                                            <span className="text-right font-bold text-red-600">{absent_days}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Timesheet Calendar */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">{t('attendance_record')}</h3>
                            </div>

                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day, idx, arr) => (
                                                <th
                                                    key={day}
                                                    className={`border bg-black text-center align-middle text-xs font-bold text-white ${idx === 0 ? 'rounded-l-md' : ''} ${idx === arr.length - 1 ? 'rounded-r-md' : ''}`}
                                                >
                                                    {day.toString().padStart(2, '0')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-gray-50">
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const dayDate = new Date(Number(year), Number(month) - 1, day);
                                                const dayName = dayDate.toString() !== 'Invalid Date' ? format(dayDate, 'E') : '';
                                                const isFriday = dayName === 'Fri';
                                                let bgColor = isFriday ? 'bg-blue-100' : '';
                                                return (
                                                    <td key={`day-${day}`} className={`text-center ${bgColor} border p-1 text-xs`}>
                                                        <div className="text-xs text-gray-600">{dayName.substring(0, 1)}</div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const dayDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                                const dayData = calendar[dayDate];
                                                const checkDate = new Date(Number(year), Number(month) - 1, day);
                                                const dayName = checkDate.toString() !== 'Invalid Date' ? format(checkDate, 'E') : '';
                                                const isFriday = dayName === 'Fri';
                                                let content = '';
                                                let textColor = '';
                                                let bgColor = isFriday ? 'bg-blue-100' : '';
                                                if (dayData) {
                                                    if (Number(dayData.regular_hours) === 0 && Number(dayData.overtime_hours) === 0) {
                                                        if (isFriday) {
                                                            content = 'F';
                                                        } else {
                                                            content = 'A';
                                                            textColor = 'text-red-600';
                                                        }
                                                    } else {
                                                        if (isFriday) {
                                                            content = 'F';
                                                        } else {
                                                            content = `${Number(dayData.regular_hours)}`;
                                                            textColor = 'text-green-600';
                                                        }
                                                    }
                                                } else {
                                                    if (checkDate.getMonth() !== Number(month) - 1) {
                                                        content = '-';
                                                    } else if (isFriday) {
                                                        content = 'F';
                                                    } else {
                                                        content = '-';
                                                    }
                                                }
                                                return (
                                                    <td
                                                        key={`data-${day}`}
                                                        className={`text-center ${bgColor} ${textColor} border p-1 text-xs`}
                                                    >
                                                        {content}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        {/* Overtime row */}
                                        <tr>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const dayDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                                const dayData = calendar[dayDate];
                                                const checkDate = new Date(Number(year), Number(month) - 1, day);
                                                const dayName = checkDate.toString() !== 'Invalid Date' ? format(checkDate, 'E') : '';
                                                const isFriday = dayName === 'Fri';
                                                let content = '0';
                                                let textColor = '';
                                                let bgColor = isFriday ? 'bg-blue-100' : '';
                                                if (dayData && Number(dayData.overtime_hours) > 0) {
                                                    content = `${dayData.overtime_hours}`;
                                                    textColor = 'text-blue-600';
                                                }
                                                return (
                                                    <td key={`ot-${day}`} className={`text-center ${bgColor} ${textColor} border p-1 text-xs`}>
                                                        {content}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                <span className="font-semibold text-green-600">8</span> = regular hours,&nbsp;
                                <span className="font-semibold text-blue-600">More than 8</span> = overtime hours,&nbsp;
                                <span className="font-semibold text-red-600">A</span> = absent,&nbsp;
                                <span className="font-semibold">F</span> = Friday (weekend)
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="font-semibold">{t('attendance_summary')}</h3>
                                <div className="grid grid-cols-2 gap-y-2 rounded-md border bg-gray-50 p-4 text-sm">
                                    <div className="font-medium">Total Hours:</div>
                                    <div className="text-right">{total_hours}</div>

                                    <div className="font-medium">Absent Hours:</div>
                                    <div className="text-right text-red-600">{absentHours}</div>

                                    <div className="font-medium">Absent Days:</div>
                                    <div className="text-right text-red-600">{absent_days}</div>

                                    <div className="font-medium">Overtime Hours:</div>
                                    <div className="text-right text-green-600">{total_overtime_hours}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">{t('payment_summary')}</h3>
                                <div className="grid grid-cols-2 gap-y-2 rounded-md border bg-gray-50 p-4 text-sm">
                                    <div className="font-medium">Basic Salary:</div>
                                    <div className="text-right font-semibold">SAR {basicSalary.toFixed(2)}</div>

                                    <div className="font-medium">Allowances:</div>
                                    <div className="text-right">SAR {totalAllowances.toFixed(2)}</div>

                                    <div className="font-medium">Absent Deduction:</div>
                                    <div className="text-right text-red-600">SAR {absentDeduction.toFixed(2)}</div>

                                    <div className="font-medium">Overtime Pay:</div>
                                    <div className="text-right text-green-600">SAR {overtimePay.toFixed(2)}</div>

                                    <div className="font-medium">Advance:</div>
                                    <div className="text-right text-red-600">SAR {advancePayment.toFixed(2)}</div>

                                    <Separator className="col-span-2 my-1" />

                                    <div className="font-medium">Total Deductions:</div>
                                    <div className="text-right text-red-600">SAR {(absentDeduction + advancePayment).toFixed(2)}</div>

                                    <div className="font-medium">Net Salary:</div>
                                    <div className="text-right font-bold text-green-600">SAR {netSalary.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end border-t pt-6">
                        <div className="grid grid-cols-3 gap-x-12 text-sm">
                            <div className="text-center">
                                <p className="mb-1 font-semibold">Chief-Accountant</p>
                                <p className="text-muted-foreground italic">{t('samir_taima')}</p>
                                <div className="mt-8 border-t border-gray-300 pt-1">Signature</div>
                            </div>
                            <div className="text-center">
                                <p className="mb-1 font-semibold">{t('verified_by')}</p>
                                <p className="text-muted-foreground italic">{t('salem_samhan_al_dosri')}</p>
                                <div className="mt-8 border-t border-gray-300 pt-1">Signature</div>
                            </div>
                            <div className="text-center">
                                <p className="mb-1 font-semibold">{t('approved_by')}</p>
                                <p className="text-muted-foreground italic">{t('nasser_samhan_al_dosri')}</p>
                                <div className="mt-8 border-t border-gray-300 pt-1">Signature</div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
