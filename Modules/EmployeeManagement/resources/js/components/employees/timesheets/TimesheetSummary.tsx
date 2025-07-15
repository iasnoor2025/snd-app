import { Card, CardContent, CardHeader, CardTitle } from '@/Core';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DailyTimesheetRecords } from '../../../../../../../Modules/TimesheetManagement/resources/js/components/timesheets/DailyTimesheetRecords';

axios.defaults.withCredentials = true;

interface TimesheetSummary {
    total_hours: number;
    regular_hours: number;
    overtime_hours: number;
    days_worked: number;
    days_absent: number;
}

interface TimesheetRecord {
    date: string;
    day: string;
    dayName: string;
    regularHours: number;
    overtimeHours: number;
    status: string;
}

interface TimesheetSummaryProps {
    employeeId?: number;
    showEmployeeSelector?: boolean;
}

export const TimesheetSummary: React.FC<TimesheetSummaryProps> = ({ employeeId, showEmployeeSelector = false }) => {
    const { t } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [summary, setSummary] = useState<TimesheetSummary | null>(null);
    const [dailyRecords, setDailyRecords] = useState<TimesheetRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(employeeId);

    // Fetch employees if selector is enabled
    useEffect(() => {
        if (showEmployeeSelector) {
            axios
                .get('/employees')
                .then((response) => {
                    setEmployees(
                        response.data.map((emp: any) => ({
                            id: emp.id,
                            name: emp.name,
                        })),
                    );
                })
                .catch((error) => {
                    console.error('Error fetching employees:', error);
                });
        }
    }, [showEmployeeSelector]);

    // Set selected employee ID when employeeId prop changes
    useEffect(() => {
        setSelectedEmployeeId(employeeId);
    }, [employeeId]);

    // Fetch timesheet data
    useEffect(() => {
        if (!selectedEmployeeId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                await axios.get('/sanctum/csrf-cookie');
                const monthString = format(selectedMonth, 'yyyy-MM');
                const startDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'yyyy-MM-dd');
                const endDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0), 'yyyy-MM-dd');

                // Fetch summary data
                const summaryResponse = await axios.get(
                    `/api/v1/employees/${selectedEmployeeId}/timesheets/total-hours?start_date=${startDate}&end_date=${endDate}`,
                );
                setSummary(summaryResponse.data);

                // Fetch timesheets for daily records
                const timesheetsResponse = await axios.get(
                    `/api/v1/employees/${selectedEmployeeId}/timesheets?start_date=${startDate}&end_date=${endDate}`,
                );

                // Use the calendar structure from the API (matching payslip)
                const calendar = timesheetsResponse.data.calendar || [];
                setDailyRecords(
                    (calendar as any[]).map((day: any) => ({
                        date: day.date,
                        day: day.date.split('-')[2],
                        dayName: day.day_name,
                        regularHours: day.regular_hours,
                        overtimeHours: day.overtime_hours,
                        status: day.regular_hours > 0 || day.overtime_hours > 0 ? 'present' : day.day_name === 'Fri' ? 'friday' : 'absent',
                    })),
                );

                // Calculate summary from calendar
                const totalRegular = (calendar as any[]).reduce((sum: number, d: any) => sum + (d.regular_hours || 0), 0);
                const totalOvertime = (calendar as any[]).reduce((sum: number, d: any) => sum + (d.overtime_hours || 0), 0);
                const daysWorked = (calendar as any[]).filter((d: any) => (d.regular_hours || 0) > 0 || (d.overtime_hours || 0) > 0).length;
                const daysAbsent = (calendar as any[]).filter(
                    (d: any) => (d.regular_hours || 0) === 0 && (d.overtime_hours || 0) === 0 && d.day_name !== 'Fri',
                ).length;
                setSummary({
                    total_hours: totalRegular + totalOvertime,
                    regular_hours: totalRegular,
                    overtime_hours: totalOvertime,
                    days_worked: daysWorked,
                    days_absent: daysAbsent,
                } as any);
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    setSummary({ total_hours: 0, regular_hours: 0, overtime_hours: 0, days_worked: 0, days_absent: 0 });
                    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
                    const records = [];
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayName = format(date, 'EEE');
                        records.push({
                            date: dateStr,
                            day: String(day),
                            dayName,
                            regularHours: 0,
                            overtimeHours: 0,
                            status: 'A',
                        });
                    }
                    setDailyRecords(records);
                } else {
                    console.error('Error fetching timesheet data:', error);
                    toast(t('msg_failed_load_timesheet_data'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedEmployeeId, selectedMonth]);

    // Month/year selector like payslip
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 years back, 2 years forward
    const months = [
        { value: 0, label: t('month_january') },
        { value: 1, label: t('month_february') },
        { value: 2, label: t('month_march') },
        { value: 3, label: t('month_april') },
        { value: 4, label: t('month_may') },
        { value: 5, label: t('month_june') },
        { value: 6, label: t('month_july') },
        { value: 7, label: t('month_august') },
        { value: 8, label: t('month_september') },
        { value: 9, label: t('month_october') },
        { value: 10, label: t('month_november') },
        { value: 11, label: t('month_december') },
    ];

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setSelectedMonth(new Date(selectedMonth.getFullYear(), newMonth, 1));
    };
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setSelectedMonth(new Date(newYear, selectedMonth.getMonth(), 1));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-2xl font-bold">{t('timesheet_summary')}</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {showEmployeeSelector && employees.length > 0 && (
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2"
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                        >
                            <option value="">{t('lbl_select_employee')}</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Payslip-style month/year selector */}
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedMonth.getMonth()}
                            onChange={handleMonthChange}
                            className="rounded-md border border-input bg-background px-2 py-1"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedMonth.getFullYear()}
                            onChange={handleYearChange}
                            className="rounded-md border border-input bg-background px-2 py-1"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : !selectedEmployeeId ? (
                <div className="py-8 text-center text-muted-foreground">{t('msg_select_employee_to_view_timesheet')}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{t('regular_hours')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.regular_hours?.toFixed(1) || '0.0'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{t('overtime_hours')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.overtime_hours?.toFixed(1) || '0.0'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{t('th_total_hours')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.total_hours?.toFixed(1) || '0.0'}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('ttl_monthly_timesheet_records')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {DailyTimesheetRecords ? (
                                <DailyTimesheetRecords
                                    timesheets={dailyRecords}
                                    selectedMonth={format(selectedMonth, 'yyyy-MM')}
                                    showSummary={true}
                                />
                            ) : (
                                <div className="text-muted-foreground italic">{t('msg_daily_timesheet_component_not_found')}</div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};
