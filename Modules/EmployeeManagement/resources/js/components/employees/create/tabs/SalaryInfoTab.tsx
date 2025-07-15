import { Alert, Button, Card, CardContent, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@/Core';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface SalaryInfoData {
    hourly_rate: number;
    basic_salary: number;
    food_allowance?: number;
    housing_allowance?: number;
    transport_allowance?: number;
    absent_deduction_rate?: number;
    advance_payment?: number;
    overtime_rate_multiplier?: number;
    overtime_fixed_rate?: number;
    other_allowance?: number;
    mobile_allowance?: number;
    bank_name?: string;
    bank_account_number?: string;
    bank_iban?: string;
}

interface SalaryInfoTabProps<TFormValues extends FieldValues = SalaryInfoData> {
    form: ReturnType<typeof useForm<TFormValues>>;
    data?: SalaryInfoData;
    onSaveDraft?: (data: SalaryInfoData) => void;
    isSubmitting?: boolean;
}

export default function SalaryInfoTab<TFormValues extends FieldValues = SalaryInfoData>({
    form,
    data,
    onSaveDraft,
    isSubmitting,
}: SalaryInfoTabProps<TFormValues>) {
    const [showAllowances, setShowAllowances] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const isUpdating = useRef(false);

    const { t } = useTranslation('employee');

    // Calculate current month days
    const getCurrentMonthDays = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    };

    // Calculate absent deduction rate
    const calculateAbsentDeductionRate = (basicSalary: number) => {
        if (!basicSalary) return 0;
        const currentMonthDays = getCurrentMonthDays();
        return Number((basicSalary / currentMonthDays / 8).toFixed(2));
    };

    // Watch basic salary changes
    useEffect(() => {
        const subscription = form.watch((formValues, { name, type }) => {
            // Prevent recursion by checking if we're already updating
            if (isUpdating.current) return;

            try {
                isUpdating.current = true;

                const basicSalary = formValues.basic_salary;
                if (basicSalary !== undefined && name === 'basic_salary') {
                    const absentDeductionRate = calculateAbsentDeductionRate(Number(basicSalary));
                    form.setValue('absent_deduction_rate', absentDeductionRate, { shouldValidate: false });
                }

                const fixedRate = formValues.overtime_fixed_rate;
                if (fixedRate !== undefined && name === 'overtime_fixed_rate') {
                    if (!fixedRate) {
                        form.setValue('overtime_rate_multiplier', 1.5 as any, { shouldValidate: false });
                    } else if (Number(fixedRate) > 0) {
                        form.setValue('overtime_rate_multiplier', 0 as any, { shouldValidate: false });
                    }
                }
            } finally {
                isUpdating.current = false;
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    // Handle form submission
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSaveDraft) {
            onSaveDraft(form.getValues() as SalaryInfoData);
        }
    };

    // Define fallback translations
    const translations = {
        salary_information: t('salary_information'),
        basic_salary: t('basic_salary'),
        hourly_rate: t('hourly_rate'),
        lbl_overtime_rate_multiplier: t('lbl_overtime_rate_multiplier'),
        overtime_fixed_rate: t('overtime_fixed_rate'),
        food_allowance: t('food_allowance'),
        housing_allowance: t('housing_allowance'),
        transport_allowance: t('transport_allowance'),
        advance_payment: t('advance_payment'),
        absent_deduction_rate: t('absent_deduction_rate'),
        additional_allowances: t('additional_allowances'),
        other_allowance: t('other_allowance'),
        mobile_allowance: t('mobile_allowance'),
        bank_details: t('bank_details'),
        bank_name: t('bank_name'),
        lbl_bank_account_number: t('lbl_bank_account_number'),
        lbl_bank_iban: t('lbl_bank_iban'),
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations.salary_information}</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <div>Information</div>
                    <div>These fields are optional. You can update them later after creating the employee.</div>
                </Alert>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="basic_salary"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.basic_salary}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hourly_rate"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.hourly_rate}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="overtime_rate_multiplier"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.lbl_overtime_rate_multiplier}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="overtime_fixed_rate"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.overtime_fixed_rate}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="food_allowance"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.food_allowance}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="housing_allowance"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.housing_allowance}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="transport_allowance"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.transport_allowance}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="advance_payment"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.advance_payment}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="absent_deduction_rate"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{translations.absent_deduction_rate}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="col-span-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex w-full items-center justify-between"
                        onClick={() => setShowAllowances(!showAllowances)}
                    >
                        <span>{translations.additional_allowances}</span>
                        {showAllowances ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {showAllowances && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="other_allowance"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{translations.other_allowance}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                            min={0}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mobile_allowance"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{translations.mobile_allowance}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                            min={0}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="col-span-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex w-full items-center justify-between"
                        onClick={() => setShowBankDetails(!showBankDetails)}
                    >
                        <span>{translations.bank_details}</span>
                        {showBankDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {showBankDetails && (
                    <div className="grid grid-cols-1 gap-6">
                        <FormField
                            control={form.control}
                            name="bank_name"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{translations.bank_name}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter bank name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bank_account_number"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{translations.lbl_bank_account_number}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter bank account number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bank_iban"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{translations.lbl_bank_iban}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter bank IBAN" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {onSaveDraft && (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
