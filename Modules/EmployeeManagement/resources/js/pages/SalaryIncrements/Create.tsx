import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calculator } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    base_salary: string; // Changed to string to match original file
    food_allowance: string; // Changed to string to match original file
    housing_allowance: string; // Changed to string to match original file
    transport_allowance: string; // Changed to string to match original file
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
    // Add calculated salary fields for backend
    new_base_salary?: number;
    new_food_allowance?: number;
    new_housing_allowance?: number;
    new_transport_allowance?: number;
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
        new_base_salary: undefined,
        new_food_allowance: undefined,
        new_housing_allowance: undefined,
        new_transport_allowance: undefined,
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
            const employee = employees.find((emp) => emp.id.toString() === data.employee_id);
            setSelectedEmployee(employee || null);

            // Debug: Log the selected employee data
            console.log('Selected employee:', employee);
            console.log('All employees data:', employees);
            if (employee) {
                console.log('Employee salary data:', {
                    base_salary: employee.base_salary,
                    food_allowance: employee.food_allowance,
                    housing_allowance: employee.housing_allowance,
                    transport_allowance: employee.transport_allowance
                });
                console.log('Employee object keys:', Object.keys(employee));
            }
        }
    }, [data.employee_id, employees]);

    // Add useEffect to recalculate on all relevant changes
    useEffect(() => {
        if (selectedEmployee) {
            console.log('Recalculating salary for employee:', selectedEmployee);
            calculateNewSalary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployee, data.increment_percentage, data.increment_amount, data.increment_type]);

    const calculateNewSalary = () => {
        if (!selectedEmployee) return;

        console.log('Starting salary calculation for employee:', selectedEmployee);

        // Check if the employee has the expected salary fields
        const hasBaseSalary = 'base_salary' in selectedEmployee;
        const hasFoodAllowance = 'food_allowance' in selectedEmployee;
        const hasHousingAllowance = 'housing_allowance' in selectedEmployee;
        const hasTransportAllowance = 'transport_allowance' in selectedEmployee;

        console.log('Salary field availability:', {
            hasBaseSalary,
            hasFoodAllowance,
            hasHousingAllowance,
            hasTransportAllowance
        });

        // Ensure all salary components are valid numbers (convert strings to numbers)
        const baseSalary = parseFloat(selectedEmployee.base_salary) || 0;
        const foodAllowance = parseFloat(selectedEmployee.food_allowance) || 0;
        const housingAllowance = parseFloat(selectedEmployee.housing_allowance) || 0;
        const transportAllowance = parseFloat(selectedEmployee.transport_allowance) || 0;

        console.log('Parsed salary components:', {
            baseSalary,
            foodAllowance,
            housingAllowance,
            transportAllowance
        });

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

                newBase = baseSalary + data.increment_amount * baseRatio;
                newFood = foodAllowance + data.increment_amount * foodRatio;
                newHousing = housingAllowance + data.increment_amount * housingRatio;
                newTransport = transportAllowance + data.increment_amount * transportRatio;
                increasePercentage = (data.increment_amount / currentTotal) * 100;
            } else {
                // If current total is 0, add the full amount to base salary
                newBase = baseSalary + data.increment_amount;
                increasePercentage = 0;
            }
        }

        const newTotal = newBase + newFood + newHousing + newTransport;
        increaseAmount = newTotal - currentTotal;

        console.log('Calculated new salary:', {
            currentTotal,
            newTotal,
            increaseAmount,
            increasePercentage
        });

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

        // Always update form data with calculated values for all increment types
        setData({
            ...data,
            new_base_salary: newBase,
            new_food_allowance: newFood,
            new_housing_allowance: newHousing,
            new_transport_allowance: newTransport,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure calculated values are included in the submission
        const submitData = {
            ...data,
            new_base_salary: calculatedSalary.new_base,
            new_food_allowance: calculatedSalary.new_food,
            new_housing_allowance: calculatedSalary.new_housing,
            new_transport_allowance: calculatedSalary.new_transport,
        };

        post(route('salary-increments.store'), submitData);
    };

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle NaN, null, undefined values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    // Helper function to check if employee has salary data
    const hasSalaryData = (employee: Employee) => {
        const baseSalary = parseFloat(employee.base_salary) || 0;
        const foodAllowance = parseFloat(employee.food_allowance) || 0;
        const housingAllowance = parseFloat(employee.housing_allowance) || 0;
        const transportAllowance = parseFloat(employee.transport_allowance) || 0;
        return (baseSalary + foodAllowance + housingAllowance + transportAllowance) > 0;
    };

    // Get employees with salary data for debugging
    const employeesWithSalary = employees.filter(hasSalaryData);
    console.log('Employees with salary data:', employeesWithSalary.slice(0, 5).map(emp => ({
        name: emp.first_name,
        base_salary: emp.base_salary,
        total: parseFloat(emp.base_salary) + parseFloat(emp.food_allowance) + parseFloat(emp.housing_allowance) + parseFloat(emp.transport_allowance)
    })));

    return (
        <AppLayout
            title={t('ttl_create_salary_increment')}
            breadcrumbs={[{ label: 'Salary Increments', href: route('salary-increments.index') }, { label: 'Create' }]}
        >
            <div className="mb-6 flex items-center gap-4">
                <Link href={route('salary-increments.index')}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-xl leading-tight font-semibold text-gray-800">{t('ttl_create_salary_increment')}</h2>
            </div>
            <Head title={t('ttl_create_salary_increment')} />

            <div className="py-12">
                <div className="sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Employee Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('employee_information')}</CardTitle>
                                <CardDescription>Select the employee for salary increment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="employee_id">Employee</Label>
                                    <Select
                                        value={data.employee_id}
                                        onValueChange={(value) => {
                                            setData('employee_id', value);
                                            const employee = employees.find((emp) => emp.id.toString() === value);
                                            setSelectedEmployee(employee || null);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_an_employee')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => {
                                                const totalSalary = parseFloat(employee.base_salary) + parseFloat(employee.food_allowance) + parseFloat(employee.housing_allowance) + parseFloat(employee.transport_allowance);
                                                return (
                                                    <SelectItem
                                                        key={employee.id}
                                                        value={employee.id.toString()}
                                                        className={hasSalaryData(employee) ? 'bg-green-50' : ''}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {employee.first_name} {employee.last_name} - {employee.employee_id}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {employee.department?.name || 'No Department'} • {formatCurrency(totalSalary)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>}
                                </div>

                                {!selectedEmployee && (
                                    <div className="text-sm text-red-600 font-medium mt-2">
                                        Please select an employee to continue.
                                    </div>
                                )}

                                {selectedEmployee && (
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h4 className="mb-2 font-medium">{t('current_employee_details')}</h4>
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
                                <CardDescription>Specify the increment type and amount</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <fieldset disabled={!selectedEmployee} className={!selectedEmployee ? 'opacity-50 pointer-events-none' : ''}>
                                    <div>
                                        <Label htmlFor="increment_type">{t('lbl_increment_type')}</Label>
                                        <Select
                                            value={data.increment_type}
                                            onValueChange={(value) => {
                                                setData('increment_type', value);
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
                                                {incrementTypes && typeof incrementTypes === 'object' ? (
                                                    Object.entries(incrementTypes).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {value}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-types" disabled>
                                                        No increment types available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.increment_type && <p className="mt-1 text-sm text-red-600">{errors.increment_type}</p>}
                                    </div>
                                    <div>
                                        <Label>{t('lbl_calculation_method')}</Label>
                                        <div className="mt-2 flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="percentage"
                                                    name="calculationMethod"
                                                    value="percentage"
                                                    checked={calculationMethod === 'percentage'}
                                                    onChange={() => {
                                                        setCalculationMethod('percentage');
                                                        setData('increment_amount', undefined);
                                                    }}
                                                />
                                                <Label htmlFor="percentage">Percentage</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="fixed"
                                                    name="calculationMethod"
                                                    value="fixed"
                                                    checked={calculationMethod === 'fixed'}
                                                    onChange={() => {
                                                        setCalculationMethod('fixed');
                                                        setData('increment_percentage', undefined);
                                                    }}
                                                />
                                                <Label htmlFor="fixed">{t('lbl_fixed_amount')}</Label>
                                            </div>
                                        </div>
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
                                            {errors.increment_percentage && <p className="mt-1 text-sm text-red-600">{errors.increment_percentage}</p>}
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
                                            {errors.increment_amount && <p className="mt-1 text-sm text-red-600">{errors.increment_amount}</p>}
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
                                        {errors.effective_date && <p className="mt-1 text-sm text-red-600">{errors.effective_date}</p>}
                                    </div>
                                </fieldset>
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
                                    <CardDescription>Preview of the new salary breakdown</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(selectedEmployee.base_salary === '0' && selectedEmployee.food_allowance === '0' && selectedEmployee.housing_allowance === '0' && selectedEmployee.transport_allowance === '0') && (
                                        <div className="mb-4 text-sm text-red-600 font-medium">
                                            Warning: This employee has no salary or allowance data set. Calculation will always be zero.
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        {/* Current Salary */}
                                        <div>
                                            <h4 className="mb-3 font-medium text-gray-900">{t('current_salary')}</h4>
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
                                                <div className="flex justify-between border-t pt-2 font-medium">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(calculatedSalary.current_total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* New Salary - Only show when increment values are provided */}
                                        {(data.increment_percentage || data.increment_amount) && (
                                            <>
                                                <div>
                                                    <h4 className="mb-3 font-medium text-green-900">{t('new_salary')}</h4>
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
                                                        <div className="flex justify-between border-t pt-2 font-medium">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(calculatedSalary.new_total)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Increase Summary */}
                                                <div>
                                                    <h4 className="mb-3 font-medium text-blue-900">{t('increase_summary')}</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Increase Amount:</span>
                                                            <span className="font-medium text-green-600">
                                                                +{formatCurrency(calculatedSalary.increase_amount)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Increase Percentage:</span>
                                                            <span className="font-medium text-green-600">
                                                                +
                                                                {(isNaN(calculatedSalary.increase_percentage)
                                                                    ? 0
                                                                    : calculatedSalary.increase_percentage
                                                                ).toFixed(2)}
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Monthly Impact:</span>
                                                            <span className="font-medium text-blue-600">
                                                                +{formatCurrency(calculatedSalary.increase_amount)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Annual Impact:</span>
                                                            <span className="font-medium text-blue-600">
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
                                <CardDescription>Provide reason and additional notes for this increment</CardDescription>
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
                                    {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
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
                                    {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
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
