import {
    AppLayout,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    getTranslation,
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
    base_salary: number;
    food_allowance: number;
    housing_allowance: number;
    transport_allowance: number;
    department: {
        name: string;
    };
    position: {
        title: string;
    };
}

interface SalaryIncrement {
    id: number;
    employee: Employee;
    increment_type: string;
    increment_percentage?: number;
    increment_amount?: number;
    current_base_salary: number;
    current_food_allowance: number;
    current_housing_allowance: number;
    current_transport_allowance: number;
    current_total_salary: number;
    new_base_salary: number;
    new_food_allowance: number;
    new_housing_allowance: number;
    new_transport_allowance: number;
    new_total_salary: number;
    effective_date: string;
    reason: string;
    notes?: string;
}

interface Props extends PageProps {
    increment: SalaryIncrement;
    employees: Employee[];
    incrementTypes: string[];
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

export default function Edit({ increment, employees, incrementTypes }: Props) {
    const { t } = useTranslation('employee');

    const { data, setData, put, processing, errors } = useForm<FormData>({
        employee_id: increment.employee.id.toString(),
        increment_type: increment.increment_type,
        increment_percentage: increment.increment_percentage,
        increment_amount: increment.increment_amount,
        effective_date: increment.effective_date,
        reason: increment.reason,
        notes: increment.notes || '',
    });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(increment.employee);
    const [calculationMethod, setCalculationMethod] = useState<'percentage' | 'fixed'>(increment.increment_percentage ? 'percentage' : 'fixed');
    const [calculatedSalary, setCalculatedSalary] = useState({
        current_base: increment.current_base_salary,
        current_food: increment.current_food_allowance,
        current_housing: increment.current_housing_allowance,
        current_transport: increment.current_transport_allowance,
        current_total: increment.current_total_salary,
        new_base: increment.new_base_salary,
        new_food: increment.new_food_allowance,
        new_housing: increment.new_housing_allowance,
        new_transport: increment.new_transport_allowance,
        new_total: increment.new_total_salary,
        increase_amount: increment.new_total_salary - increment.current_total_salary,
        increase_percentage: ((increment.new_total_salary - increment.current_total_salary) / increment.current_total_salary) * 100,
    });

    useEffect(() => {
        if (data.employee_id) {
            const employee = employees.find((emp) => emp.id.toString() === data.employee_id);
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

        const currentTotal =
            selectedEmployee.base_salary +
            selectedEmployee.food_allowance +
            selectedEmployee.housing_allowance +
            selectedEmployee.transport_allowance;

        let newBase = selectedEmployee.base_salary;
        let newFood = selectedEmployee.food_allowance;
        let newHousing = selectedEmployee.housing_allowance;
        let newTransport = selectedEmployee.transport_allowance;
        let increaseAmount = 0;
        let increasePercentage = 0;

        if (calculationMethod === 'percentage' && data.increment_percentage) {
            const percentageIncrease = data.increment_percentage / 100;
            newBase = selectedEmployee.base_salary * (1 + percentageIncrease);
            newFood = selectedEmployee.food_allowance * (1 + percentageIncrease);
            newHousing = selectedEmployee.housing_allowance * (1 + percentageIncrease);
            newTransport = selectedEmployee.transport_allowance * (1 + percentageIncrease);
            increasePercentage = data.increment_percentage;
        } else if (calculationMethod === 'fixed' && data.increment_amount) {
            // Distribute fixed amount proportionally across all components
            const baseRatio = selectedEmployee.base_salary / currentTotal;
            const foodRatio = selectedEmployee.food_allowance / currentTotal;
            const housingRatio = selectedEmployee.housing_allowance / currentTotal;
            const transportRatio = selectedEmployee.transport_allowance / currentTotal;

            newBase = selectedEmployee.base_salary + data.increment_amount * baseRatio;
            newFood = selectedEmployee.food_allowance + data.increment_amount * foodRatio;
            newHousing = selectedEmployee.housing_allowance + data.increment_amount * housingRatio;
            newTransport = selectedEmployee.transport_allowance + data.increment_amount * transportRatio;
            increasePercentage = (data.increment_amount / currentTotal) * 100;
        }

        const newTotal = newBase + newFood + newHousing + newTransport;
        increaseAmount = newTotal - currentTotal;

        setCalculatedSalary({
            current_base: selectedEmployee.base_salary,
            current_food: selectedEmployee.food_allowance,
            current_housing: selectedEmployee.housing_allowance,
            current_transport: selectedEmployee.transport_allowance,
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
        put(route('salary-increments.update', increment.id));
    };

    const formatCurrency = (amount: number | null | undefined) => {
        // Handle null, undefined, or NaN values
        const validAmount = amount == null || isNaN(Number(amount)) ? 0 : Number(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
        }).format(validAmount);
    };

    return (
        <AppLayout
            title={t('ttl_edit_salary_increment')}
            breadcrumbs={[
                { label: 'Salary Increments', href: route('salary-increments.index') },
                { label: 'View', href: route('salary-increments.show', increment.id) },
                { label: 'Edit' },
            ]}
        >
            <div className="mb-6 flex items-center gap-4">
                <Link href={route('salary-increments.show', increment.id)}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-xl leading-tight font-semibold text-gray-800">{t('ttl_edit_salary_increment')}</h2>
            </div>
            <Head title={t('ttl_edit_salary_increment')} />

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
                                    <Select value={data.employee_id} onValueChange={(value) => setData('employee_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_an_employee')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.first_name} {employee.last_name} - {employee.employee_id}
                                                    <span className="ml-2 text-sm text-gray-500">({getTranslation(employee.department.name)})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.employee_id && <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>}
                                </div>

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
                                                <span className="ml-2 font-medium">{getTranslation(selectedEmployee.department.name)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Position:</span>
                                                <span className="ml-2 font-medium">{getTranslation(selectedEmployee.position.name)}</span>
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
                                <div>
                                    <Label htmlFor="increment_type">{t('lbl_increment_type')}</Label>
                                    <Select value={data.increment_type} onValueChange={(value) => setData('increment_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_increment_type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {incrementTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type.replace('_', ' ').toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.increment_type && <p className="mt-1 text-sm text-red-600">{errors.increment_type}</p>}
                                </div>

                                <div>
                                    <Label>{t('lbl_calculation_method')}</Label>
                                    <div className="mt-2 flex gap-6">
                                        <div className="flex items-center space-x-2">
                                            <input type="radio" id="percentage" name="calculationMethod" value="percentage" checked={calculationMethod === 'percentage'} onChange={() => { setCalculationMethod('percentage'); setData('increment_amount', undefined); }} />
                                            <Label htmlFor="percentage">Percentage</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="radio" id="fixed" name="calculationMethod" value="fixed" checked={calculationMethod === 'fixed'} onChange={() => { setCalculationMethod('fixed'); setData('increment_percentage', undefined); }} />
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
                                        <Label htmlFor="increment_amount">Increment Amount ($)</Label>
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
                            </CardContent>
                        </Card>

                        {/* Salary Calculation Preview */}
                        {selectedEmployee && (data.increment_percentage || data.increment_amount) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Salary Calculation Preview
                                    </CardTitle>
                                    <CardDescription>Preview of the new salary breakdown</CardDescription>
                                </CardHeader>
                                <CardContent>
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

                                        {/* New Salary */}
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
                                                        +{calculatedSalary.increase_percentage.toFixed(2)}%
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
                            <Link href={route('salary-increments.show', increment.id)}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Salary Increment'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
