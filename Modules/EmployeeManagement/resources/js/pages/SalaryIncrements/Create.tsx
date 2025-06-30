import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Textarea } from "@/Core";
import { RadioGroup, RadioGroupItem } from "@/Core";
import { ArrowLeft, Calculator } from 'lucide-react';
import { AppLayout } from '@/Core';
import { PageProps } from '@/Core/types';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    base_salary: number;
    food_allowance: number;
    housing_allowance: number;
    transport_allowance: number;
    department?: {
        name: string;
    };
    position?: {
        title: string;
    };
}

interface Props extends PageProps {
    employees: Employee[];
    incrementTypes?: Record<string, string>;
}

interface FormData {
    employee_id: string;
    increment_type: string;
    increment_percentage?: number;
    increment_amount?: number;
    effective_date: string;
    reason: string;
    notes?: string;
}

export default function Create({ employees, incrementTypes }: Props) {
  const { t } = useTranslation('employee');

    const { data, setData, post, processing, errors } = useForm<FormData>({
        employee_id: '',
        increment_type: '',
        increment_percentage: undefined,
        increment_amount: undefined,
        effective_date: '',
        reason: '',
        notes: '',
    });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [calculationMethod, setCalculationMethod] = useState<'percentage' | 'fixed'>('percentage');
    const [calculatedSalary, setCalculatedSalary] = useState({
        current_base: 0,
        current_food: 0,
        current_housing: 0,
        current_transport: 0,
        current_total: 0,
        new_base: 0,
        new_food: 0,
        new_housing: 0,
        new_transport: 0,
        new_total: 0,
        increase_amount: 0,
        increase_percentage: 0,
    });

    useEffect(() => {
        if (data.employee_id) {
            const employee = employees.find(emp => emp.id.toString() === data.employee_id);
            setSelectedEmployee(employee || null);
        }
    }, [data.employee_id, employees]);

    useEffect(() => {
        if (selectedEmployee) {
            calculateNewSalary();
        }
    }, [selectedEmployee, data.increment_percentage, data.increment_amount, calculationMethod]);

    const calculateNewSalary = () => {
        if (!selectedEmployee) return;

        // Ensure all salary components are valid numbers (convert strings to numbers)
        const baseSalary = parseFloat(selectedEmployee.base_salary) || 0;
        const foodAllowance = parseFloat(selectedEmployee.food_allowance) || 0;
        const housingAllowance = parseFloat(selectedEmployee.housing_allowance) || 0;
        const transportAllowance = parseFloat(selectedEmployee.transport_allowance) || 0;

        const currentTotal = baseSalary + foodAllowance + housingAllowance + transportAllowance;

        let newBase = baseSalary;
        let newFood = foodAllowance;
        let newHousing = housingAllowance;
        let newTransport = transportAllowance;
        let increaseAmount = 0;
        let increasePercentage = 0;

        if (calculationMethod === 'percentage' && data.increment_percentage) {
            const percentageIncrease = data.increment_percentage / 100;
            newBase = baseSalary * (1 + percentageIncrease);
            newFood = foodAllowance * (1 + percentageIncrease);
            newHousing = housingAllowance * (1 + percentageIncrease);
            newTransport = transportAllowance * (1 + percentageIncrease);
            increasePercentage = data.increment_percentage;
        } else if (calculationMethod === 'fixed' && data.increment_amount) {
            // Distribute fixed amount proportionally across all components
            if (currentTotal > 0) {
                const baseRatio = baseSalary / currentTotal;
                const foodRatio = foodAllowance / currentTotal;
                const housingRatio = housingAllowance / currentTotal;
                const transportRatio = transportAllowance / currentTotal;

                newBase = baseSalary + (data.increment_amount * baseRatio);
                newFood = foodAllowance + (data.increment_amount * foodRatio);
                newHousing = housingAllowance + (data.increment_amount * housingRatio);
                newTransport = transportAllowance + (data.increment_amount * transportRatio);
                increasePercentage = (data.increment_amount / currentTotal) * 100;
            }
        }

        const newTotal = newBase + newFood + newHousing + newTransport;
        increaseAmount = newTotal - currentTotal;

        setCalculatedSalary({
            current_base: baseSalary,
            current_food: foodAllowance,
            current_housing: housingAllowance,
            current_transport: transportAllowance,
            current_total: currentTotal,
            new_base: newBase,
            new_food: newFood,
            new_housing: newHousing,
            new_transport: newTransport,
            new_total: newTotal,
            increase_amount: increaseAmount,
            increase_percentage: increasePercentage,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('salary-increments.store'));
    };

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle NaN, null, undefined values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    return (
        <AppLayout
            title={t('ttl_create_salary_increment')}
            breadcrumbs={[
                { label: 'Salary Increments', href: route('salary-increments.index') },
                { label: 'Create' }
            ]}>
            <div className="flex items-center gap-4 mb-6">
                <Link href={route('salary-increments.index')}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {t('ttl_create_salary_increment')}
                </h2>
            </div>
            <Head title={t('ttl_create_salary_increment')} />

            <div className="py-12">
                <div className="sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Employee Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('employee_information')}</CardTitle>
                                <CardDescription>
                                    Select the employee for salary increment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="employee_id">Employee</Label>
                                    <Select
                                        value={data.employee_id}
                                        onValueChange={(value) => {
                                            setData('employee_id', value);
                                            const employee = employees.find(emp => emp.id.toString() === value);
                                            setSelectedEmployee(employee || null);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_an_employee')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.first_name} {employee.last_name} - {employee.employee_id}
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({employee.department?.name || 'No Department'})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>
                                    )}
                                </div>

                                {selectedEmployee && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">{t('current_employee_details')}</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Name:</span>
                                                <span className="ml-2 font-medium">
                                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Employee ID:</span>
                                                <span className="ml-2 font-medium">{selectedEmployee.employee_id}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Department:</span>
                                                <span className="ml-2 font-medium">{selectedEmployee.department?.name || 'No Department'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Position:</span>
                                                <span className="ml-2 font-medium">{selectedEmployee.position?.title || 'No Position'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Increment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ttl_increment_details')}</CardTitle>
                                <CardDescription>
                                    Specify the increment type and amount
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="increment_type">{t('lbl_increment_type')}</Label>
                                    <Select
                                        value={data.increment_type}
                                        onValueChange={(value) => {
                                            setData('increment_type', value);
                                            // Auto-select Fixed Amount calculation method when Fixed Amount Increase is selected
                                            if (value === 'amount') {
                                                setCalculationMethod('fixed');
                                                setData('increment_percentage', undefined);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_increment_type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {incrementTypes && typeof incrementTypes === 'object' ?
                                                Object.entries(incrementTypes).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {value}
                                                    </SelectItem>
                                                )) : (
                                                    <SelectItem value="no-types" disabled>
                                                        No increment types available
                                                    </SelectItem>
                                                )
                                            }
                                        </SelectContent>
                                    </Select>
                                    {errors.increment_type && (
                                        <p className="text-sm text-red-600 mt-1">{errors.increment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{t('lbl_calculation_method')}</Label>
                                    <RadioGroup
                                        value={calculationMethod}
                                        onValueChange={(value: 'percentage' | 'fixed') => {
                                            setCalculationMethod(value);
                                            if (value === 'percentage') {
                                                setData('increment_amount', undefined);
                                            } else {
                                                setData('increment_percentage', undefined);
                                            }
                                        }}
                                        className="flex gap-6 mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="percentage" id="percentage" />
                                            <Label htmlFor="percentage">Percentage</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="fixed" id="fixed" />
                                            <Label htmlFor="fixed">{t('lbl_fixed_amount')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {calculationMethod === 'percentage' ? (
                                    <div>
                                        <Label htmlFor="increment_percentage">Increment Percentage (%)</Label>
                                        <Input
                                            id="increment_percentage"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={data.increment_percentage || ''}
                                            onChange={(e) => setData('increment_percentage', parseFloat(e.target.value) || undefined)}
                                            placeholder={t('ph_enter_percentage_eg_105')}
                                        />
                                        {errors.increment_percentage && (
                                            <p className="text-sm text-red-600 mt-1">{errors.increment_percentage}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="increment_amount">Increment Amount (SAR)</Label>
                                        <Input
                                            id="increment_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.increment_amount || ''}
                                            onChange={(e) => setData('increment_amount', parseFloat(e.target.value) || undefined)}
                                            placeholder={t('ph_enter_fixed_amount_eg_5000')}
                                        />
                                        {errors.increment_amount && (
                                            <p className="text-sm text-red-600 mt-1">{errors.increment_amount}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="effective_date">{t('lbl_effective_date')}</Label>
                                    <Input
                                        id="effective_date"
                                        type="date"
                                        value={data.effective_date}
                                        onChange={(e) => setData('effective_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.effective_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.effective_date}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Salary Calculation Preview */}
                        {selectedEmployee && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Salary Calculation Preview
                                    </CardTitle>
                                    <CardDescription>
                                        Preview of the new salary breakdown
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Current Salary */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">{t('current_salary')}</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Base Salary:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_base)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Food Allowance:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_food)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Housing Allowance:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_housing)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Transport Allowance:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_transport)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium border-t pt-2">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* New Salary - Only show when increment values are provided */}
                                        {(data.increment_percentage || data.increment_amount) && (
                                            <>
                                                <div>
                                                    <h4 className="font-medium text-green-900 mb-3">{t('new_salary')}</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Base Salary:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_base)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Food Allowance:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_food)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Housing Allowance:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_housing)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Transport Allowance:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_transport)}</span>
                                                        </div>
                                                        <div className="flex justify-between font-medium border-t pt-2">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_total)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Increase Summary */}
                                                <div>
                                                    <h4 className="font-medium text-blue-900 mb-3">{t('increase_summary')}</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Increase Amount:</span>
                                                            <span className="text-green-600 font-medium">
                                                                +{formatCurrency(calculatedSalary.increase_amount)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Increase Percentage:</span>
                                                            <span className="text-green-600 font-medium">
                                                                +{(isNaN(calculatedSalary.increase_percentage) ? 0 : calculatedSalary.increase_percentage).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Monthly Impact:</span>
                                                            <span className="text-blue-600 font-medium">
                                                                +{formatCurrency(calculatedSalary.increase_amount)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Annual Impact:</span>
                                                            <span className="text-blue-600 font-medium">
                                                                +{formatCurrency(calculatedSalary.increase_amount * 12)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reason and Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Justification</CardTitle>
                                <CardDescription>
                                    Provide reason and additional notes for this increment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="reason">{t('lbl_reason_for_increment')}</Label>
                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder={t('ph_explain_the_reason_for_this_salary_increment')}
                                        rows={3}
                                    />
                                    {errors.reason && (
                                        <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder={t('ph_any_additional_notes_or_comments')}
                                        rows={2}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-600 mt-1">{errors.notes}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link href={route('salary-increments.index')}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Salary Increment'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
















