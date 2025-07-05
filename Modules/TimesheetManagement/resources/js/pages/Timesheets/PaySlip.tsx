import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/Core/types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Badge } from "@/Core";
import { Separator } from "@/Core";
import {
  ArrowLeft,
  Printer,
  Download,
  Calendar,
  User,
  Building,
  DollarSign,
  Clock,
  MapPin,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
  position?: string;
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
  salary_details
}: Props) {
  const { t } = useTranslation('TimesheetManagement');

  // Breadcrumbs must be defined after t is available
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
    { title: 'Employees', href: '/employees' },
    { title: 'Pay Slip', href: '#' }
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
  const hourlyRate = employee.hourly_rate ?? (basicSalary / (8 * contractDaysPerMonth));
  const overtimeRate = hourlyRate * 1.5;

  // Calculate deductions
  const absentDays = Math.max(0, contractDaysPerMonth - days_worked);
  const absentHours = absentDays * 8;

  // Format dates
  const formattedStartDate = start_date ? format(parseISO(start_date), 'MM/dd/yyyy') : '';
  const formattedEndDate = end_date ? format(parseISO(end_date), 'MM/dd/yyyy') : '';

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download as PDF
  const handleDownload = () => {
    setIsLoading(true);
    // This would typically call an API endpoint to generate a PDF
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      alert('PDF download functionality would be implemented here');
    }, 1000);
  };

  // Create calendar data for the month
  const calendarDays = calendar
    ? Object.values(calendar).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : [];

  // Check if we have all the required data
  if (!employee || !month || !year || !start_date || !end_date) {
    return (
      <AppLayout title={t('ttl_employee_pay_slip')} breadcrumbs={breadcrumbs} requiredPermission="timesheets.view">
        <Head title={t('ttl_employee_pay_slip')} />
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('ttl_error_loading_pay_slip')}</CardTitle>
              <CardDescription>
                There was an error loading the pay slip data. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href={route('employees.index')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('employee:btn_back_to_employees')}
                </Link>
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
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold tracking-tight">{t('pay_slip')}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={route('employees.show', { employee: employee.id })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
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

        <Card className="print:shadow-none card-container">
          <CardHeader className="pb-4 border-b header-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <img src="/logo.png" alt={t('company_logo')} className="w-14 h-14 object-contain" />
                </div>
                <div>
                  <CardTitle className="text-xl company-name">Samhan Naser Al-Dosri Est.</CardTitle>
                  <CardDescription className="company-subtitle">For Gen. Contracting & Rent. Equipments</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold pay-slip-title">{t('ttl_employee_pay_slip')}</h2>
                <p className="text-sm text-muted-foreground">{month} {year}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t('employee_details')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">File #:</div>
                  <div>{employee.employee_id || '-'}</div>

                  <div className="font-medium">Name:</div>
                  <div>{employee.first_name} {employee.last_name}</div>

                  <div className="font-medium">Position:</div>
                  <div>{employee.position || '-'}</div>

                  <div className="font-medium">ID:</div>
                  <div>{employee.id}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t('work_details')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Location:</div>
                  <div>-</div>

                  <div className="font-medium">Project:</div>
                  <div>-</div>

                  <div className="font-medium">Date Range:</div>
                  <div>{formattedStartDate} to {formattedEndDate}</div>

                  <div className="font-medium">Month:</div>
                  <div>{month} {year}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t('salary_details')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Basic Salary:</div>
                  <div className="font-semibold text-green-600">SAR {basicSalary.toFixed(2)}</div>

                  <div className="font-medium">Food Allowance:</div>
                  <div>{foodAllowance > 0 ? `SAR ${foodAllowance.toFixed(2)}` : '-'}</div>

                  <div className="font-medium">Housing Allowance:</div>
                  <div>{housingAllowance > 0 ? `SAR ${housingAllowance.toFixed(2)}` : '-'}</div>

                  <div className="font-medium">Transport Allowance:</div>
                  <div>{transportAllowance > 0 ? `SAR ${transportAllowance.toFixed(2)}` : '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t('working_hours')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Contract Hours:</div>
                  <div>{contractDaysPerMonth * 8}</div>

                  <div className="font-medium">Total Hours:</div>
                  <div>{total_hours}</div>

                  <div className="font-medium">Regular Hours:</div>
                  <div>{total_regular_hours}</div>

                  <div className="font-medium">Overtime Hours:</div>
                  <div>{total_overtime_hours}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{t('other_details')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Working Location:</div>
                  <div>-</div>

                  <div className="font-medium">Advance Money:</div>
                  <div>{advancePayment > 0 ? `SAR ${advancePayment.toFixed(2)}` : '0'}</div>

                  <div className="font-medium">Days Worked:</div>
                  <div>{days_worked}</div>

                  <div className="font-medium">Absent Days:</div>
                  <div>{absentDays}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timesheet Calendar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{t('attendance_record')}</h3>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <TableHead key={day} className="text-center p-1 text-xs">
                          {day}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-gray-50">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const dayDate = new Date(parseInt(year), parseInt(month) - 1, day);
                        const dayName = dayDate.toString() !== 'Invalid Date' ? format(dayDate, 'E') : '';
                        const isFriday = dayName === 'Fri';
                        let bgColor = isFriday ? 'bg-blue-100' : '';

                        return (
                          <TableCell key={`day-${day}`} className={`text-center ${bgColor} p-1 text-xs border`}>
                            <div className="text-xs text-gray-600">{dayName.substring(0, 1)}</div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const dayDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        const dayData = calendar[dayDate];
                        const checkDate = new Date(parseInt(year), parseInt(month) - 1, day);
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
                          if (checkDate.getMonth() !== parseInt(month) - 1) {
                            content = '-';
                          } else if (isFriday) {
                            content = 'F';
                          } else {
                            content = '-';
                          }
                        }
                        return (
                          <TableCell key={`data-${day}`} className={`text-center ${bgColor} ${textColor} p-1 text-xs border`}>
                            {content}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {/* Overtime row */}
                    <TableRow>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const dayDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        const dayData = calendar[dayDate];
                        const checkDate = new Date(parseInt(year), parseInt(month) - 1, day);
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
                          <TableCell key={`ot-${day}`} className={`text-center ${bgColor} ${textColor} p-1 text-xs border`}>
                            {content}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-green-600 font-semibold mr-2">8/2</span>
                means 8 regular hours and 2 overtime hours.
                <span className="text-red-600 font-semibold mx-2">A</span>
                means absent.
                <span className="font-semibold mx-2">F</span>
                means Friday (weekend).
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t('attendance_summary')}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm border rounded-md p-4 bg-gray-50">
                  <div className="font-medium">Total Hours:</div>
                  <div className="text-right">{total_hours}</div>

                  <div className="font-medium">Absent Hours:</div>
                  <div className="text-right text-red-600">{absentHours}</div>

                  <div className="font-medium">Absent Days:</div>
                  <div className="text-right text-red-600">{absentDays}</div>

                  <div className="font-medium">Overtime Hours:</div>
                  <div className="text-right text-green-600">{total_overtime_hours}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t('payment_summary')}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm border rounded-md p-4 bg-gray-50">
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
                <p className="font-semibold mb-1">Chief-Accountant</p>
                <p className="text-muted-foreground italic">{t('samir_taima')}</p>
                <div className="mt-8 border-t border-gray-300 pt-1">Signature</div>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">{t('verified_by')}</p>
                <p className="text-muted-foreground italic">{t('salem_samhan_al_dosri')}</p>
                <div className="mt-8 border-t border-gray-300 pt-1">Signature</div>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">{t('approved_by')}</p>
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















