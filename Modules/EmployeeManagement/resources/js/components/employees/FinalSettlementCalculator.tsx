import { Button } from '@/Core/components/ui/button';
import { Input } from '@/Core/components/ui/input';
import { Label } from '@/Core/components/ui/label';
import { Separator } from '@/Core/components/ui/separator';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import axios from 'axios';
import { AlertCircle, FileDown, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';

interface Employee {
    id: number;
    name: string;
    position: string;
    department: string;
    hire_date: string;
    salary: number;
    has_advances: boolean;
}

interface CalculationResult {
    basic_salary: number;
    outstanding_salary: number;
    leave_encashment: number;
    gratuity_amount: number;
    notice_period_compensation: number;
    deductions: {
        id: number;
        name: string;
        amount: number;
    }[];
    advance_repayments: {
        id: number;
        reference: string;
        original_amount: number;
        outstanding: number;
    }[];
    bonus_payments: number;
    total_payable: number;
    years_of_service: number;
    service_days: number;
}

export const FinalSettlementCalculator: React.FC = () => {
    const { t } = useTranslation('employees');
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [lastWorkingDate, setLastWorkingDate] = useState<Date | undefined>(new Date());
    const [noticeProvided, setNoticeProvided] = useState(true);
    const [noticePeriodDays, setNoticePeriodDays] = useState<string>('30');
    const [noticeDaysServed, setNoticeDaysServed] = useState<string>('0');
    const [remarks, setRemarks] = useState('');
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [customDeductions, setCustomDeductions] = useState<Array<{ name: string; amount: string }>>([{ name: '', amount: '' }]);
    const [bonusPayment, setBonusPayment] = useState<string>('0');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            console.log(t('employees:error_loading_employees'));
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployeeId(value);
        setCalculationResult(null);
    };

    const addCustomDeduction = () => {
        setCustomDeductions([...customDeductions, { name: '', amount: '' }]);
    };

    const removeCustomDeduction = (index: number) => {
        const updatedDeductions = [...customDeductions];
        updatedDeductions.splice(index, 1);
        setCustomDeductions(updatedDeductions);
    };

    const updateCustomDeduction = (index: number, field: 'name' | 'amount', value: string) => {
        const updatedDeductions = [...customDeductions];
        updatedDeductions[index][field] = value;
        setCustomDeductions(updatedDeductions);
    };

    const calculateSettlement = async () => {
        if (!selectedEmployeeId || !lastWorkingDate) {
            console.log(t('employees:select_employee_and_date'));
            return;
        }

        setCalculating(true);
        try {
            // Prepare custom deductions - filter out empty ones
            const validDeductions = customDeductions.filter((d) => d.name.trim() !== '' && d.amount.trim() !== '' && parseFloat(d.amount) > 0);

            const response = await axios.post('/api/employees/final-settlement/calculate', {
                employee_id: parseInt(selectedEmployeeId),
                last_working_date: lastWorkingDate.toISOString().split('T')[0],
                notice_provided: noticeProvided,
                notice_period_days: parseInt(noticePeriodDays),
                notice_days_served: parseInt(noticeDaysServed),
                custom_deductions: validDeductions.map((d) => ({
                    name: d.name,
                    amount: parseFloat(d.amount),
                })),
                bonus_payment: parseFloat(bonusPayment) || 0,
                remarks: remarks,
            });

            setCalculationResult(response.data.data);
            console.log(t('employees:settlement_calculated_success'));
        } catch (error: any) {
            console.error('Error calculating settlement:', error);

            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log(t('employees:error_calculating_settlement'));
            }
        } finally {
            setCalculating(false);
        }
    };

    const generateSettlementDocument = async () => {
        if (!calculationResult || !selectedEmployeeId || !lastWorkingDate) {
            console.log(t('employees:calculate_settlement_first'));
            return;
        }

        setGenerating(true);
        try {
            const response = await axios.post(
                '/api/employees/final-settlement/generate',
                {
                    employee_id: parseInt(selectedEmployeeId),
                    last_working_date: lastWorkingDate.toISOString().split('T')[0],
                    notice_provided: noticeProvided,
                    notice_period_days: parseInt(noticePeriodDays),
                    notice_days_served: parseInt(noticeDaysServed),
                    custom_deductions: customDeductions
                        .filter((d) => d.name.trim() !== '' && d.amount.trim() !== '' && parseFloat(d.amount) > 0)
                        .map((d) => ({
                            name: d.name,
                            amount: parseFloat(d.amount),
                        })),
                    bonus_payment: parseFloat(bonusPayment) || 0,
                    remarks: remarks,
                },
                {
                    responseType: 'blob',
                },
            );

            // Create a download link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const selectedEmployee = employees.find((e) => e.id === parseInt(selectedEmployeeId));
            const employeeName = selectedEmployee?.name || 'employee';
            const formattedDate = new Date().toISOString().split('T')[0];

            link.setAttribute('download', `Final_Settlement_${employeeName.replace(/\s+/g, '_')}_${formattedDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(t('employees:settlement_document_generated_success'));
        } catch (error) {
            console.error('Error generating settlement document:', error);
            console.log(t('employees:error_generating_settlement'));
        } finally {
            setGenerating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return formatDateMedium(dateString);
    };

    const selectedEmployee = employees.find((e) => e.id === parseInt(selectedEmployeeId));

    return (
        <div>
            <Card>
                <div className="p-4">
                    <div className="p-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="employee">{t('lbl_select_employee')}</Label>
                                <select
                                    id="employee"
                                    value={selectedEmployeeId}
                                    onChange={(e) => handleEmployeeChange(e.target.value)}
                                    disabled={calculating}
                                    className="w-full"
                                >
                                    <option value="">{t('ph_select_an_employee')}</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id.toString()}>
                                            {employee.name} - {employee.position}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('lbl_last_working_date')}</Label>
                                <input
                                    type="date"
                                    value={lastWorkingDate ? lastWorkingDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setLastWorkingDate(new Date(e.target.value))}
                                    disabled={calculating}
                                />
                            </div>
                        </div>

                        {selectedEmployee && (
                            <div className="rounded-md bg-muted p-4">
                                <h3 className="mb-2 font-medium">{t('employee_information')}</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <p className="font-medium">{selectedEmployee.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{selectedEmployee.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('hire_date')}</p>
                                        <p className="font-medium">{formatDate(selectedEmployee.hire_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('monthly_salary')}</p>
                                        <p className="font-medium">{formatCurrency(selectedEmployee.salary)}</p>
                                    </div>
                                    {selectedEmployee.has_advances && (
                                        <div className="md:col-span-2">
                                            <div className="alert alert-destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <div className="font-bold">{t('ttl_outstanding_advances')}</div>
                                                <div className="text-sm">
                                                    This employee has outstanding salary advances that will be deducted from the final settlement.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-medium">{t('notice_period_details')}</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="noticeProvided"
                                    checked={noticeProvided}
                                    onChange={(e) => setNoticeProvided(e.target.checked)}
                                    disabled={calculating}
                                />
                                <Label htmlFor="noticeProvided">Notice period provided by employee</Label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="noticePeriodDays">Notice Period (days)</Label>
                                    <Input
                                        id="noticePeriodDays"
                                        type="number"
                                        value={noticePeriodDays}
                                        onChange={(e) => setNoticePeriodDays(e.target.value)}
                                        disabled={calculating}
                                        min="0"
                                        max="90"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="noticeDaysServed">{t('lbl_days_served_in_notice_period')}</Label>
                                    <Input
                                        id="noticeDaysServed"
                                        type="number"
                                        value={noticeDaysServed}
                                        onChange={(e) => setNoticeDaysServed(e.target.value)}
                                        disabled={calculating || !noticeProvided}
                                        min="0"
                                        max={noticePeriodDays}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">{t('additional_deductions')}</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addCustomDeduction} disabled={calculating}>
                                    Add Deduction
                                </Button>
                            </div>

                            {customDeductions.map((deduction, index) => (
                                <div key={index} className="grid items-end gap-4 md:grid-cols-3">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`deduction-name-${index}`}>Deduction Description</Label>
                                        <Input
                                            id={`deduction-name-${index}`}
                                            value={deduction.name}
                                            onChange={(e) => updateCustomDeduction(index, 'name', e.target.value)}
                                            placeholder={t('ph_eg_company_property_damage')}
                                            disabled={calculating}
                                        />
                                    </div>

                                    <div className="flex items-end gap-2 space-y-2">
                                        <div className="flex-1">
                                            <Label htmlFor={`deduction-amount-${index}`}>Amount</Label>
                                            <Input
                                                id={`deduction-amount-${index}`}
                                                value={deduction.amount}
                                                onChange={(e) => updateCustomDeduction(index, 'amount', e.target.value)}
                                                placeholder="0.00"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                disabled={calculating}
                                            />
                                        </div>

                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeCustomDeduction(index)}
                                                disabled={calculating}
                                                className="mb-0.5"
                                            >
                                                &times;
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bonusPayment">{t('additional_bonus_payment')}</Label>
                            <Input
                                id="bonusPayment"
                                type="number"
                                value={bonusPayment}
                                onChange={(e) => setBonusPayment(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={calculating}
                            />
                            <p className="text-sm text-muted-foreground">
                                Any additional bonus or ex-gratia payment to be included in the final settlement.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder={t('ph_add_any_additional_notes_regarding_this_settlem')}
                                rows={3}
                                disabled={calculating}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={calculateSettlement} disabled={calculating || !selectedEmployeeId || !lastWorkingDate}>
                                {calculating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    'Calculate Settlement'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {calculationResult && (
                <Card>
                    <div className="p-4">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 font-medium">{t('service_information')}</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Years of Service:</span>
                                            <span className="font-medium">{calculationResult.years_of_service.toFixed(2)} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Days of Service:</span>
                                            <span className="font-medium">{calculationResult.service_days} days</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-medium">{t('salary_information')}</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Basic Monthly Salary:</span>
                                            <span className="font-medium">{formatCurrency(calculationResult.basic_salary)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3 font-medium">{t('settlement_components')}</h3>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                            >
                                                Component
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                                            >
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                {t('outstanding_salary')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(calculationResult.outstanding_salary)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{t('leave_encashment')}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(calculationResult.leave_encashment)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Gratuity</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(calculationResult.gratuity_amount)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                {t('notice_period_compensation')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(calculationResult.notice_period_compensation)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                {t('additional_bonus_payment')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(calculationResult.bonus_payments)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {calculationResult.deductions.length > 0 || calculationResult.advance_repayments.length > 0 ? (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="mb-3 font-medium">Deductions</h3>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                    >
                                                        Deduction
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                    >
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {calculationResult.advance_repayments.map((advance) => (
                                                    <tr key={`advance-${advance.id}`}>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            Outstanding Advance: {advance.reference}
                                                            <span className="block text-xs text-gray-500">
                                                                Original Amount: {formatCurrency(advance.original_amount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                                                            {formatCurrency(advance.outstanding)}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {calculationResult.deductions.map((deduction) => (
                                                    <tr key={`deduction-${deduction.id}`}>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            {deduction.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                                                            {formatCurrency(deduction.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : null}

                            <Separator />

                            <div className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-4">
                                <h3 className="text-lg font-medium">{t('total_payable_amount')}</h3>
                                <span className="text-xl font-bold">{formatCurrency(calculationResult.total_payable)}</span>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" onClick={calculateSettlement} disabled={calculating}>
                                    Recalculate
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={generateSettlementDocument}
                                    disabled={generating}
                                    className="flex items-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown className="h-4 w-4" />
                                            Generate PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 text-xs text-gray-500">
                        <p>
                            This settlement calculation is based on company policies and applicable labor laws. The final amount may be subject to tax
                            deductions as per the local tax regulations.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FinalSettlementCalculator;
